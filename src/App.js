import './App.css';


import DevToolsDebugClient from './scripts/devToolsDebugClient.js'
import AppContainer from './components/appContainer';

function App() {
  //Try passing client as a prop to a subcomponent
  const devToolsClient = new DevToolsDebugClient("window.__attentive.trigger")


  return (
    <div className="App">
      <header className="App-header">
        <h4>
          Funtion Monitor Extension
        </h4>
      </header>
      <AppContainer client = {devToolsClient}></AppContainer>
    </div>
  );
}

export default App;
