/*global chrome*/
import {wait} from './helpers.js'
import sendInjectMessages from './sendInjectMessages.js'
export default function initializeHandlers(client, updateStateFromClientDetails, setPending, setFnArray){
    const onMessageHandler = function (message, sender, sendResponse) {
        (async () => {
          
          if (message.type == 'WINDOW_LOADED' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
            if (client.enableWrapOnPageLoad == true) {
              //Should add setting for wait time
              await wait(1000)
              await client.wrapFunction(client.fnPath)
              updateStateFromClientDetails()
            }
            sendResponse({clientState: client.getState(), domListenerInjected: client.domListenerInjected })
            sendInjectMessages();
          } else if (message.type == 'FUNCTION_CALL_DETAILS') {
    
            console.log('FUNCTION CALLED')

            let _data
            _data = message.data
            _data.callArgs = _data.callArgs.join(', ')
            client.addInvocationRecord(_data)
            updateStateFromClientDetails()
            sendResponse()
    
          } else if (message.type == 'BEFORE_NAVIGATE' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
            console.log('Before Navigate')
            client.clearInvocationRecords()
            client.domListenerInjected= false
            updateStateFromClientDetails()
            setPending()
            sendResponse()
            
          } else if (message.type=='FN_ARRAY_RESULT' && sender.tab.id == chrome.devtools.inspectedWindow.tabId){
            console.log('FN_ARRAY message received.')
            setFnArray(message.fnArray)
          }
        })()
        return true
      }
    
      if (!client.handlersInitialized) {
        chrome.runtime.onMessage.addListener(onMessageHandler)
        client.handlersInitialized = true
        console.log('Adding window loaded listener.')
      }
    }