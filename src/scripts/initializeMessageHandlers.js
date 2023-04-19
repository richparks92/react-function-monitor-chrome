/*global chrome*/
import { wait } from './util/helpers.js'
import { requestScriptInjection } from './requestScriptInjection.js'

/* This function listens for incoming messages from background.js
 and updates 1) Client and 2) app state (via setter functions passed in as arguments) */

export function initializeMessageHandlers(Client, { updateStateFromClientDetails, setButtonPending, setFnSuggestionArray }, backgroundPageConnection) {
  const inspectedTabId = chrome.devtools.inspectedWindow.tabId
  console.log('Inspected Tab ID: ', inspectedTabId)

  async function handleMessagesFromBackground(message, port) {

    if (message.tabId !== inspectedTabId) return
    console.log('Message from background.js:', message, 'Port:', port)
    // Handle responses from the background page, if any
    //make sure tabId is in message sent, look at structure
    if (port.name != 'devtools-page') return
    switch (message.type) {
      case 'INJECT_RESULT':
        console.log('inject_result message received by devTools: ', message.injectSuccessful)
        if (message?.scriptKey == 'addDomListeners') {
          Client.domListenerInjected = message.injectSuccessful
          console.log('Setting Client.domListenerInjected to', Client.domListenerInjected, ' based off inject response.')
        }
        if (message?.scriptKey == 'getFunctionList') {
          Client.getFnsInjected = message.injectSuccessful
          console.log('Setting Client.getFnsInjected to', Client.getFnsInjected, ' based off inject response.')
        }
        if (message?.scriptKey == 'copyTextToClipboard') {
          console.log('Copy inject successful: ', message.injectSuccessful)
        }
        break;

      case 'WINDOW_LOADED':
        console.log('window_loaded message received by devTools.')
        if (!Client.domListenerInjected) {
          console.log('Requesting addDomListeners script injection (window_loaded).') 
          requestScriptInjection(backgroundPageConnection, "addDomListeners");}
        await wait(1000)
        if(!Client.getFnsInjected){
          console.log('Requesting getFunctionList script injection (window_loaded).') 
          requestScriptInjection(backgroundPageConnection, "getFunctionList");
        } 

        if (Client.enableWrapOnPageLoad == true && !Client.isFnWrapped) {
          //Should add setting for wait time
          console.log('Rewrapping function after page load: ')
          await wait(2000);
          await Client.wrapFunction();
          updateStateFromClientDetails();
          setButtonPending(false)

        }
        break;

      case 'BEFORE_NAVIGATE':
        console.log('before_navigate message received by devTools.');
        Client.clearInvocationRecords();
        //Client.domListenerInjected = false;
        Client.getFnsInjected = false;
        if (Client.isFnWrapped && Client.enableWrapOnPageLoad) setButtonPending(true);
        break;
    }

  }

  //handle Messages From Dom
  async function handleMessagesFromDom(message, port) {
    console.log('Message from DOM/content script:', message, 'From TabID: ', port.sender.tab.id, 'Port:', port)

    //This will always return false, tabID isn't sent through message
    //if (message.tabId !== inspectedTabId) return

    switch (message.type) {
      case 'FUNCTION_CALL_DETAILS':
        console.log('function_call details message received by devTools.')
        let _data
        _data = message?.data
        if (_data?.callArgs) {
          try {
            _data.callArgs = JSON.parse(_data?.callArgs)
            console.log('Invocation record received', JSON.stringify(_data));
          } catch (e) {
            console.log('Error stringifying callArgs from function call:', e)
            console.log('Message:', message)
          }

        }
        //if (_data.type) delete _data.type
        Client.addInvocationRecord(_data)
        updateStateFromClientDetails()
        break;

      case 'FN_ARRAY_RESULT':
        console.log('fn_array message received by devTools.', message.fnArray)
        setFnSuggestionArray(message.fnArray);
        break;
    }

  }

  console.log('Client.messageHandlersInitialized = ', Client.messageHandlersInitialized)

  function registerListeners() {
    if (!Client.messageHandlersInitialized) {
      //Add DOM connection and listener
      chrome.runtime.onConnect.addListener(function (port) {
        console.log('initializeMH port onConnect. Port: ', port)
        if (port.name == 'dom-listeners' && port.sender.tab.id == inspectedTabId) {
          port.onMessage.addListener(handleMessagesFromDom)
          port.postMessage('Sending test message to content script')
          console.log('Initializing DOM message handlers.')

          port.onDisconnect.addListener(function () {
            console.log('initializeMH -- port disconnected, removing listener.')
            port.onMessage.removeListener(handleMessagesFromDom);
            Client.messageHandlersInitialized = false
          });

        }
      })

      console.log('Initializing background page message handlers.')

      backgroundPageConnection.onMessage.addListener(handleMessagesFromBackground)
      Client.messageHandlersInitialized = true
      console.log('Registering devTools listeners.')

    }
  }
  
  registerListeners()


}
