/*global chrome*/
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
export const extractArguments = (fnString) => {
  fnString = fnString||''
  var rgx = /function\((?<args>[^)]*)/g
  var extracted = rgx.exec(fnString)
  let argsStr = ''
  if (extracted && extracted.groups) {
    argsStr = extracted.groups.args || ''
  }
  const argsArray = argsStr.replaceAll(' ', '').split(',')

  return argsArray
}

export const initializeHandlers = function(client, updateStateFromClientDetails, setPending, setInvocations){
const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {
      if(message.tabId != chrome.devtools.inspectedWindow.tabId) return true;
      if (message.type == 'WINDOW_LOADED' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
        if (client.enableWrapOnPageLoad == true) {
          //Should add setting for wait time
          await wait(1000)
          await client.wrapFunction(client.fnPath)
          updateStateFromClientDetails()
        }
        sendResponse(client.getState())
      } else if (message.type == 'FUNCTION_CALL_DETAILS') {

        console.log('FUNCTION CALL DETAILS:')
        console.log(message.data)
        let _data
        _data = message.data
        _data.callArgs = _data.callArgs.join(', ')
        client.addInvocationRecord(_data)
        updateStateFromClientDetails()
        sendResponse()

      } else if (message.type == 'BEFORE_NAVIGATE') {
        console.log('Before Navigate')
        client.clearInvocationRecords()
        client.contentScriptInjected= false
        updateStateFromClientDetails()
        setPending()
        sendResponse()
      }
    })()
    return true
  }

  if (!client.initialized) {
    chrome.runtime.onMessage.addListener(onMessageHandler)
    client.initialized = true
    console.log('Adding window loaded listener.')
  }
}