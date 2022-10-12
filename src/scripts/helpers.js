/*global chrome*/

export const ATTN_TAG_URL_REGEX = /https:\/\/cdn\.attn\.tv\/attn\.js\?/g
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
export const unique = (value, index, self) => {
  return self.indexOf(value) === index
}

  export const injectContentScript = async function (tabId) {
    if (!tabId) return
    let isSuccess = false
    let res = await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        files: ['./content-scripts/addFunctionCallListener.js']
    });
    if (res.length > 0 && res[0].documentId) {
      isSuccess=true
        console.log('Content script injected')
    } else {
        console.log(res)
    }
    return isSuccess
}

export const logObject =function(summary, detail){
  console.log(summary)
  if(detail) console.log(detail)
}