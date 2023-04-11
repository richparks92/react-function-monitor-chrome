import injectContentScript from "./public-utils/injectContentScript.js"
import { getCurrentTab, injectedCopyFunction } from "./public-utils/utils.js"

/////
//
/////

// Background page -- background.js
chrome.runtime.onConnect.addListener(function (devToolsConnection) {
    // assign the listener function to a variable so we can remove it later
    var devToolsListener = async function (message, sender, sendResponse) {
        console.log('devToolsConnection', message)
        switch (message.type) {
            case "REQUEST_INJECTION":
                try {
                    await injectContentScript(message.scriptInjection)
                    devToolsConnection.postMessage('Success')
                }
                catch (e) {
                    console.log(e)
                }
        }



    }
    // add the listener
    devToolsConnection.onMessage.addListener(devToolsListener);

    devToolsConnection.onDisconnect.addListener(function () {
        devToolsConnection.onMessage.removeListener(devToolsListener);
    });
});

/////
//
/////


console.log('Background page starting.')



//Sending messages to App (via injectContentScript).
//Will fire once web pages fully load

const onCompletedHandler = async function (details) {
    if (details.url?.startsWith('chrome://')) return undefined
    if (details.parentFrameId == -1 && details.tabId) {
        try {
            const res = await chrome.runtime.sendMessage({ type: 'WINDOW_LOADED', tabId: details.tabId })
            if (!res.domListenerInjected) {
                const injectedListenerScript = await injectContentScript(details.tabId, ['/chrome-pages/content-scripts/addDomListeners.js'], true)
                const injectedGetFunctionScript = await injectContentScript(details.tabId, ['/chrome-pages/content-scripts/getFunctionList.js'])

            }
        } catch (e) {
            console.log(e)
        }
    }
}

//Fires when page is about to change/navigate
const onBeforeNavigateHandler = async function (details) {
    if (details.url?.startsWith('chrome://')) return undefined
    if (details.parentFrameId == -1 && details.tabId) {
        try {
            const res = await chrome.runtime.sendMessage({ type: 'BEFORE_NAVIGATE', tabId: details.tabId })
        } catch (e) {
            console.log(e)
        }
    }
}

const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {

        if (sender && sender.url.startsWith('chrome://')) sendResponse(false)
        if (message.type == 'INJECT_SCRIPT_TO_TAB') {
            console.log('Received inject message.')
            if (!message.tabId || !message.scriptFiles || message.scriptFiles.length < 1) sendResponse(false)
            const injectSuccess = await injectContentScript(message.tabId, message.scriptFiles, message.executeInMainWorld)
            sendResponse(injectSuccess)
            //sendResponse
        } else if (message.type == 'LOG') {
            console.log('LOG: ' + message.logSummary)
            if (message.logDetail) console.log(message.logDetail)
            sendResponse()
        } else if (message.type == 'SEND_INVOCATION_RECORD') {
            console.log('Received invocation record details from devtools.')
            if (message.invocationRecordString) {
                const currTab = await getCurrentTab()
                const res = await chrome.scripting.executeScript({
                    target: { tabId: currTab.id },
                    func: injectedCopyFunction,
                    args: [message.invocationRecordString]
                });
                console.log('Res', res)
            }
            sendResponse()
        } else {
            sendResponse()
        }
    })()
    return true
}


////////////
//
////////////
//const port = 
const registerListeners = function () {
    chrome.runtime.onMessage.addListener(onMessageHandler)
    chrome.webNavigation.onCompleted.addListener(onCompletedHandler)
    chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)
}

registerListeners()