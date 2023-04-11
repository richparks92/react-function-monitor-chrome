/*global chrome*/
//Will replace sendInjectMessages
// DevTools page -- devtools.js
// Create a connection to the background page
 const scriptInjectionDetails = {
    test1: {

        target: { tabId: chrome.devtools.inspectedWindow.tabId, allFrames: false },
        files: ['/chrome-pages/content-scripts/test1.js'],
        world: 'ISOLATED'

    },
    addDomListeners: {
        target: { tabId: chrome.devtools.inspectedWindow.tabId, allFrames: false },
        files: ['/chrome-pages/content-scripts/addDomListeners.js'],
        world: 'ISOLATED'
    },
    getFunctionList: {
        target: { tabId: chrome.devtools.inspectedWindow.tabId, allFrames: false },
        files: ['/chrome-pages/content-scripts/addDomListeners.js'],
        world: 'MAIN'
    }

}

export function getBackgroundConnection() {
    const backgroundPageConnection = chrome.runtime.connect({
        name: "devtools-page"
    });

    backgroundPageConnection.onMessage.addListener(function (message) {
        // Handle responses from the background page, if any
        console.log('Message Response:', message)
    });
    return backgroundPageConnection

}

export function sendInjectTestScript(backgroundPageConnection) {
    // Relay the tab ID to the background page
    backgroundPageConnection.postMessage({
        type: 'REQUEST_INJECTION',
        scriptInjection: {
            target: { tabId: chrome.devtools.inspectedWindow.tabId, allFrames: false },
            files: ['/chrome-pages/content-scripts/test1.js'],
            world: 'ISOLATED'
        }

    });
}

export function requestScriptInjection(backgroundPageConnection, scriptKey) {
    // Relay the tab ID to the background page
    backgroundPageConnection.postMessage({
        type: 'REQUEST_INJECTION',
        scriptInjection: scriptInjectionDetails[scriptKey]
    });
}

