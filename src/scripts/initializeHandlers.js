/*global chrome*/
import { wait } from './util/helpers.js'
import sendInjectMessages from './sendInjectMessages.js'
import { getCurrentTab } from './util/helpers.js'

export default function initializeHandlers(client, { updateStateFromClientDetails, setButtonPending, setFnSuggestionArray }) {
  const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {
      try {
        if (message.type === 'WINDOW_LOADED' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
          if (client.enableWrapOnPageLoad == true) {
            //Should add setting for wait time
            sendInjectMessages(client);
            await wait(2000);
            await client.wrapFunction();
            updateStateFromClientDetails();
            setButtonPending(false)
          }
          sendResponse({ clientState: client.getState(), domListenerInjected: client.domListenerInjected })


        } else if (message.type === 'BEFORE_NAVIGATE' && message.tabId == chrome.devtools.inspectedWindow.tabId) {
          console.log('Before Navigate')
          client.clearInvocationRecords()
          client.domListenerInjected = false
          //updateStateFromClientDetails()
          if (client.isFnWrapped && client.enableWrapOnPageLoad) setButtonPending(true)
          sendResponse()

        } else if (message.type == 'FUNCTION_CALL_DETAILS') {

          console.log('FUNCTION CALLED')

          let _data
          _data = message.data
          if (_data.callArgs) {
            _data.callArgs = JSON.parse(_data.callArgs)
            console.log(`Invocation record ${JSON.stringify(_data)}`);
          }
          if (_data.type) delete _data.type
          client.addInvocationRecord(_data)
          updateStateFromClientDetails()

          sendResponse()

        } else if (message.type === 'FN_ARRAY_RESULT' && sender.tab.id == chrome.devtools.inspectedWindow.tabId) {
          console.log('FN_ARRAY message received.')
          setFnSuggestionArray(message.fnArray)
        }
      } catch (e) {
        console.log('Error on message\n' + e + '\nMessage: \n' + message)
      }

    })()
    return true
  }

  if (!client.handlersInitialized) {
    if (!getCurrentTab().url?.startsWith('chrome://')) {
      chrome.runtime.onMessage.addListener(onMessageHandler)
      client.handlersInitialized = true
      console.log('Adding window loaded listener.')
    }
  }
}