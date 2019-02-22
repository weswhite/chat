import React, { useState, useEffect, createContext } from 'react'
import { Route, Switch } from 'react-router-dom'

import './App.css'
import Server from './server/Server'
import Chat from './chat/Chat'

export const ServerContext = createContext(['', () => {}])
export const NameContext = createContext(['', () => {}])

function App() {
  const [server, setServer] = useState('')
  useEffect(() => console.log('server: ',server), [server])

  const [name, setName] = useState('')
  
  return (
    <ServerContext.Provider value={[server, setServer]}>
      <NameContext.Provider value={[name, setName]}>
        <Route exact path="/" component={Server}/>
        <Route path="/chat" component={Chat} />
      </NameContext.Provider>
    </ServerContext.Provider>
  )
}
export default App;
