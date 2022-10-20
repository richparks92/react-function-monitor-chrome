import './appContainer.css'
import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import React, { useState } from "react";
import { initializeHandlers } from '../scripts/helpers.js';
import InvocationsList from './invocationsList';

/*global chrome*/

export default function AppContainer(props) {
  const [buttonStatus, setButtonStatus] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({ fnName: 'TestFn', fnParentPath: 'window.TestObj' })
  const [invocationRecords, setInvocationRecords] = useState([])
  const client = props.client

  const updateStateFromClientDetails = () => {
    setFunctionInfo({ fnName: client.fnDetails.name, fnParentPath: client.fnDetails.parentPath })
    setButtonStatus(client.isFnWrapped ? 'active' : 'inactive')
    setInvocationRecords(client.invocationRecords)
  }
  const setPending = () => {
    if (client.enableWrapOnPageLoad && client.isFnWrapped) setButtonStatus('pending')
  }
  initializeHandlers(client, updateStateFromClientDetails, setPending, setInvocationRecords)

  const toggleClickHandler = async () => {
    await client.toggleFunctionWrapper();
    updateStateFromClientDetails()
  }
  return (
    <div className="App-body-container">
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <ToggleWrapperButton clickHandler={toggleClickHandler} buttonStatus={buttonStatus}></ToggleWrapperButton>
      <InvocationsList invocationRecords={invocationRecords}></InvocationsList>

    </div>)
}