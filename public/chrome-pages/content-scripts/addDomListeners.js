console.log('Function call listener contentscript started.')

const port = chrome.runtime.connect({ name: "domListeners" });
port.onMessage.addListener(function (msg) {
  console.log('Port message received from content script.', msg)
});

//Need to add port
window.addEventListener("message", (event) => {
  if (chrome?.runtime) {
    if (event.data.type == 'FUNCTION_CALL_EVENT') {
      port.postMessage({ type: 'FUNCTION_CALL_DETAILS', data: event.data })

    } else if (event.data.type == 'FN_ARRAY_READY_EVENT') {
      port.postMessage({ type: 'FN_ARRAY_RESULT', fnArray: event.data.fnArray })
    }
  }
}, false)