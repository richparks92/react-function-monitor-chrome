import './css/appContainer.css'
import React, { useState, useEffect } from "react";
import initializeHandlers from '../scripts/initializeHandlers.js';
import { evaluateExpressionAsync } from '../scripts/debuggerMethods.js'
import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import InvocationsList from './invocationsList';
import FunctionForm from './functionForm';

/*global chrome*/

export default function AppContainer(props) {
  const [buttonStatus, setButtonStatus] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({ fnName: 'TestFn', fnParentPath: 'window.TestObj' })
  const [invocationRecords, setInvocationRecords] = useState([])
  const [windowObject, setWindowObject] = useState()

  const client = props.client
  //Get window variable 
  useEffect(async () => {
    const currWindow = await evaluateExpressionAsync('window')
    setWindowObject(currWindow)
  })

  //These methods are passed to the event handlers
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