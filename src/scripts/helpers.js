/*global chrome*/

export const ATTN_TAG_URL_REGEX = /https:\/\/cdn\.attn\.tv\/attn\.js\?/g
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
export const unique = (value, index, self) => {
  return self.indexOf(value) === index
}
