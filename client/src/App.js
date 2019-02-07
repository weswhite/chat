import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(){
    super()
  }

  componentDidMount(){
    const uri = 'ws://' + 'localhost:3030' + '/chat';
    const ws = new WebSocket(uri)

    //ws.onmessage(msg => console.log(msg))
  }

  render() {
    return (
      <div className="App">
          <div className="msg-box">
          </div>
          <input className="msg" />
      </div>
    );
  }
}

export default App;
