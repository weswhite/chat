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
    this.setState({msg: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.msg);
    event.preventDefault();
  }

  componentDidMount(){
    const uri = 'ws://' + 'localhost:3030' + '/chat';
    var ws = new WebSocket(uri)

    var msg = {
      type: "message",
      text: "test",
      id:   1,
      date: Date.now()
    };
    //ws.onopen( event => ws.send(msg))

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
