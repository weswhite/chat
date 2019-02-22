import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './components/App'


const routing = (
  <BrowserRouter>
    <Route  path="/" component={App} />
  </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));
