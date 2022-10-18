import './appContainer.css'
import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import React, { useState } from "react";
import { wait } from '../scripts/helpers.js';
import PrimeTest from './primeTest.js'

/*global chrome*/

export default function AppContainer(props) {
  const [buttonStatus, setButtonStatus] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({ fnName: 'TestFn', fnParentPath: 'window.TestObj' })
  const [invocations, setInvocations] = useState([])
  const client = props.client


  const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {
      if (message.type == 'WINDOW_LOADED' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
        if (client.enableWrapOnPageLoad == true) {
          //Should add setting for wait settings
          await wait(1000)
          await client.wrapFunction(client.fnPath)
          updateStateFromClientDetails()
        }
        sendResponse(client.getState())
      } else if (message.type == 'FUNCTION_CALL_DETAILS') {
        console.log('FUNCTION CALL DETAILS:')
        console.log(message.data)
        sendResponse()
      } else if (message.type == 'BEFORE_NAVIGATE') {
        console.log('Before Navigate')
        if (client.enableWrapOnPageLoad && client.isFnWrapped) setButtonStatus('pending')
        sendResponse()
      }


    })()
    return true
  }
  const updateStateFromClientDetails = () => {
    setFunctionInfo({ fnName: client.fnDetails.name, fnParentPath: client.fnDetails.parentPath })
    setButtonStatus(client.isFnWrapped ? 'active' : 'inactive')
  }

  if (!client.windowLoaded) {
    chrome.runtime.onMessage.addListener(onMessageHandler)
    client.windowLoaded = true
    console.log('Adding window loaded listener.')
  }

  const toggleClickHandler = async () => {
    await client.toggleFunctionWrapper();
    updateStateFromClientDetails()
  }
  return (
    <div className="App-body-container">
      <ToggleWrapperButton clickHandler={toggleClickHandler} buttonStatus={buttonStatus}></ToggleWrapperButton>
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <PrimeTest></PrimeTest>
    </div>)
}