/*global chrome*/
import { wait, extractArguments } from './helpers.js'
export default class DevToolsDebugClient {
  constructor(fnPath) {
    this.isFnWrapped = false
    this.setFnDetails(fnPath)
    this.enableWrapOnPageLoad = false

  }

  setFnDetails(fnPath) {
    if (fnPath && fnPath.length) {
      this.fnPath = fnPath
      let fnPathArray = fnPath.split('.')
      this.fnName = fnPathArray[fnPathArray.length - 1]
      if (fnPathArray.length > 1) this.fnParentPath = fnPathArray.slice(0, -1).join('.')
    }
  }
  getState() {
    return {
      isFnWrapped: this.isFnWrapped,
      fnName: this.fnName,
      fnPath: this.fnPath,
      fnParentPath: this.fnParentPath
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
  async wrapFunction(fnPath) {
    this.enableWrapOnPageLoad = true
    let evaluateSuccess = false
    let injectSuccess = false

    const wrappingExpressions = getSplitWrapperExpressionStrings(fnPath)

    try {
      const existsCheck = await evaluateExpressionAsync(wrappingExpressions.functionExistsCheck, true, 50, 100)
      if (!existsCheck) return false
      await evaluateExpressionAsync(wrappingExpressions.logStart)
      const fnStringified = await evaluateExpressionAsync(wrappingExpressions.getFnStringified)
      this.fnStringified = fnStringified
      this.fnArgsArray = extractArguments(fnStringified)
      console.log('Args array:')
      console.log(this.fnArgsArray)
      await evaluateExpressionAsync(wrappingExpressions.copyMethod)
      await evaluateExpressionAsync(wrappingExpressions.wrapFunction)
      await evaluateExpressionAsync(wrappingExpressions.logEnd)
      evaluateSuccess = true
    } catch (e) {
      console.log('Error evaluating expression while wrapping function.')
      console.log(e)
      evaluateSuccess = false
    }

    injectSuccess = await chrome.runtime.sendMessage({ type: 'INJECT_SCRIPT_TO_TAB', tabId: chrome.devtools.inspectedWindow.tabId })
    return evaluateSuccess && injectSuccess
  }

  async unwrapFunction(fnPath) {
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
  wrappingExpressions.getFnStringified = `${fnPath}.prototype.constructor.toString()`
  wrappingExpressions.copyMethod =
    `var method = ${fnPath}
    var _fnWrapper = {}
    _fnWrapper.originalFunctionCopy =  method`

  wrappingExpressions.wrapFunction =
    `${fnPath} = function(){
      var args = [].slice.call(arguments)
      method.apply(this, args)
      window.postMessage({type: 'FUNCTION_CALL_EVENT', args: args})
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
  const retry = retryAttempts > 0
  for (let attempt = 1; attempt <= retryAttempts + 1; attempt++) {
    let attemptResult
    try {
      attemptResult = await sendExpression(expression);
      lastResult = attemptResult
      // console.log(`Attempt #${attempt} Result | Validation Value`)
      // console.log(attemptResult + ' | ' + validationValue)
      if (attemptResult === validationValue) break;

    } catch (e) {
      console.log(e)
      lastResult = e
      continue;
    }
    if (attempt < retryAttempts + 1) await wait(retryInterval || RETRY_INTERVAL_DEFAULT)

  }
  //Will implement check for isError
  return lastResult

}

