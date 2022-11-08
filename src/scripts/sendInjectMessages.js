/*global chrome*/
export default function(client){

  console.log(`sendInjectMessages. domListenerInjected: ${client.domListenerInjected || "(doesn't exist yet)"}`)
if (!client.domListenerInjected) {
  
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
      }).catch((e)=> console.log(e))
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