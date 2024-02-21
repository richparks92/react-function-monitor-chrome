# Chrome Function Monitor Extension

## Features
This extension allows you to monitor a webpage for calls of a specified function, and records and lists those function calls in a tab in the inspector. It's meant to be a simple utility to help capture what's happening on a website's frontend. Once a valid function has been entered into the UI, the extension will automatically update with the details of subsequent calls to that function, and will show details of the invocation such as the timestamp and call arguments, which can be displayed as JSON text or in a tree view. You can also copy the JSON data to the clipboard.

![Extension Demo](/images/function-monitor-demo.gif)

## To install
The extension is published to the Chrome Web Store. You can install here: https://chromewebstore.google.com/detail/function-monitor/hhicpplhdikhhcogaibidfhimkblipko?hl=en&authuser=2.

## How to use
Please see the post in my portfolio for a video demonstration of how the extension works: https://richchrisparks.com/wp-admin/post.php?post=61&action=edit. 
1. Navigate to any website and open the Inspector (right click within the webpage and select "Inspect" from the context menu). 
2. Right click and open the inspector, then find the "Function Monitor" tab.
![image info](./images/tab-location.png)
3. Type in the name of a function that exists on the frontend of the webpage (eg `window.dataLayer.push`)- autocomplete will bring up some suggestions of functions the extension has found.
4. Click "Enable Listener." The extension will automatically attempt to re-register the function call listener on refresh and page navigation.

## Development
At a high level, this extension works by "wrapping" the specified function inside a wrapper function, which is able to communicate with the extension backend via port messaging. Those messages are either handled by the extension's background service worker, or passed to the React application defined inside the `/src` folder. The UI and most of the internal logic for the application are handled by the React application.

This UI for this project was created using React and [PrimeReact](https://primereact.org/). This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
