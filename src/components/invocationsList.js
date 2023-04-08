import 'primeflex/primeflex.css';
import { DataView } from 'primereact/dataview';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact';
import 'primeicons/primeicons.css';
import { getTreeNodesFromInvocation, getCurrentTab } from '../scripts/util/helpers';
import date from 'date-and-time'
/*global chrome*/

//The outer row will separate function name/time called and the tree table
const dataViewItemTemplate = (invocationRecord) => {
    const treeNodes = getTreeNodesFromInvocation(invocationRecord.callArgs);
    const iDate = new Date(invocationRecord.timestamp)
    const iTime = date.format(iDate, 'hh:mm.SS [GMT]Z')
    return (
        <div className="col-12">
            <div className="flex flex-column xl:flex-row xl:align-items-start p-2 gap-2">
                <div className="flex flex-row xl:align-items-start">
                    <div className='flex-grow-1 flex-column'>
                        <div className="text-base font-bold">{invocationRecord.fnPath}</div>
                        <div className="text-base text-500">{iTime}</div>
                    </div>
                    <div className='flex-none flex-column'>
                        <Button label = "Copy JSON" icon="pi pi-copy" size = "small" onClick={async ()=>{
                            console.log('Before copy')
                            try {
                                
                                const res = await chrome.runtime.sendMessage({ type: 'SEND_INVOCATION_RECORD', 
                                tabId: await getCurrentTab().id, 
                                invocationRecordString: JSON.stringify(invocationRecord) })

                                console.log('Record copied to clipboard');
                              } catch (err) {
                                console.error('Failed to copy: ', err);
                              }
                        }}/>
                    </div>
                </div>

                <Tree value={treeNodes}
                    nodeTemplate={treeNodeTemplate}>
                </Tree>
            </div>
        </div>
    );
};

const treeNodeTemplate = (node) => {
    let label = ''
    if (node.data && node.data.objKey) {
        label = <div><span>{node.data.objKey}: </span><span style={{ color: 'blue' }}>{node.data.objVal}</span></div>;
    } else {
        label = <span>{node.label}</span>
    }
    return label;
}

/*
format of invocation record
{type: 'FUNCTION_CALL_EVENT', callArgs: args, timestamp: Date.now(), fnPath: '${fnPath}'}*/
export default function InvocationsList2(props) {
    console.log(`Props: ${JSON.stringify(props)}`)
    const invocationRecords = props.invocationRecords.map((invocationRecord, index) => {
        invocationRecord._index = index
        return invocationRecord
    })
    return (
        <div className='flex flex-column xl:flex-row xl:align-items-start p-4 gap-1'>
            <div className='text-xl font-bold'>Function Invocations</div>
            <DataView value={invocationRecords}
                itemTemplate={dataViewItemTemplate}
                sortField='_index'
                sortOrder={-1}
                emptyMessage="No recorded invocations yet.">

            </DataView>
        </div>
    )
}