import React, { useState, useEffect, useRef, useContext } from 'react'

import { ServerContext } from '../../context/server-context'
import './Chat.css'

const uri = 'ws://localhost:3030/chat'
const socket =  new WebSocket(uri)

function Chat() {
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([])
  const server = useContext(ServerContext)
  const msgBox = useRef()

  const handleChange = (e) => {
    setMsg(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.send(JSON.stringify({text: msg, room: 1}))
    const message = {text: "Me: " + msg, sender: 'client'}
    setMsg('')
    setMessages((state) => [...state, message])
    msgBox.current.scrollTop = msgBox.current.scrollHeight
  }

  const onMessageReceived = (msg) => {
    const message = {text: msg, sender: 'server'}
    setMessages((state) => [...state, message])
    msgBox.current.scrollTop = msgBox.current.scrollHeight
  }

  useEffect(() => {
    socket.onmessage = (msg) => onMessageReceived(msg.data)
  }, []);

  return (
    <div className="Chat">
        <div ref={msgBox} className="msg-box">
          <ul >
            {messages.map((m, i) => (
              <li className={(m.sender === 'client') ? 'client-msg' : 'server-msg'}  key={i} >
                  {m.text}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSubmit}>
          <input className="send-chat-input" type="text" value={msg} onChange={handleChange}/>
          <button className="send-chat-button" type="submit">SEND</button>
        </form>
    </div>
  )
}

export default Chat