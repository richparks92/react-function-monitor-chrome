/*global chrome*/

export const ATTN_TAG_URL_REGEX = /https:\/\/cdn\.attn\.tv\/attn\.js\?/g
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
export const unique = (value, index, self) => {
  return self.indexOf(value) === index
}
export const extractArguments = (fnString) => {
  var rgx = /function\((?<args>[^\)]*)/g
  var extracted = rgx.exec(fnString)
  let argsStr = ''
  if (extracted.groups){
    argsStr = extracted.groups.args||''
  }
  const argsArray =argsStr.replaceAll(' ', '').split(',')

  return argsArray
}