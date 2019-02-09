import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(){
    super()
    this.state = {
      msg: '',
      messages: []
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({msg: event.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const message = "Me: " + this.state.msg
    this.socket.send(this.state.msg)
    this.setState((state) => {
      return {
        messages: [...state.messages, message],
        msg: ''
      }
    })
  }

  onSocketOpen(){
    console.log('Connected')
  }

  onMessageReceived(msg){
    this.setState((state) => {
      return {messages: [...state.messages, msg.data]}
    })
  }

  componentDidMount(){
    const uri = 'ws://' + 'localhost:3030' + '/chat';
    this.socket = new WebSocket(uri)

    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (msg) => this.onMessageReceived(msg)
  }

  render() {
    const msgs = this.state.messages.map((m, i) => 
      (
          <li key={i} >
              {m}
          </li>
      ))
    return (
      <div className="App">
          <div className="msg-box">
            <ul>{msgs}</ul>
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={this.state.msg} onChange={this.handleChange}/>
            <button type="submit">SEND</button>
          </form>
      </div>
    )
  }
}

export default App;
