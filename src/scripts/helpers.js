export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))


export const extractArguments = (fnString) => {
  fnString = fnString || ''
  var rgx = /function\((?<args>[^)]*)/g
  var extracted = rgx.exec(fnString)
  let argsStr = ''
  if (extracted && extracted.groups) {
    argsStr = extracted.groups.args || ''
  }
  const argsArray = argsStr.replaceAll(' ', '').split(',')

  return argsArray
}


export function getWindowFunctionsList(parentObj, parentPathStr) {
  let fnArray = [];
  const rgx = /window\.(?:[0-9]+\.)|\.(?:(?:(?:document)|(?:history)|(?:opener)|(?:frameElement)|(?:navigator)|(?:location)))/;
  let counter = 0;
  const MAX_DEPTH = 5;

  function extractFns(parentObj, parentPathStr, depth) {
      if (counter >= 1000) return
      if (depth > MAX_DEPTH) return
      depth = depth ? depth : 0
      counter += 1
      parentPathStr = parentPathStr || 'window'
      parentObj = parentObj || this[parentPathStr]

      if (depth === 0) console.log(`Testing eq: ${this['window'] === parentObj}`)

      //Exit entire function if parent object doesn't exist
      if (!parentObj) return
      //Filter out circular references
      for (const key in parentObj) {

          const childObj = parentObj[key]
          const childPathStr = `${parentPathStr}.${key}`
          if (childObj === parentObj) {
              //console.log(`[Continue]: ${typeof childObj} (${counter})`)
              if (depth === 0) continue
              else return
          }

          if (rgx.test(childPathStr)) {
              //console.log(`[Continue]: ${typeof childObj} (${counter})`)
              if (depth === 0) continue
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
      }
  }

  var startTime = performance.now()
  extractFns()
  var endTime = performance.now()
  console.log(fnArray)
  console.log(fnArray.length)
  console.log((endTime - startTime) / 1000)
}