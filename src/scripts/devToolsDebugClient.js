/*global chrome*/
import { wait, extractArguments } from './helpers.js'
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
      if (!existsCheck) return false

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

      console.log('Args array:')
      console.log(this.fnDetails.argsArray)
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

function getSplitWrapperExpressionStrings(fnPath) {
  let wrappingExpressions = {}
  wrappingExpressions.functionExistsCheck = `typeof(${fnPath})==='function'`
  wrappingExpressions.logStart = `console.log("Wrapping function [${fnPath}]")`
  //wrappingExpressions.getFnStringified = `${fnPath}.prototype.constructor.toString()`
  wrappingExpressions.getFnStringified = `
  function getConstructorString(fn){

    let stringified = ''
  
    if(fn.prototype) {
      if(fn.prototype.constructor) 
        stringified = fn.prototype.constructor.toString()
        return stringified
    } else if (fn.constructor){
      stringified= fn.constructor.toString()
      return stringified
    }
    return stringified
  }
  
  getConstructorString(${fnPath})`
  wrappingExpressions.copyMethod =
    `var method = ${fnPath}
    var _fnWrapper = {}
    _fnWrapper.originalFunctionCopy =  method`

  wrappingExpressions.wrapFunction =
    `${fnPath} = function(){
      var args = [].slice.call(arguments)
      method.apply(this, args)
      window.postMessage({type: 'FUNCTION_CALL_EVENT', callArgs: args, timestamp: Date.now(), fnPath: '${fnPath}'})

    }`

  wrappingExpressions.logEnd = `console.log("Finished wrapping [${fnPath}] function")`
  return wrappingExpressions

}

function getSplitUnwrapperExpressionStrings(fnPath) {
  let unwrappingExpressions = {}
  unwrappingExpressions.functionExistsCheck = `typeof(${fnPath}) === 'function'`
  unwrappingExpressions.copyFunctionExistsCheck = `typeof(_fnWrapper.originalFunctionCopy)==='function'`
  unwrappingExpressions.logStart = `console.log("Unwrapping [${fnPath}] function.")`
  unwrappingExpressions.unwrapFunction = `
    ${fnPath} = _fnWrapper.originalFunctionCopy
    _fnWrapper = null`
  unwrappingExpressions.logEnd = `console.log("Function [${fnPath}] unwrapped.")`
  return unwrappingExpressions
}



async function evaluateExpressionAsync(expression, validationValue, retryAttempts, retryInterval) {
  const RETRY_ATTEMPTS_DEFAULT = 10
  const RETRY_INTERVAL_DEFAULT = 500

  let lastResult

  async function sendExpression(expression) {
    return new Promise((resolve, reject) => {
      chrome.devtools.inspectedWindow.eval(expression, (result, exceptionInfo) => {
        if (exceptionInfo) reject(exceptionInfo);
        else resolve(result);
      })
    })
  }

  retryAttempts = (retryAttempts || retryInterval) ? retryAttempts || RETRY_ATTEMPTS_DEFAULT : 0

  for (let attempt = 1; attempt <= retryAttempts + 1; attempt++) {
    let attemptResult
    try {
      attemptResult = await sendExpression(expression);
      lastResult = attemptResult

      if (attemptResult === validationValue) break;

    } catch (e) {

      console.log(e)
      console.log('Error occured while evaluating expression:')
      console.log(expression)
      lastResult = e
      continue;
    }
    if (attempt < retryAttempts + 1) await wait(retryInterval || RETRY_INTERVAL_DEFAULT)

  }
  //Will implement check for isError
  return lastResult
}