/*global chrome*/

export function requestScriptInjection(backgroundConnection, scriptKey) {
    // Relay the tab ID to the background page
    console.log('Requesting script injection for: ', scriptKey )
    backgroundConnection.postMessage({
        type: 'REQUEST_INJECTION',
        scriptKey: scriptKey,
        tabId: chrome.devtools.inspectedWindow.tabId
    });
}

