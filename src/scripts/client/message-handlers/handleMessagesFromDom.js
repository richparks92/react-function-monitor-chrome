  //add these handlers to Client
  export async function handleMessagesFromDom(message, port) {
    //console.log('Message from DOM/content script:', message, 'From TabID: ', port.sender.tab.id, 'Port:', port)
    console.log('Message from DOM/content script:', message, 'Port:', port)
    //This will always return false, tabID isn't sent through message

    switch (message.type) {
      case 'FUNCTION_CALL_DETAILS':
        console.log('function_call details message received by devTools.')
        let _data
        _data = message?.data
        if (_data?.callArgs) {
          try {
            _data.callArgs = JSON.parse(_data?.callArgs)
            console.log('Invocation record received', JSON.stringify(_data));

          } catch (e) {
            console.log('Error stringifying callArgs from function call:', e)
            console.log('Message:', message)
          }

        }

        this.addInvocationRecord(_data)
        this.uiSetters.updateStateFromClientDetails()
        break;

      case 'FN_ARRAY_RESULT':
        console.log('fn_array message received by devTools.', message.fnArray)
        this.uiSetters.setFnSuggestionArray(message.fnArray);
        break;
    }
  }