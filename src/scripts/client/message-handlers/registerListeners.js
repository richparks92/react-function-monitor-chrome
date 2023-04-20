/*global chrome*/
import { handleMessagesFromBackground } from './handleMessagesFromBackground.js'
import { handleMessagesFromDom } from './handleMessagesFromDom.js'

export function registerListeners() {
    if (!this.messageHandlersInitialized) {
      //Add DOM connection and listener
      chrome.runtime.onConnect.addListener(onConnectListener.bind(this))

      console.log('Initializing background page message handlers.')

      this.backgroundPageConnection.onMessage.addListener(handleMessagesFromBackground.bind(this))
      this.messageHandlersInitialized = true
      console.log('Registering devTools listeners.')

    }
  }

  function onConnectListener(port){
    console.log('initializeMH port onConnect. Port: ', port)
    console.log('onConnect this: ', this)
    if (port.name == 'dom-listeners' && port.sender.tab.id == this.tabId) {
      this.domConnection = port
      this.domConnection.onMessage.addListener(handleMessagesFromDom.bind(this))
      this.domConnection.postMessage('Sending test message to content script')
      console.log('Initializing DOM message handlers.')

      this.domConnection.onDisconnect.addListener(function () {
        console.log('initializeMH -- port disconnected, removing listener.')
        this.domConnection.onMessage.removeListener(handleMessagesFromDom.bind(this));
        this.messageHandlersInitialized = false
      });

    }
  }