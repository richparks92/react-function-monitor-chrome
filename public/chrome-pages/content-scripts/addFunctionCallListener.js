console.log('Function call listener contentscript started.')

window.addEventListener("message", (event) => {
    if (event.data.type == 'FUNCTION_CALL_EVENT'){
      chrome.runtime.sendMessage({type:'FUNCTION_CALL_DETAILS', data: event.data})

    } else if (event.data.type== 'FN_ARRAY_READY_EVENT'){
      chrome.runtime.sendMessage({type:'FN_ARRAY_RESULT', data: event.data.data})
    }
  }, false)