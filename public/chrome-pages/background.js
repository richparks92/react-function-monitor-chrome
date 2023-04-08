import injectContentScript from "./public-utils/injectContentScriptFile.js"
import { getCurrentTab, injectedCopyFunction} from "./public-utils/utils.js"

console.log('Background page starting.')

//Will fire once web pages fully load
const onCompletedHandler = async function (details) {
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
const onBeforeNavigateHandler = async function (details) {
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
        if (message.type == 'INJECT_SCRIPT_TO_TAB') {
            console.log('Received inject message.')
            if (!message.tabId || !message.scriptFiles || message.scriptFiles.length < 1) sendResponse(false)
            const injectSuccess = await injectContentScript(message.tabId, message.scriptFiles, message.executeInMainWorld)
            sendResponse(injectSuccess)
            sendResponse
        } else if (message.type == 'LOG') {
            console.log('LOG: ' + message.logSummary)
            if (message.logDetail) console.log(message.logDetail)
            sendResponse()
        } else if (message.type == 'SEND_INVOCATION_RECORD'){
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

chrome.runtime.onMessage.addListener(onMessageHandler)
chrome.webNavigation.onCompleted.addListener(onCompletedHandler)
chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)