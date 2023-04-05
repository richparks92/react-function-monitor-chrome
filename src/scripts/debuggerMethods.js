import { wait } from './helpers.js'
/*global chrome*/
export async function evaluateExpressionAsync(expression, validationValue, retryAttempts, retryInterval) {
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

  return lastResult
}


export function getSplitWrapperExpressionStrings(fnPath) {
  let wrappingExpressions = {}
  wrappingExpressions.functionExistsCheck = `typeof(${fnPath})==='function'`
  wrappingExpressions.logStart = `console.log("Wrapping function [${fnPath}]")`
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
        let message = {}
        try {
          var args = [].slice.call(arguments)
          var argsJSON = JSON.stringify(args)
          method.apply(this, args)
          message = {type: 'FUNCTION_CALL_EVENT', callArgs: argsJSON, timestamp: Date.now(), fnPath: '${fnPath}'}
          console.log('Function called.')
          console.log(message)
          window.postMessage(message)
        } catch (e) {
          console.log('Console error wrapping function: '+ JSON.stringify(message, null, 2))
        }
      }`

  wrappingExpressions.logEnd = `console.log("Finished wrapping [${fnPath}] function")`
  return wrappingExpressions

}

export function getSplitUnwrapperExpressionStrings(fnPath) {
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