/*global chrome*/
import {extractArguments } from './helpers.js'
import {getSplitWrapperExpressionStrings, getSplitUnwrapperExpressionStrings, evaluateExpressionAsync} from './debuggerMethods.js'

export default class DevToolsDebugClient {
  constructor(fnPath) {
    this.fnDetails = {}
    this.isFnWrapped = false
    this.setFnDetails(fnPath)
    this.enableWrapOnPageLoad = false

  }

  setFnDetails(fnPath) {
    (async () => await this.clearFnDetails())()
    if (fnPath && fnPath.length) {
      this.fnDetails.path = fnPath
      let fnPathArray = fnPath.split('.')
      this.fnDetails.name = fnPathArray[fnPathArray.length - 1]
      if (fnPathArray.length > 1) this.fnDetails.parentPath = fnPathArray.slice(0, -1).join('.')
    }
  }

  async clearFnDetails() {
    console.log('Clearing function')
    if (this.isFnWrapped) await this.unwrapFunction(this.fnDetails.path)
    this.fnDetails = {}
    this.clearInvocationRecords()
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
    let toggleSuccess

    //If toggle is initially OFF, evaluate if it should be turned on
    if (!this.isFnWrapped) {

      toggleSuccess = await this.wrapFunction(this.fnPath)

      if (toggleSuccess) this.isFnWrapped = true

      //If toggle is initially ON, unwrap
    } else {
      toggleSuccess = await this.unwrapFunction(this.fnPath)
      this.isFnWrapped = false
    }
    return this.isFnWrapped
  }

  //Wrap function and if successful update isFnWrapped
  async wrapFunction() {
    const fnPath = this.fnDetails.path
    this.enableWrapOnPageLoad = true
    let evaluateSuccess = false
    let injectSuccess = false

    const wrappingExpressions = getSplitWrapperExpressionStrings(fnPath)
    //Check if function exists
    try {
      const existsCheck = await evaluateExpressionAsync(wrappingExpressions.functionExistsCheck, true, 50, 100)
      if (existsCheck.isException) return false

    } catch (e) {
      console.log(e)
      return false
    }
    //Log start
    await evaluateExpressionAsync(wrappingExpressions.logStart)

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
    }
    //Copy function to *_fnWrapper.originalFunctionCopy*
    try {
      await evaluateExpressionAsync(wrappingExpressions.copyMethod)
      evaluateSuccess = true
    } catch (e) {
      console.log('Error copying original function.')
      console.log(e)
      evaluateSuccess = false
    }

    try {
      await evaluateExpressionAsync(wrappingExpressions.wrapFunction)
    } catch (e) {
      console.log('Error while wrapping function.')
      console.log(e)
      return false
    }
    //Log end 
    await evaluateExpressionAsync(wrappingExpressions.logEnd)

    //Inject script if not injected
    if (!this.contentScriptInjected) {
      try {
        injectSuccess = await chrome.runtime.sendMessage({ type: 'INJECT_SCRIPT_TO_TAB', tabId: chrome.devtools.inspectedWindow.tabId })
        if (injectSuccess) this.contentScriptInjected = true
      } catch (e) {
        console.log('Error sending message to inject script.')
        console.log(e)
        return false
      }
    }

    if (evaluateSuccess && this.contentScriptInjected) return true

    return evaluateSuccess && injectSuccess
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
    return isSuccess
  }

}

