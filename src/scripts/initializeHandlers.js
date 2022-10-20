/*global chrome*/
import {wait} from './helpers.js'

export default function initializeHandlers(client, updateStateFromClientDetails, setPending){
    const onMessageHandler = function (message, sender, sendResponse) {
        (async () => {
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
    
          } else if (message.type == 'BEFORE_NAVIGATE' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
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