import React, { useState, useRef, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import NotificationSystem from 'react-notification-system'

import ServerBrowser from '../server-browser/ServerBrowser'
import { NameContext, ServerContext } from '../App';

function Server() {
  const [name, setName] = useContext(NameContext)
  const [server, setServer] = useContext(ServerContext)
  const [servers, setServers] = useState([])
  
  const ns = useRef()

  const handleChange = (e) => {
    setName(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(server !== undefined){
      setServer(100)
      console.log('setServer called')
      return <Redirect to='/chat' />
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
        <input placeholder="enter display name" type="text" value={name} onChange={handleChange}/>
        <NotificationSystem ref={ns} />
        <button type="submit">CREATE SERVER</button>
      </form>
      <ServerBrowser servers={servers}></ServerBrowser>
    </div>
  )
}

export default Server;
