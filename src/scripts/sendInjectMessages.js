/*global chrome*/

// DevTools page -- devtools.js
// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
});

// Relay the tab ID to the background page
backgroundPageConnection.postMessage('what it do');

export default function (client) {



  console.log(`sendInjectMessages. domListenerInjected: ${client.domListenerInjected || "(doesn't exist yet)"}`)
  if (!client.domListenerInjected) {
    //Messages are being sent to background.js, so set up port to exchange between the two
    //Send messages to inject if client status is not injected.
    console.log('Sending message to inject DOM listener.')
    chrome.runtime.sendMessage({
      type: 'INJECT_SCRIPT_TO_TAB',
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptFiles: ['/chrome-pages/content-scripts/addDomListeners.js']
    })
      .then((injectSuccess) => {
        if (injectSuccess) console.log('DOM listener injected.')
        client.domListenerInjected = injectSuccess
      }).catch((e) => console.log(e))
  }

  // If successful set client init to true. If true don't add script
  setTimeout(() => {
    console.log('Sending message to inject getFunctionList script.')
    chrome.runtime.sendMessage({
      type: 'INJECT_SCRIPT_TO_TAB',
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptFiles: ['/chrome-pages/content-scripts/getFunctionList.js'],
      executeInMainWorld: true
    })

  }, 250)
}