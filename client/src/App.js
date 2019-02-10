import React, { useState, useEffect } from 'react';
import './App.css';

const uri = 'ws://localhost:3030/chat';
const socket =  new WebSocket(uri)

function App() {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);

  const handleChange = (e) => {
    setMsg(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.send(msg)
    const message = {text: "Me: " + msg, sender: 'client'}
    setMsg('')
    setMessages([...messages, message])
  }

  const onMessageReceived = (msg) => {
    const message = {text: msg, sender: 'server'}
    setMessages((state) => [...state, message])
  }

  useEffect(() => {
    socket.onopen = () => this.onSocketOpen()
    socket.onmessage = (msg) => onMessageReceived(msg.data)
  }, []);

  return (
    <div className="App">
        <div className="msg-box">
          <ul >
            {messages.map((m, i) => (
              <li className={(m.sender === 'client') ? 'client-msg' : 'server-msg'}  key={i} >
                  {m.text}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" value={msg} onChange={handleChange}/>
          <button type="submit">SEND</button>
        </form>
    </div>
  )
}

export default App;
