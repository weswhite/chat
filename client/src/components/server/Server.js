import React, { useState, useRef, useContext } from 'react'
import axios from 'axios'
import NotificationSystem from 'react-notification-system'

import ServerBrowser from '../server-browser/ServerBrowser'
import { ServerContext } from '../../context/server-context';

function Server() {
  const [servers, setServers] = useState([])
  const server = useContext(ServerContext)
  const ns = useRef()

  const handleChange = (e) => {
    server.updateName(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(server.name !== undefined){
      //create a new server string
      //base this for now on the index of servers 
      //this will have to be a websocket updated list over open servers
      server.updateServer(100)
      window.location.assign("/chat");
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
        <input placeholder="enter display name" type="text" value={server.name} onChange={handleChange}/>
        <NotificationSystem ref={ns} />
        <button type="submit">CREATE SERVER</button>
      </form>
      <ServerBrowser servers={servers}></ServerBrowser>
    </div>
  )
}

export default Server;
