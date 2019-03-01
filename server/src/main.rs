#[macro_use]
extern crate log;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate warp;
extern crate rand;

use rand::Rng;

use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc, Mutex,
};

use futures::sync::mpsc;
use futures::{Future, Stream};
use warp::ws::{Message, WebSocket};

use warp::{http::StatusCode, Filter};

type Db = Arc<Mutex<Vec<Server>>>;

#[derive(Debug, Deserialize, Serialize)]
struct Server {
    id: String,
    name: String
}

#[derive(Debug, Deserialize, Serialize)]
struct ChatMessage {
    text: String,
    name: String,
    id: String,
    server: String
}

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
type Users = Arc<Mutex<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

fn main() {
    let users = Arc::new(Mutex::new(HashMap::new()));
    let users = warp::any().map(move || users.clone());

    let db = Arc::new(Mutex::new(Vec::<Server>::new()));
    let db = warp::any().map(move || db.clone());

    let servers = warp::path("servers");
    let servers_index = servers.and(warp::path::end());
    let json_body = warp::body::content_length_limit(1024 * 16).and(warp::body::json());

    let list = warp::get2()
        .and(servers_index)
        .and(db.clone())
        .map(list_servers);

    let create = warp::post2()
        .and(servers_index)
        .and(json_body)
        .and(db.clone())
        .and_then(create_server);

    let chat = warp::path("chat")
        .and(warp::ws2())
        .and(users)
        .map(|ws: warp::ws::Ws2, users| {
            ws.on_upgrade(move |socket| user_connected(socket, users))
        });

    let api = list.or(create).or(chat);
    let routes = api.with(warp::log("servers"));

    warp::serve(routes).run(([127, 0, 0, 1], 3030));
}

fn user_connected(ws: WebSocket, users: Users) -> impl Future<Item = (), Error = ()> {
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    eprintln!("new chat user: {}", my_id);

    let (user_ws_tx, user_ws_rx) = ws.split(); //split sender vs rx

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = mpsc::unbounded();
    warp::spawn(
        rx.map_err(|()| -> warp::Error { unreachable!("unbounded rx never errors") })
            .forward(user_ws_tx)
            .map(|_tx_rx| ())
            .map_err(|ws_err| eprintln!("websocket send error: {}", ws_err)),
    );

    // Save the sender in our list of connected users.
    users.lock().unwrap().insert(my_id, tx);

    // Make an extra clone to give to our disconnection handler...
    let users2 = users.clone();
    //for each rx
    user_ws_rx
        .for_each(move |msg| {
            user_message(my_id, msg, &users);
            Ok(())
        })
        .then(move |result| {
            user_disconnected(my_id, &users2);
            result
        })
        .map_err(move |e| {
            eprintln!("websocket error(uid={}): {}", my_id, e);
        })
}

fn user_message(my_id: usize, msg: Message, users: &Users) {
    // Skip any non-Text messages...
    println!("message for rx foreach: {:?}", msg);
    //here i am assuming the msg is just a string
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    //create the message
    //TODO: Make this into an object and not just a string
    let new_msg = format!("User#{}: {}", my_id, msg);
    eprintln!("new msg: {}", new_msg);
    // New message from this user, send it to everyone else (except same uid)...
    //
    // We use `retain` instead of a for loop so that we can reap any user that
    // appears to have disconnected.
    for (&uid, tx) in users.lock().unwrap().iter() {
        if my_id != uid {
            match tx.unbounded_send(Message::text(new_msg.clone())) {
                Ok(()) => (),
                Err(_disconnected) => {
                    
                }
            }
        }
    }
}

fn user_disconnected(my_id: usize, users: &Users) {
    eprintln!("good bye user: {}", my_id);

    // Stream closed up, so remove from the user list
    users.lock().unwrap().remove(&my_id);
}

fn list_servers(db: Db) -> impl warp::Reply {
    warp::reply::json(&*db.lock().unwrap())
}

fn create_server(mut create: Server, db: Db) -> Result<impl warp::Reply, warp::Rejection> {
    debug!("create_server: {:?}", create);

    if create.id == "0" {
        let mut rng = rand::thread_rng();
        create.id = rng.gen::<u32>().to_string();
    }

    let mut vec = db.lock().unwrap();

    for server in vec.iter() {
        if server.id == create.id {
            debug!("    -> id already exists: {}", create.id);
            return Ok(StatusCode::BAD_REQUEST);
        }
    }

    vec.push(create);
    Ok(StatusCode::CREATED)
}