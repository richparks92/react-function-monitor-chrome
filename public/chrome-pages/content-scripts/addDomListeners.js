console.log('Function call listener contentscript started.')

function addDomListeners() {

  let domListenerPort
  if (domListenerPort) return
  domListenerPort = chrome.runtime.connect({ name: "dom-listeners" });
  domListenerPort.onMessage.addListener(function (message) {
    console.log('Port message received in content script.', message)
  });


  window.addEventListener("message", (event) => {
    if (chrome?.runtime) {
      if (event.data.type == 'FUNCTION_CALL_EVENT') {
        domListenerPort.postMessage({ type: 'FUNCTION_CALL_DETAILS', data: event.data })

      } else if (event.data.type == 'FN_ARRAY_READY_EVENT') {
        domListenerPort.postMessage({ type: 'FN_ARRAY_RESULT', fnArray: event.data.fnArray })
      }
    }
  }, false)
}
addDomListeners()

