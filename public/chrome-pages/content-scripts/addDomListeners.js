console.log('Function call listener contentscript started.')

window.addEventListener("message", (event) => {
    if (chrome && chrome.runtime){

    
    if (event.data.type == 'FUNCTION_CALL_EVENT') {
      chrome.runtime.sendMessage({ type: 'FUNCTION_CALL_DETAILS', data: event.data })

    } else if (event.data.type == 'FN_ARRAY_READY_EVENT') {
      chrome.runtime.sendMessage({ type: 'FN_ARRAY_RESULT', fnArray: event.data.fnArray })
    }
  }
}, false)