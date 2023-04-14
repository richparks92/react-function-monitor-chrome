import './css/appContainer.css'
import React, { useState } from "react";
import {initializeMessageHandlers} from '../scripts/initializeMessageHandlers.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import FunctionForm from './functionForm';
import InvocationsList from './invocationsList';
import 'primeflex/primeflex.css';

/*global chrome*/

export default function AppContainer({ client, backgroundConnection }) {
  console.log('AppContainer loading')
  const [buttonActive, setButtonActive] = useState(false)
  const [buttonPending, setButtonPending] = useState(false)
  const [functionInfo, setFunctionInfo] = useState({ fnName: '', fnParentPath: '' })
  const [invocationRecords, setInvocationRecords] = useState([])
  const [fnSuggestionArray, setFnSuggestionArray] = useState([])

  //These methods are passed to the event handlers
  const updateStateFromClientDetails = () => {
    setFunctionInfo({ fnName: client.fnDetails.name, fnParentPath: client.fnDetails.parentPath })
    setButtonActive(client.isFnWrapped)
    setInvocationRecords(client.invocationRecords)
    console.log(`Updating UI from client. Setting button to: ${client.isFnWrapped}`)
  }

  //Initialize handlers, passing client and state update functions as argument
  const setterFunctions = {
    updateStateFromClientDetails: updateStateFromClientDetails,
    setButtonActive: setButtonActive,
    setButtonPending: setButtonPending,
    setInvocationRecords: setInvocationRecords,
    setFunctionInfo: setFunctionInfo,
    setFnSuggestionArray: setFnSuggestionArray
  }


  console.log('Client state: ', client)
  initializeMessageHandlers(client, setterFunctions, backgroundConnection)
  client.addSetterFunctions(setterFunctions)

  return (
    <div className="App-body-container">
      <FunctionForm client={client} fnSuggestionArray={fnSuggestionArray} buttonActive={buttonActive} buttonPending={buttonPending}></FunctionForm>
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <InvocationsList invocationRecords={invocationRecords}></InvocationsList>
    </div>)
}