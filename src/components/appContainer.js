import './css/appContainer.css'
import React, { useState } from "react";
import {initializeMessageHandlers} from '../scripts/initializeMessageHandlers.js';
import FunctionInfoPanel from './functionInfoPanel.js';
import FunctionForm from './functionForm';
import InvocationsList from './invocationsList';
import 'primeflex/primeflex.css';

/*global chrome*/

export default function AppContainer({ Client, backgroundConnection }) {
  console.log('AppContainer loading')
  const [buttonActive, setButtonActive] = useState(false)
  const [buttonPending, setButtonPending] = useState(false)
  const [functionInfo, setFunctionInfo] = useState({ fnName: '', fnParentPath: '' })
  const [invocationRecords, setInvocationRecords] = useState([])
  const [fnSuggestionArray, setFnSuggestionArray] = useState([])

  //These methods are passed to the event handlers
  const updateStateFromClientDetails = () => {
    setFunctionInfo({ fnName: Client.fnDetails.name, fnParentPath: Client.fnDetails.parentPath })
    setButtonActive(Client.isFnWrapped)
    setInvocationRecords(Client.invocationRecords)
    console.log(`Updating UI from Client. Setting button to: ${Client.isFnWrapped}`)
  }

  //Initialize handlers, passing Client and state update functions as argument
  const setterFunctions = {
    updateStateFromClientDetails: updateStateFromClientDetails,
    setButtonActive: setButtonActive,
    setButtonPending: setButtonPending,
    setInvocationRecords: setInvocationRecords,
    setFunctionInfo: setFunctionInfo,
    setFnSuggestionArray: setFnSuggestionArray
  }


  console.log('Client state: ', Client)
  if(!Client.messageHandlersInitialized) initializeMessageHandlers(Client, setterFunctions, backgroundConnection)
  Client.addSetterFunctions(setterFunctions)

  return (
    <div className="App-body-container">
      <FunctionForm Client={Client} fnSuggestionArray={fnSuggestionArray} buttonActive={buttonActive} buttonPending={buttonPending}></FunctionForm>
      <FunctionInfoPanel functionName={functionInfo.fnName} functionParentPath={functionInfo.fnParentPath}></FunctionInfoPanel>
      <InvocationsList invocationRecords={invocationRecords} backgroundConnection={backgroundConnection}></InvocationsList>
    </div>)
}