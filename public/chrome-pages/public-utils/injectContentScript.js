export default async function (scriptInjection) {
    try {
        const res = await chrome.scripting.executeScript(scriptInjection);

        if (res.length > 0 && res[0].documentId) {
            isSuccess = true
            console.log('Content script injected. Files:', scriptInjection.files)
            return true
        } else {
            console.log('No error on script injection but did not complete check',res)
            return false
        }
    } catch (e) {
        console.log('Script not injected:', e)
        return false
    }
}