export default async function (tabId, scriptFiles, executeInMainWorld){
    if (!tabId || !scriptFiles || scriptFiles.length < 1) return false
    let isSuccess = false
    let res = await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        files: scriptFiles,
        world: executeInMainWorld ? 'MAIN' : 'ISOLATED'
    });
    if (res.length > 0 && res[0].documentId) {
      isSuccess=true
        console.log('Content script injected. Files:')
        console.log(scriptFiles)
    } else {
        console.log(res)
    }
    return isSuccess
}