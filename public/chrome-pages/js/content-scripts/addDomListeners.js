(()=>{
  //console.log('addDomListeners started.')
let isInjected
//Need to add disconnect listener
function addDomListeners() {

  let domListenerPort
  if (domListenerPort) return
  //console.log('Creating "dom-listeners" port connection [addDomListeners -> initializeMessageHandlers]')
  domListenerPort = chrome.runtime.connect({ name: "dom-listeners" });
  domListenerPort.onMessage.addListener(function (message) {
    //console.log('Port message received in content script.', message)
  });

  try {
    window.addEventListener("message", (event) => {
      if (chrome?.runtime) {
        if (event.data.type == 'FUNCTION_CALL_EVENT') {
          domListenerPort.postMessage({ type: 'FUNCTION_CALL_DETAILS', data: event.data.invocationRecord })

        } else if (event.data.type == 'FN_ARRAY_READY_EVENT') {
          domListenerPort.postMessage({ type: 'FN_ARRAY_RESULT', fnArray: event.data.fnArray })
        }
      }
    }, false)
    isInjected  = true
    //return true
  }
  catch (e) {
    console.log(e)
    //return false
  }

}
if (!isInjected) addDomListeners()
})()
