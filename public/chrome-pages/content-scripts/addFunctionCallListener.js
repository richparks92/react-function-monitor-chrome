console.log('Function call listener contentscript started.')

window.addEventListener("message", (event) => {
    if (event.data.type == 'FUNCTION_CALL_EVENT'){
      // console.log(event.data)
      // console.log(event.data.callArgs.toString())
      chrome.runtime.sendMessage({type:'FUNCTION_CALL_DETAILS', data:event.data})
    }
  }, false)