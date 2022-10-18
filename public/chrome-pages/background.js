import injectContentScript  from "./content-scripts/injectContentScript.js"
console.log('Background page starting.')

const onCompletedHandler = async function (details) {
    if (details.parentFrameId == -1 && details.tabId) {
        try{
            //Should probably add onConnect listener to set a variable for checking
            const res = await chrome.runtime.sendMessage({ type: 'WINDOW_LOADED', tabId: details.tabId })
        } catch(e){
            console.log(e)
        }
    }
}
const onBeforeNavigateHandler= async function(details){
    if (details.parentFrameId == -1 && details.tabId) {
        try{
            const res = await chrome.runtime.sendMessage({ type: 'BEFORE_NAVIGATE', tabId: details.tabId })
        } catch(e){
            console.log(e)
        }
    }
}
const onMessageHandler = function (message, sender, sendResponse) {
    (async () => {
        if (message.type == 'INJECT_SCRIPT_TO_TAB') {

            if (!message.tabId) sendResponse(false)
            const injectSuccess = await injectContentScript(message.tabId)
            sendResponse(injectSuccess)
        } else if (message.type == 'LOG') {
            console.log('LOG: ' + message.logSummary)
            if (message.logDetail) console.log(message.logDetail)
            sendResponse()
        }
        else {
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