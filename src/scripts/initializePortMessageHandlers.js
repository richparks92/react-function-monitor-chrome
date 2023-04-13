/*global chrome*/
import { wait } from './util/helpers.js'
import { getCurrentTab } from './util/helpers.js'
import { requestScriptInjection } from './requestScriptInjection'

/* This function listens for incoming messages from background.js
 and updates 1) client and 2) app state (via setter functions passed in as arguments) */

export function initializePortMessageHandlers(client, { updateStateFromClientDetails, setButtonPending, setFnSuggestionArray }, backgroundPageConnection) {
  console.log('Starting initializePortMessageHandlers.')

  async function handleMessagesFromBackground(message, port) {
    console.log('Message from background.js:', message, 'Port:', port)
    // Handle responses from the background page, if any
    //make sure tabId is in message sent, look at structure
    if (message.tabId == chrome.devtools.inspectedWindow.tabId) {
      switch (message.type) {
        case 'INJECT_RESULT':
          console.log('inject_result message received by devTools: ', message.injectSuccessful)
          if (message?.scriptKey == 'addDomListeners') {
            client.domListenerInjected = message.injectSuccessful
            console.log('Setting client.domListenerInjected based off inject response. Value = ', client.domListenerInjected)
          }
          break;

        case 'WINDOW_LOADED':
          if (client.enableWrapOnPageLoad == true) {
            console.log('window_loaded message received by devTools.')
            //Should add setting for wait time
            requestScriptInjection(backgroundPageConnection, "addDomListeners");
            requestScriptInjection(backgroundPageConnection, "getFunctionList");
            await wait(2000);
            await client.wrapFunction();
            updateStateFromClientDetails();
            setButtonPending(false)
          }
          break;

        case 'BEFORE_NAVIGATE':
          console.log('before_navigate message received by devTools.');
          client.clearInvocationRecords();
          client.domListenerInjected = false;
          if (client.isFnWrapped && client.enableWrapOnPageLoad) setButtonPending(true);
          break;

        case 'FUNCTION_CALL_DETAILS':
          console.log('function_call details message received by devTools.')
          let _data
          _data = message?.data
          if (_data?.callArgs) {
            _data.callArgs = JSON.parse(_data?.callArgs)
            console.log(`Invocation record ${JSON.stringify(_data)}`);
          }
          //if (_data.type) delete _data.type
          client.addInvocationRecord(_data)
          updateStateFromClientDetails()
          break;

        case 'FN_ARRAY_RESULT':
          console.log('fn_array message received by devTools.')
          setFnSuggestionArray(message.fnArray);
          break;


      }


    }

  }

  //Below is working
  if (chrome.runtime.lastError) console.log('initializePort lastError:', chrome.runtime.lastError)
  console.log('client.handlersInitialized = ', client.handlersInitialized)
  if (!client.handlersInitialized) {

    if (!getCurrentTab().url?.startsWith('chrome://')) {
      backgroundPageConnection.onMessage.addListener(handleMessagesFromBackground)
      client.handlersInitialized = true
      console.log('Registering devTools listeners.')
    }
  }

}
