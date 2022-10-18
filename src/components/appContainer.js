import './appContainer.css'
import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import { useState } from "react";
import { wait } from '../scripts/helpers.js';
/*global chrome*/
export default function AppContainer(props) {
  const [buttonStatus, setButtonStatus] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({ functionName: 'TestFn', functionParentPath: 'window.TestObj' })
  const [invocations, setInvocations] = useState([])
  const client = props.client

  const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {
      if (message.type == 'WINDOW_LOADED' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
        if (client.enableWrapOnPageLoad == true) {
          await wait(1000)
          await client.wrapFunction(client.fnPath)
          setFunctionInfo({ functionName: client.fnName, functionParentPath: client.fnParentPath })
          setButtonStatus(client.isFnWrapped ? 'active' : 'inactive')
        }
        sendResponse(client.getState())
      } else if (message.type == 'FUNCTION_CALL_DETAILS'){
        console.log('FUNCTION CALL DETAILS:')
        console.log(message.data)
        sendResponse()
      }

      
    })()
    return true
  }
if(!client.windowLoaded){
  chrome.runtime.onMessage.addListener(onMessageHandler)
  console.log('Adding window loaded listener.')
  client.windowLoaded =true
} 

  const toggleClickHandler = async () => {
    await client.toggleFunctionWrapper();
    setButtonStatus(client.isFnWrapped ? 'active' : 'inactive')
    setFunctionInfo({ functionName: client.fnName, functionParentPath: client.fnParentPath })
  }
  return (
    <div className="App-body-container">
      <ToggleWrapperButton clickHandler={toggleClickHandler} buttonStatus={buttonStatus}></ToggleWrapperButton>
      <FunctionInfoPanel functionName={functionInfo.functionName} functionParentPath={functionInfo.functionParentPath}></FunctionInfoPanel>

    </div>)
}