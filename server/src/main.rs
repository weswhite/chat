#[macro_use]
extern crate log;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate warp;

use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc, Mutex,
};

use futures::sync::mpsc;
use futures::{Future, Stream};
use warp::ws::{Message, WebSocket};

use serde_json::Result;
use warp::{http::StatusCode, Filter};

type Db = Arc<Mutex<Vec<Server>>>;

#[derive(Debug, Deserialize, Serialize)]
struct Server {
    id: String
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
    // Keep track of all connected users, key is usize, value
    // is a websocket sender.
    let users = Arc::new(Mutex::new(HashMap::new()));
    // Turn our "state" into a new Filter...
    let users = warp::any().map(move || users.clone());

    let db = Arc::new(Mutex::new(Vec::<Server>::new()));
    let db = warp::any().map(move || db.clone());

    // Just the path segment "todos"...
    let servers = warp::path("servers");

    // Combined with `end`, this means nothing comes after "todos".
    // So, for example: `GET /todos`, but not `GET /todos/32`.
    let servers_index = servers.and(warp::path::end());

    // Combined with an id path parameter, for refering to a specific Server.
    // For example, `POST /servers/32`, but not `POST /servers/32/something-more`.
    let servers_id = servers.and(warp::path::param::<u64>()).and(warp::path::end());

    // When accepting a body, we want a JSON body
    // (and to reject huge payloads)...
    let json_body = warp::body::content_length_limit(1024 * 16).and(warp::body::json());

    // Next, we'll define each our endpoints:

    //i need to make an endpoint  to create servers and return an id
    //i guess that i could save them off into a db?
    //post server should return ID????

    // // `GET /servers`
    let list = warp::get2()
        .and(servers_index)
        .and(db.clone())
        .map(list_servers);

    // // `POST /server`
    let create = warp::post2()
        .and(servers_index)
        .and(json_body)
        .and(db.clone())
        .and_then(create_server);

    // GET /chat 
    let chat = warp::path("chat")
        .and(warp::ws2())
        .and(users)
        .map(|ws: warp::ws::Ws2, users| {
            ws.on_upgrade(move |socket| user_connected(socket, users))
        });

    //create socket id and return it
    //let index = warp::path::end().map(|| warp::reply::html(INDEX_HTML));

    let api = list.or(create).or(chat);
    //let routes = chat;
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

// These are our API handlers, the ends of each filter chain.
// Notice how thanks to using `Filter::and`, we can define a function
// with the exact arguments we'd expect from each filter in the chain.
// No tuples are needed, it's auto flattened for the functions.

/// GET /todos
fn list_servers(db: Db) -> impl warp::Reply {
    // Just return a JSON array of all Todos.
    warp::reply::json(&*db.lock().unwrap())
}

/// POST /todos with JSON body
fn create_server(create: Server, db: Db) -> Result<impl warp::Reply, warp::Rejection> {
    debug!("create_server: {:?}", create);

    let mut vec = db.lock().unwrap();

    for server in vec.iter() {
        if server.id == create.id {
            debug!("    -> id already exists: {}", create.id);
            // Todo with id already exists, return `400 BadRequest`.
            return Ok(StatusCode::BAD_REQUEST);
        }
    }

    // No existing Todo with id, so insert and return `201 Created`.
    vec.push(create);

    Ok(StatusCode::CREATED)
}