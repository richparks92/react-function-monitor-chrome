import './App.css';
import React, {useEffect} from 'react'


import DevToolsDebugClient from './scripts/devToolsDebugClient.js'
import AppContainer from './components/appContainer';
import { Panel } from 'primereact/panel'
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

/*global chrome*/

function App() {
  //Try passing client as a prop to a subcomponent
  const devToolsClient = new DevToolsDebugClient("window.__attentive.trigger")

  useEffect(()=>{
    //Get window variable 
    chrome.runtime.sendMessage({type: 'INJECT_SCRIPT_TO_TAB', 
    tabId: chrome.devtools.inspectedWindow.tabId, 
    scriptFiles: ['/chrome-pages/content-scripts/addFunctionCallListener.js']})

    setTimeout(()=>{
      console.log('Sending message to inject getFunctionList script.')
      chrome.runtime.sendMessage({type: 'INJECT_SCRIPT_TO_TAB', 
      tabId: chrome.devtools.inspectedWindow.tabId, 
      scriptFiles: ['/chrome-pages/content-scripts/getFunctionList.js'],
      executeInMainWorld: true
      })

    }, 250)

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
