import injectScript from "./public-utils/injectScript.js"
import { getCurrentTab } from "./public-utils/utils.js"

/////
//
/////
console.log('Background page starting.')

// Background page -- background.js
chrome.runtime.onConnect.addListener(function (port) {
console.log('Background page-- runtime connect listener triggered. Port: ', port)
    // assign the listener function to a variable so we can remove it later
    var devToolsListener = async function (message, port) {
        console.log('devToolsConnection', message, 'port', port)
        switch (message.type) {
            case "REQUEST_INJECTION":
                try {
                    const res = await injectScript(message.scriptKey, message.tabId, message.args)
                    console.log('Background - Success injecting:', message.scriptKey)
                    port.postMessage({type: 'INJECT_RESULT', scriptKey: message.scriptKey, injectSuccessful: res, tabId: message.tabId})
                }
                catch (e) {
                    console.log(e)
                }
        }
        
    }
    // add the listener
    port.onMessage.addListener(devToolsListener);

    const onCompletedHandler = async function (details) {
        if (details.url?.startsWith('chrome://')) return undefined
        if (details.parentFrameId == -1 && details.tabId) {
            try {
                 res = await port.postMessage({ type: 'WINDOW_LOADED', tabId: details.tabId })

            } catch (e) {
                console.log(e)
            }
        }
    }

    const onBeforeNavigateHandler = async function (details) {
        if (details.url?.startsWith('chrome://')) return undefined
        if (details.parentFrameId == -1 && details.tabId) {
            try {
                await port.postMessage({ type: 'BEFORE_NAVIGATE', tabId: details.tabId })
            } catch (e) {
                console.log(e)
            }
        }
    }


    if(port.name == 'devToolsConnection'){
        chrome.webNavigation.onCompleted.addListener(onCompletedHandler)
        chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)
        port.onDisconnect.addListener(function () {
            port.onMessage.removeListener(devToolsListener);
        });
    }

});

