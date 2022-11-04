(()=>{
function getWindowFunctionsList(_parentObj, _parentPathStr) {
  let fnArray = [];
  const rgx = /window\.(?:[0-9]+)|\.(?:(?:(?:document)|(?:history)|(?:opener)|(?:frameElement)|(?:ServiceWorkerContainer)|(?:navigator)|(?:location)))/;
  let counter = 0;
  let MAX_COUNT = 1000
  const MAX_DEPTH = 5;

  function extractFns(parentObj, parentPathStr, depth) {

    if (counter >= MAX_COUNT) {
      //console.log(`Counter reached ${MAX_COUNT}`)
      //return
    }

    if (depth > MAX_DEPTH) return
    depth = depth ? depth : 1
    counter += 1
    parentPathStr = parentPathStr || 'window'
    parentObj = parentObj || this[parentPathStr]

    //Exit entire function if parent object doesn't exist
    if (!parentObj) return
    //Filter out circular references
    const parentKeys = Object.keys(parentObj)
    const filteredKeys = parentKeys.filter((key)=>{
      return !rgx.test(key)
    })
    //for (const key in parentObj)
    for (const key of filteredKeys) {
      
      try {
        const childObj = parentObj[key]
        const childPathStr = `${parentPathStr}.${key}`
        //console.log(`${childPathStr} | Depth: ${depth}`)
        //console.log(childPathStr)
        if (childObj === parentObj) {
          //console.log(`[Continue]: ${typeof childObj} (${counter})`)
          if (depth === 1) continue
          else return
        }

        if (rgx.test(childPathStr)) {
          //console.log(`[RegEx filter]: ${childPathStr}`)
          if (depth === 1) continue
          else return
        }
        if (typeof childObj === 'function') {
          fnArray.push(childPathStr)
          //console.log(`Pushed [${childPathStr}]: ${typeof childObj} (${counter})`)
          continue
        }
        if (typeof childObj === 'object') {
          //console.log(`Searching [${childPathStr}]: ${typeof childObj}(${counter})`)
          extractFns(childObj, childPathStr, depth + 1);
          continue
        }
      } catch (e) {
        console.log(`Error pulling functions list on [${parentPathStr}.${key}]`)
        console.log(e)
        console.log(parentPathStr)
      }
    }
  }

  var startTime = performance.now()
  extractFns(_parentObj, _parentPathStr)
  var endTime = performance.now()
  return fnArray
}

let fnArray = getWindowFunctionsList(window, 'window')
window.postMessage({type: 'FN_ARRAY_READY_EVENT', fnArray: fnArray})
// fnArray = null
// getWindowFunctionsList = null
})()