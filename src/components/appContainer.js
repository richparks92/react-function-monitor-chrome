import './css/appContainer.css'
import React, { useState } from "react";
import initializeHandlers from '../scripts/initializeHandlers.js';
import ToggleWrapperButton from './button.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import InvocationsList from './invocationsList';
import FunctionForm from './functionForm';

/*global chrome*/

export default function AppContainer({client}) {
  const [buttonStatus, setButtonStatus] = useState('inactive')
  const [functionInfo, setFunctionInfo] = useState({ fnName: '', fnParentPath: '' })
  const [invocationRecords, setInvocationRecords] = useState([])
  const [fnArray, setFnArray] = useState([])

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
  initializeHandlers(client, updateStateFromClientDetails, setPending, setFnArray)
  client.setUpdaterFunction(updateStateFromClientDetails)

  const toggleClickHandler = async () => {
    await client.toggleFunctionWrapper();
    updateStateFromClientDetails()
  }
  return (
    <div className="App-body-container">
      <FunctionForm client = {client} fnArray={fnArray}></FunctionForm>
      <ToggleWrapperButton clickHandler={toggleClickHandler} buttonStatus={buttonStatus}></ToggleWrapperButton>
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <InvocationsList invocationRecords={invocationRecords}></InvocationsList>
      
    </div>)
}