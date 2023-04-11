import './App.css';
import React, { useEffect } from 'react'


import DevToolsDebugClient from './scripts/devToolsDebugClient.js'
import sendInjectMessages from './scripts/sendInjectMessages';
import {getBackgroundConnection, sendInjectTestScript} from './scripts/getBackgroundConnection';

import AppContainer from './components/appContainer';
import { Panel } from 'primereact/panel'

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons


/*global chrome*/

function App() {
  const client = new DevToolsDebugClient()
  const backgroundConnection = getBackgroundConnection()
  

  useEffect(() => {
    //Get window variable 
    sendInjectMessages(client)
    sendInjectTestScript(backgroundConnection)

  });

  return (
    <div className="App">
      <Panel header="Funtion Monitor Extension">
        <AppContainer client={client} ></AppContainer>
      </Panel>
    </div>

  );
}

export default App;
