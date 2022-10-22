import './appContainer.css'
import React, { useState } from "react";
import  initializeHandlers from '../scripts/initializeHandlers.js';

import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import InvocationsList from './invocationsList';
import FunctionForm from './functionForm';

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
  //Initialize handlers, passing client and state update functions as argument
  initializeHandlers(client, updateStateFromClientDetails, setPending)

  const toggleClickHandler = async () => {
    await client.toggleFunctionWrapper();
    updateStateFromClientDetails()
  }
  return (
    <div className="App-body-container">
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <ToggleWrapperButton clickHandler={toggleClickHandler} buttonStatus={buttonStatus}></ToggleWrapperButton>
      <InvocationsList invocationRecords={invocationRecords}></InvocationsList>
    <FunctionForm></FunctionForm>
    </div>)
}