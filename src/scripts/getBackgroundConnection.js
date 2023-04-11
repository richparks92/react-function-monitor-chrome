/*global chrome*/

// DevTools page -- devtools.js
// Create a connection to the background page

export function getBackgroundConnection(){
    const backgroundPageConnection = chrome.runtime.connect({
        name: "devtools-page"
      });
      
      backgroundPageConnection.onMessage.addListener(function (message) {
        // Handle responses from the background page, if any
        console.log('Message Response:', message)
      });
      return backgroundPageConnection

}

export function sendInjectTestScript(backgroundPageConnection){
      // Relay the tab ID to the background page
      backgroundPageConnection.postMessage({
        type: 'INJECT_SCRIPT_TO_TAB',
        tabId: chrome.devtools.inspectedWindow.tabId,
        scriptFiles: ['/chrome-pages/content-scripts/test1.js']
      });
}

