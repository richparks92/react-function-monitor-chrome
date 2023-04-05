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

export const getTreeNodesFromInvocation = function (argsList) {
  console.log(`argsList ${argsList}`)
  if (!argsList || !Array.isArray(argsList)) {
    console.log('argsList is not array')
    console.log(argsList)
    return []
  }
  const isPureObject = function isPureObject(input) {
    return null !== input &&
      typeof input === 'object' &&
      Object.getPrototypeOf(input).isPrototypeOf(Object);
  }

  const getInputType = function (input) {
    let inputType = ''
    if (typeof (input) === 'string') {
      inputType = 'str'
    } else if (['number', 'bigint'].includes(typeof (input))) {
      inputType = 'num'
    } else if (isPureObject(input)) {
      inputType = 'obj'
    } else if (Array.isArray(input)) {
      inputType = 'arr'
    }
    return inputType
  }

  const getNewNodeKey = function (currKey, index) {
    const newKey = currKey + '-' + index.toString();
    return newKey
  }

  const getIcon = function (inputType) {
    const iconLookup = {
      arr: 'pi pi-list',
      obj: 'pi pi-box',
      str: 'pi pi-pencil',
      num: 'pi pi-calculator'
    }
    return iconLookup[inputType] || ''
  }
  function extractNode(input, nodeKey, parentKey) {

    //Set up
    let thisNode = {}

    nodeKey = nodeKey || '0'
    thisNode.key = nodeKey
    const inputType = getInputType(input)
    thisNode.inputType = inputType

    //If arg is a string or number
    if (['str', 'num'].includes(inputType)) {
      if (parentKey) {
        const nodeData = { objKey: parentKey, objVal: input }
        thisNode.data = nodeData
      }
      thisNode.label = input
    }

    //If object
    if (inputType == 'obj') {
      let children = []
      const keys = Object.keys(input)
      thisNode.label = parentKey ? `${parentKey} {${keys.length}}` : `Object {${keys.length}}`
      thisNode.icon = 'pi pi-box';

      //Iterate through object's keys
      children = keys.map((objKey, index) => {
        const newNodeKey = getNewNodeKey(nodeKey, index)
        const objVal = input[objKey];
        return (extractNode(objVal, newNodeKey, objKey))
      })

      thisNode.children = children;
    }

    //If array
    if (inputType == 'arr') {
      //Regular array
      let children = []
      thisNode.label = parentKey ? `${parentKey} [${input.length}]` : `Array [${input.length}]`;
      thisNode.icon = 'pi pi-list';
      children = input.map((el, index) => {
        const newKey = getNewNodeKey(nodeKey, index)
        return (extractNode(el, newKey))
      })
      thisNode.children = children;
    }

    thisNode.icon = getIcon(inputType)

    //Final return
    return thisNode
  }

  let nodes = []
  try {
    argsList.forEach((arg, index) => {
      const node = extractNode(arg, index.toString())
      nodes.push(node)
    })

    return nodes

  } catch (e) {
    console.log(e)
  }

}