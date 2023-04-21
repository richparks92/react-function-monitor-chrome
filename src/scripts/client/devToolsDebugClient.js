/*global chrome*/
import { extractArguments } from '../util/helpers.js'
import { getSplitWrapperExpressionStrings, getSplitUnwrapperExpressionStrings, evaluateExpressionAsync } from './debuggerMethods.js'
import { registerListeners } from './message-handlers/registerListeners.js'

export default class DevToolsDebugClient {
  constructor(fnPath) {
    this.fnDetails = {}
    this.uiSetters = {}
    this.injectStatus = { domListenerInjected: false, getFnsInjected: false }
    this.isFnWrapped = false
    this.enableWrapOnPageLoad = false

    this.tabId = chrome.devtools.inspectedWindow.tabId
    this.registerListeners = registerListeners.bind(this)
    if (fnPath) this.setFnDetails(fnPath)
    if (!this.invocationRecords) this.invocationRecords = []
    this.backgroundPageConnection = this.createBackgroundPageConnection()
    this.uiSetters.updateStateFromClientDetails = () => { console.log('No setters.updateState exists.') }
  }

  createBackgroundPageConnection() {
    console.log('Creating backgroundPageConnection.')

    this.backgroundPageConnection = chrome.runtime.connect({
      name: "devtools-page"
    });
    return this.backgroundPageConnection
  }


  setFnDetails(fnPath) {
    (async () => await this.clearFnDetails())()
    if (fnPath && fnPath.length) {
      this.fnDetails.path = fnPath
      let fnPathArray = fnPath.split('.')
      this.fnDetails.name = fnPathArray[fnPathArray.length - 1]
      if (fnPathArray.length > 1) this.fnDetails.parentPath = fnPathArray.slice(0, -1).join('.')
      this.uiSetters.updateStateFromClientDetails()
    }
  }

  async clearFnDetails() {
    console.log('Clearing function')
    if (this.isFnWrapped) await this.unwrapFunction(this.fnDetails.path)
    this.fnDetails = {}
    this.clearInvocationRecords()
  }


  addUiSetterFunctions(setters) {
    for (const key in setters) {
      this.uiSetters[key] = setters[key]
    }
  }

  addInvocationRecord(invocationRecord) {
    this.invocationRecords.push(invocationRecord)
  }

  clearInvocationRecords() {
    this.invocationRecords = []
  }

  getState() {
    return {
      isFnWrapped: this.isFnWrapped,
      fnDetails: this.fnDetails,
      invocationRecords: this.invocationRecords
    }
  }

  async toggleFunctionWrapper() {
    //If toggle is initially OFF, evaluate if it should be turned on
    this.isFnWrapped ? await this.unwrapFunction() : await this.wrapFunction()
    return this.isFnWrapped
  }

  async doesFunctionExist(_fnPath) {
    _fnPath = _fnPath || this.fnDetails.path
    const wrappingExpressions = getSplitWrapperExpressionStrings(_fnPath)
    //Check if function exists
    try {
      const fnExists = await evaluateExpressionAsync(wrappingExpressions.functionExistsCheck, true, 5, 100)
      console.log(`Checking if ${_fnPath} exists: `, fnExists)
      return fnExists.isException ? false : fnExists

    } catch (e) {
      console.log(e)
      return false
    }

  }

  async isFnAlreadyWrapped(_fnPath){
    _fnPath = _fnPath || this.fnDetails.path
    const wrappingExpressions = getSplitWrapperExpressionStrings(_fnPath)
    //Check if function exists
    try {
      const fnAlreadyWrapped = await evaluateExpressionAsync(wrappingExpressions.functionAlreadyWrappedCheck, true, 5, 100)
      console.log(`Checking if ${_fnPath} already wrapped: `, fnAlreadyWrapped)
      return fnAlreadyWrapped.isException ? false : fnAlreadyWrapped

    } catch (e) {
      console.log(e)
      return false
    }
  }

  //Wrap function and if successful update isFnWrapped
  async wrapFunction() {
    if (!this.fnDetails || !this.fnDetails.path) return false
    const fnPath = this.fnDetails.path
    this.enableWrapOnPageLoad = true
    let evaluateSuccess = false

    const wrappingExpressions = getSplitWrapperExpressionStrings(fnPath)
    //Check if function exists
    const fnExists = await this.doesFunctionExist(fnPath)
    if (!fnExists) return false
    const fnAlreadyWrapped = await this.isFnAlreadyWrapped(fnPath)
    if(fnAlreadyWrapped) {
      onWrapSuccess(this)
      return true
    }
    

    //Log start
    await evaluateExpressionAsync(wrappingExpressions.logStart)

    //Check if fn is already copied into _fnWrapper. If so function was wrapped but never unwrapped so we just return true.
    try {
      console.log('Sending check for copy function')
      const copyExists = await evaluateExpressionAsync(wrappingExpressions.copyFunctionExistsCheck)
      if (copyExists) {
        console.log('Function copy already exists.')
        //onWrapSuccess(this)
        //return true
      }

    } catch (e) {
      console.log(e)
    }

    //Get stringified function constructor so we can try to extract arguments
    try {
      const fnStringified = await evaluateExpressionAsync(wrappingExpressions.getFnStringified)
      if (typeof (fnStringified) === 'string') {
        this.fnDetails.fnStringified = fnStringified
        this.fnDetails.argsArray = extractArguments(fnStringified)
      }
    } catch (e) {
      console.log("Error extracting function arguments from prototype:")
      console.log(e)
      //return false
    }

    //Copy function to *_fnWrapper.originalFunctionCopy*
    try {

      const res = await evaluateExpressionAsync(wrappingExpressions.copyMethod)
      evaluateSuccess = true
      if (res.isException === true) {
        console.log('Error copying original function.')
        return false
      }

    } catch (e) {

      console.log('Error copying original function.')
      console.log(e)
      return false
    }

    try {
      console.log('Client: Triggering wrap function.')
      await evaluateExpressionAsync(wrappingExpressions.wrapFunction)

    } catch (e) {

      console.log('Error while wrapping function.')
      console.log(e)
      return false

    }

    //Log end 
    await evaluateExpressionAsync(wrappingExpressions.logEnd)

    function onWrapSuccess(_client) {
      console.log('Finished wrapping. evaluateSuccess:', evaluateSuccess, 'domListenerInjected: ', _client.injectStatus.domListenerInjected)
      _client.isFnWrapped = true
    }

    if (evaluateSuccess && this.injectStatus.domListenerInjected) onWrapSuccess(this)
    return evaluateSuccess && this.injectStatus.domListenerInjected
  }

  async unwrapFunction() {
    const fnPath = this.fnDetails.path
    this.enableWrapOnPageLoad = false
    let isSuccess = false
    const unwrappingExpressions = getSplitUnwrapperExpressionStrings(fnPath)

    try {
      await evaluateExpressionAsync(unwrappingExpressions.logStart)
      const functionExistsCheck = await evaluateExpressionAsync(unwrappingExpressions.functionExistsCheck, true)
      const copyExistsCheck = await evaluateExpressionAsync(unwrappingExpressions.copyFunctionExistsCheck)
      if (copyExistsCheck && functionExistsCheck) {
        await evaluateExpressionAsync(unwrappingExpressions.unwrapFunction)
        await evaluateExpressionAsync(unwrappingExpressions.logEnd)
        isSuccess = true
      } else {
        isSuccess = false
      }
    } catch (e) {
      console.log('Error evaluating expression while unwrapping function.')
      console.log(e)
      isSuccess = false
    }

    this.isFnWrapped = false
    await this.clearFnDetails()
    return isSuccess
  }
}