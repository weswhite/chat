import React, { useState, useRef, useContext, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import NotificationSystem from 'react-notification-system'
import useReactRouter from 'use-react-router'
import axios from 'axios'

import ServerBrowser from '../server-browser/ServerBrowser'
import { NameContext, ServerContext } from '../App'

function Server() {
  const { history, location, match } = useReactRouter()
  const [name, setName] = useContext(NameContext)
  const [server, setServer] = useContext(ServerContext)
  const [servers, setServers] = useState([])
  
  const ns = useRef()

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleServerChange = (e) => {
    setServer({name: e.target.value, id: 0})
  }

  useEffect(() => {
    fetch('http://localhost:3030/servers', {
      method: 'GET',
      mode: "cors",
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(response => response.json())
      .then(data => setServers(data))
      .catch(error => console.error(error))
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    if(server.name !== undefined){
      axios.post('/servers', {
        ...server
      })
      .then(function (response) {
        //show a loading indicator here
        console.log(response);
        history.push('./chat')
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
      const notification = ns.current;
      notification.addNotification({
        message: 'Please enter a display name',
        level: 'error',
        position: "bc"
      });
    }
  }

  return (
    <div className="App">
      <h1>Rust Chat</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="enter display name" type="text" value={name} onChange={handleNameChange}/>
        <input placeholder="enter a server name" type="text" value={server.name} onChange={handleServerChange}/>
        <NotificationSystem ref={ns} />
        <button type="submit">CREATE SERVER</button>
      </form>
      <ServerBrowser servers={servers}></ServerBrowser>
    </div>
  )
}

export default Server;
