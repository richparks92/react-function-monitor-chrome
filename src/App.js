import './App.css';
import React, { useEffect } from 'react'


import DevToolsDebugClient from './scripts/devToolsDebugClient.js'
import sendInjectMessages from './scripts/sendInjectMessages';

import AppContainer from './components/appContainer';
import { Panel } from 'primereact/panel'
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

/*global chrome*/

function App() {
  //Try passing client as a prop to a subcomponent
  const devToolsClient = new DevToolsDebugClient("window.__attentive.trigger")

  useEffect(() => {
    //Get window variable 
    sendInjectMessages(devToolsClient)

  });

  return (
    <div className="App">
      <Panel header="Funtion Monitor Extension">
        <AppContainer client={devToolsClient} ></AppContainer>
      </Panel>
    </div>

  );
}

export default App;
