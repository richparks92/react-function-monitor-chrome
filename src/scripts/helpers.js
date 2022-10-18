export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const extractArguments = (fnString) => {
  var rgx = /function\((?<args>[^)]*)/g
  var extracted = rgx.exec(fnString)
  let argsStr = ''
  if (extracted.groups) {
    argsStr = extracted.groups.args || ''
  }
  const argsArray = argsStr.replaceAll(' ', '').split(',')

  return argsArray
}