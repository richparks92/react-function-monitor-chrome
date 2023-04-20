import { requestScriptInjection } from '../requestScriptInjection.js'
import { wait } from '../../util/helpers.js'

//this is 'window' in this context
export async function handleMessagesFromBackground(message, port) {

  if (message.tabId !== this.tabId) return

  // Handle responses from the background page, if any
  //make sure tabId is in message sent, look at structure
  if (port.name != 'devtools-page') return
  console.log('Message from background.js:', message, 'Port:', port, 'Client', this)

  switch (message.type) {
    case 'INJECT_RESULT':

      console.log('inject_result message received by devTools: ', message.injectSuccessful)
      if (message?.scriptKey == 'addDomListeners') {
        this.injectStatus.domListenerInjected = message.injectSuccessful
        console.log('Setting Client.injectStatus.domListenerInjected to', this.injectStatus.domListenerInjected, ' based off inject response.')
      }

      if (message?.scriptKey == 'getFunctionList') {
        this.injectStatus.getFnsInjected = message.injectSuccessful
        console.log('Setting Client.getFnsInjected to', this.injectStatus.getFnsInjected, ' based off inject response.')
      }

      if (message?.scriptKey == 'copyTextToClipboard') {
        console.log('Copy inject successful: ', message.injectSuccessful)
      }

      break;

    case 'WINDOW_LOADED':
      console.log('window_loaded message received by devTools.')

      if (!this.injectStatus.domListenerInjected) {
        console.log('Requesting addDomListeners script injection (window_loaded).')
        requestScriptInjection(this.backgroundPageConnection, "addDomListeners");
      }
      await wait(1000)

      if (!this.injectStatus.getFnsInjected) {
        console.log('Requesting getFunctionList script injection (window_loaded).')
        requestScriptInjection(this.backgroundPageConnection, "getFunctionList");
      }

      if (this.enableWrapOnPageLoad == true && !this.isFnWrapped) {
        //Should add setting for wait time
        console.log('Rewrapping function after page load: ')
        await wait(2000);
        await this.wrapFunction();
        this.uiSetters.updateStateFromClientDetails();
        this.uiSetters.setButtonPending(false)

      }
      break;

    case 'BEFORE_NAVIGATE':
      console.log('before_navigate message received by devTools.');
      this.clearInvocationRecords();
      //this.injectStatus.domListenerInjected = false;
      this.injectStatus.getFnsInjected = false;
      if (this.isFnWrapped && this.enableWrapOnPageLoad) this.uiSetters.setButtonPending(true);
      this.isFnWrapped = false
      break;
  }

}