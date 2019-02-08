import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(){
    super()
    this.state = {msg: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({msg: event.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    this.socket.send(this.state.msg)
  }

  onSocketOpen(){
    console.log('Connected')
  }

  componentDidMount(){
    const uri = 'ws://' + 'localhost:3030' + '/chat';
    this.socket = new WebSocket(uri)

    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (msg) => this.onSocketData(msg)
  }

  render() {
    return (
      <div className="App">
          <div className="msg-box">
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={this.state.msg} onChange={this.handleChange}/>
            <button type="submit">SEND</button>
          </form>
      </div>
    );
  }
}

export default App;
