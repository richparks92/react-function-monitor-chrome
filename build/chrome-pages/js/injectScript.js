const scriptInjectionDetails = {
    addDomListeners: {
        target: { tabId: '', allFrames: false },
        files: ['/chrome-pages/js/content-scripts/addDomListeners.js'],
        world: 'ISOLATED'
    },
    getFunctionList: {
        target: { tabId: '', allFrames: false },
        files: ['/chrome-pages/js/content-scripts/getFunctionList.js'],
        world: 'MAIN'
    },
    copyTextToClipboard: {
        target: { tabId: '', allFrames: false },
        func: injectedCopyFunction,
        args: [],
        world: 'ISOLATED'
    }
}

function injectedCopyFunction(textToCopy) {
    let input = document.createElement('textarea');
    input.style.cssText = 'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
    document.body.appendChild(input);
    input.value = textToCopy;
    input.focus();
    input.select();
    document.execCommand("copy");
    input.remove();
}

export default async function injectScript(scriptKey, tabId, args) {
    const scriptInjection = scriptInjectionDetails[scriptKey]
    scriptInjection.target.tabId = tabId
    if (args) scriptInjection.args = args
    try {
        const res = await chrome.scripting.executeScript(scriptInjection);

        if (res.length > 0 && res[0].documentId) {
            console.log('Content script injected. Files:', scriptInjection.files)
            return true
        } else {
            console.log('No error on script injection but did not complete check', res)
            return false
        }
    } catch (e) {
        console.log('Script not injected:', e)
        return false
    }
}