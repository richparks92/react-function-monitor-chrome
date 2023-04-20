/*global chrome*/

import { wait } from '../util/helpers.js'
import { requestScriptInjection } from './requestScriptInjection.js'
import { handleMessagesFromBackground } from './message-handlers/handleMessagesFromBackground.js'
import { handleMessagesFromDom } from './message-handlers/handleMessagesFromDom.js'

/* This function listens for incoming messages from background.js
 and updates 1) Client and 2) app state (via setter functions passed in as arguments) */

export function addClientMessageHandlers(Client, { updateStateFromClientDetails, setButtonPending, setFnSuggestionArray }, backgroundPageConnection) {
  
  const inspectedTabId = chrome.devtools.inspectedWindow.tabId
  console.log('Inspected Tab ID: ', inspectedTabId)
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
