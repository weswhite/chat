import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'

import './index.css'
import App from './App'
import Chat from './chat/Chat'

const routing = (
    <Router>
      <div>
        <Route exact path="/" component={App} />
        <Route path="/chat" component={Chat} />
      </div>
    </Router>
  )

ReactDOM.render(routing, document.getElementById('root'));
