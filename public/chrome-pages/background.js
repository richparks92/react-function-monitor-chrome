import injectScript from "./public-utils/injectScript.js"
import { getCurrentTab } from "./public-utils/utils.js"

/////
//
/////
console.log('Background page starting.')
const connections = {}

// Background page -- background.js
chrome.runtime.onConnect.addListener(function (port) {
    console.log('Background page-- runtime connect listener triggered. Port: ', port)

    // assign the listener function to a variable so we can remove it later
    const devToolsListener = async function (message, port) {
        console.log('devToolsConnection incoming message:', message, 'port', port)
        switch (message.type) {
            case "REQUEST_INJECTION":
                try {
                    const res = await injectScript(message.scriptKey, message.tabId, message.args)
                    console.log('Background - Success injecting:', message.scriptKey)
                    port.postMessage({ type: 'INJECT_RESULT', scriptKey: message.scriptKey, injectSuccessful: res, tabId: message.tabId })
                }
                catch (e) {
                    console.log(e)
                }
                break;

            case "COPY_TEXT_TO_CLIPBOARD":
                try {
                    const scriptKey = 'copyTextToClipboard'
                    const res = await injectScript(scriptKey, message.tabId, [message.textToCopy])
                    console.log('Background - Success injecting:', scriptKey)
                    port.postMessage({ type: 'INJECT_RESULT', scriptKey: scriptKey, injectSuccessful: res, tabId: message.tabId })
                }
                catch (e) {
                    console.log(e)
                }
                break;

        }

    }


    const onCompletedHandler = async function (details) {
        //console.log('Window loaded. Details: ', details)
        if (details.url?.startsWith('chrome://')) return undefined
        if (details.frameId === 0 && details.tabId) {

            try {
                port.postMessage({ type: 'WINDOW_LOADED', tabId: details.tabId })

            } catch (e) {
                console.log(e)
            }
        }
    }

    const onBeforeNavigateHandler = async function (details) {
        //console.log('Window about to navigate. Details: ', details)
        if (details.url?.startsWith('chrome://')) return undefined
        if (details.frameId === 0 && details.tabId) {

            try {
                port.postMessage({ type: 'BEFORE_NAVIGATE', tabId: details.tabId })
            } catch (e) {
                console.log(e)
            }
        }
    }

    if (port.name == 'devtools-page') {
        // add the listener
        port.onMessage.addListener(devToolsListener);
        chrome.webNavigation.onCompleted.addListener(onCompletedHandler)
        chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)
        port.onDisconnect.addListener(function () {
            console.log('Background.js -- port disconnected, removing listener.')
            port.onMessage.removeListener(devToolsListener);
        });
    }

});

