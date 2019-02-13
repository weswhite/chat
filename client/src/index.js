import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'

import './index.css'
import App from './components/App'


const routing = (
  <Router>
    <Route  path="/" component={App} />
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'));
