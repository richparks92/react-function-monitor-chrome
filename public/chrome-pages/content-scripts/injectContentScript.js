export default async function injectContentScript(tabId) {
    if (!tabId) return
    let isSuccess = false
    let res = await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        files: ['/chrome-pages/content-scripts/addFunctionCallListener.js']
    });
    if (res.length > 0 && res[0].documentId) {
      isSuccess=true
        console.log('Content script injected')
    } else {
        console.log(res)
    }
    return isSuccess
}