export async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
} 

export function injectedCopyFunction(textToCopy) {
    let input = document.createElement('textarea');
    input.style.cssText = 'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
    document.body.appendChild(input);
    input.value = textToCopy;
    input.focus();
    input.select();
    document.execCommand("copy");
    input.remove();
}