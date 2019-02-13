import React, { useState, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'

import { ServerContext } from '../context/server-context'
import './App.css'
import Server from './server/Server'
import Chat from './chat/Chat'

function App() {
  const [server, setServer] = useState('')
  const [name, setName] = useState('')
  const updateServer = (server) => setServer(server)
  const updateName = (name) => setName(name)
  return (
    <ServerContext.Provider value={{server: server, name: name, updateServer: updateServer, updateName: updateName}}>
      <Switch>
        <Route exact path="/" component={Server}/>
        <Route path="/chat" component={Chat} />
      </Switch>
    </ServerContext.Provider>
  )
}
export default App;
