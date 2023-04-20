/*global chrome*/

import './App.css';
import React, { useEffect } from 'react'
import AppContainer from './components/appContainer';
import { Panel } from 'primereact/panel'
import DevToolsDebugClient from './scripts/client/devToolsDebugClient.js'
import { requestScriptInjection } from './scripts/client/requestScriptInjection';


import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

function App() {
  console.log('Starting App.')
  const Client = new DevToolsDebugClient();
  if (!Client.messageHandlersInitialized) Client.registerListeners()

  useEffect(() => {
    console.log('App: useEffect.')
    requestScriptInjection(Client.backgroundPageConnection, "addDomListeners");
    requestScriptInjection(Client.backgroundPageConnection, "getFunctionList");

  });

  return (
    <div className="App">
      <Panel header="Funtion Monitor Extension">
        <AppContainer Client={Client} backgroundConnection={Client.backgroundPageConnection}></AppContainer>
      </Panel>
    </div>

  );
}

export default App;
