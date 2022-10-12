import './App.css';
import { useState } from "react";
import ToggleWrapperButton from './components/button.js';
import FunctionInfoPanel from './components/functionInfoPanel.js';
import DevToolsDebugClient from './scripts/devToolsDebugClient.js'


function App() {
  const [buttonState, setButtonState] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({functionName: 'TestFn', functionParentPath:'window.TestObj'})
  //const devToolsClient = new DevToolsDebugClient
  function clickHandler() {
    console.log('Handling click')
    if (buttonState === 'inactive') setButtonState("pending")
    if (buttonState ==='pending') setButtonState("active")
    if (buttonState === 'active') setButtonState("inactive")
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Funtion Monitor Extension
        </h1>

        <div className="App-body-container">
<ToggleWrapperButton clickHandler = {clickHandler} buttonStatus = {buttonState}></ToggleWrapperButton>
<FunctionInfoPanel functionName = {functionInfo.functionName}  functionParentPath={functionInfo.functionParentPath}></FunctionInfoPanel>

        </div>
      </header>
    </div>
  );
}

export default App;
