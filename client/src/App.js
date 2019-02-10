import React, { useState, useRef } from 'react'
import NotificationSystem from 'react-notification-system'

import './App.css'
import Chat from './chat/Chat'

function App() {
  const [display, setDisplay] = useState()
  const ns = useRef()

  const handleChange = (e) => {
    setDisplay(e.target.value)

  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(display !== undefined){
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
        <input placeholder="enter display name" type="text" value={display} onChange={handleChange}/>
        <NotificationSystem ref={ns} />
        <button type="submit">CREATE SERVER</button>
      </form>
    </div>
  )
}

export default App;
