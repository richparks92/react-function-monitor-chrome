/*global chrome*/

export function getBackgroundConnection() {
    console.log('Creating backgroundPageConnection (requestScriptInjection).')
    const backgroundPageConnection = chrome.runtime.connect({
        name: "devtools-page"
    });

    return backgroundPageConnection

}

export function requestScriptInjection(backgroundConnection, scriptKey) {
    // Relay the tab ID to the background page
    console.log('Requesting script injection for: ', scriptKey )
    backgroundConnection.postMessage({
        type: 'REQUEST_INJECTION',
        scriptKey: scriptKey,
        tabId: chrome.devtools.inspectedWindow.tabId
    });
}

