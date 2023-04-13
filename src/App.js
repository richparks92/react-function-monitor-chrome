import './App.css';
import React, { useEffect } from 'react'


import DevToolsDebugClient from './scripts/devToolsDebugClient.js'
import {getBackgroundConnection, requestScriptInjection} from './scripts/requestScriptInjection';
import AppContainer from './components/appContainer';
import { Panel } from 'primereact/panel'

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons


/*global chrome*/

function App() {
  console.log('Starting App.')
  const client = new DevToolsDebugClient()
  const backgroundConnection = getBackgroundConnection()
  

  useEffect(() => {
    //Get window variable 
    //sendInjectMessages(client)
    requestScriptInjection(backgroundConnection, "addDomListeners");
    requestScriptInjection(backgroundConnection, "getFunctionList" );

  });

  return (
    <div className="App">
      <Panel header="Funtion Monitor Extension">
        <AppContainer client={client} backgroundConnection={backgroundConnection}></AppContainer>
      </Panel>
    </div>

  );
}

export default App;
