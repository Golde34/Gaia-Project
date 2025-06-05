import React from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'

import { checkLocalStorage } from './kernels/utils/set-interval'
import RenderRouter from './kernels/routers'
import { MultiWSProvider } from './kernels/context/MultiWSContext'
import { config } from './kernels/configs/configuration';


function App() {
  let interval = 60 * 60 * 1000;
  checkLocalStorage(interval);

  // WebSocket connection
  const endpoints = {
    notification: `ws://${config.notifyAgentWSHost}/ws`,
    chat: `ws://${config.chatHubWSHost}/ws`,
  }

  return (
    <>
      <MultiWSProvider endpoints={endpoints}>
        <BrowserRouter basename='/client-gui'>
          <RenderRouter />
        </BrowserRouter>
      </MultiWSProvider >
    </>
  )
}

export default App;
