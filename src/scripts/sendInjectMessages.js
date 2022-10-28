/*global chrome*/
export default function(client){
  console.log('sendInjectMessages')
if (!client.domListenerInjected) {
    chrome.runtime.sendMessage({
      type: 'INJECT_SCRIPT_TO_TAB',
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptFiles: ['/chrome-pages/content-scripts/addDomListeners.js']
    })
      .then((injectSuccess) => {
        if (injectSuccess) console.log('Dom listener injected.')
        client.domListenerInjected = injectSuccess
      })
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