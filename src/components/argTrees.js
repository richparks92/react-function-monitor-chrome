import 'primeflex/primeflex.css';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';

import { Tree } from 'primereact/tree';
import 'primeicons/primeicons.css';
import { getTreeNodesFromInvocation } from '../scripts/helpers';

const treeNodeTemplate = (node) => {
    //let label = <b>{node.label}</b>;
    let label = ''
    if (node.data && node.data.objKey) {
        label = <div><span>{node.data.objKey}: </span><span style={{ color: 'blue' }}>{node.data.objVal}</span></div>;
    } else {
        label = <span>{node.label}</span>
    }
    console.log(node)

    return label;
}

/*
format of invocation record
{type: 'FUNCTION_CALL_EVENT', callArgs: args, timestamp: Date.now(), fnPath: '${fnPath}'}*/
export default function ArgTrees(props) {
    console.log(`Props: ${JSON.stringify(props)}`)
    let singleInvocationRecord = {}
    let treeNodes = []
    const invocationRecords = props.invocationRecords.map((invocationRecord) => {
        invocationRecord.callArgs = JSON.parse(invocationRecord.callArgs)
        console.log(`argTrees map: ${JSON.stringify(invocationRecord)}`)
        return invocationRecord
    })

    if(invocationRecords.length>0) {
        singleInvocationRecord = invocationRecords[invocationRecords.length - 1]
        treeNodes = getTreeNodesFromInvocation(singleInvocationRecord.callArgs);
    }
    console.log('nodes:')
    console.log(treeNodes);

    return (
        <Tree value={treeNodes}
            nodeTemplate={treeNodeTemplate}>
        </Tree>
    )
}