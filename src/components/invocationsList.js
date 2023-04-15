import 'primeflex/primeflex.css';
import '../scripts/ext/prism.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

import React, { useState, useEffect } from "react";
import { DataView } from 'primereact/dataview';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SelectButton } from 'primereact/selectbutton';
import 'primeicons/primeicons.css';
import { getTreeNodesFromInvocation, getCurrentTab } from '../scripts/util/helpers';
import date from 'date-and-time';

/*global chrome*/

const treeNodeTemplate = (node) => {
    let label = ''
    if (node.data && node.data.objKey) {
        label = <div><span>{node.data.objKey}: </span><span style={{ color: 'blue' }}>{node.data.objVal}</span></div>;
    } else {
        label = <span>{node.label}</span>
    }
    return label;
}

//The outer row will separate function name/time called and the tree table
const dataViewItemTemplate = (invocationRecord, options, backgroundConnection) => {

    const iDate = new Date(invocationRecord.timestamp)
    const iTime = date.format(iDate, 'hh:mm.SS [GMT]Z')
    return (
        <div className="col-12">
            <div className="flex flex-column p-2 gap-2">
                <div className="flex flex-row">
                    <div className='flex-grow-1 flex-column'>
                        <div className="text-base font-bold">{invocationRecord.fnPath}</div>
                        <div className="text-base text-500">{iTime}</div>
                    </div>
                    <div className='flex-column'>
                        <Button label="Copy JSON" icon="pi pi-copy" size="small" onClick={async () => {
                            console.log('Before copy')
                            let recCopy = JSON.parse(JSON.stringify(invocationRecord))
                            try {
                                backgroundConnection.postMessage({
                                    type: 'COPY_TEXT_TO_CLIPBOARD',                                  
                                    tabId: chrome.devtools.inspectedWindow.tabId,
                                    textToCopy: JSON.stringify(recCopy)
                                })

                                console.log('Record copied to clipboard');
                            } catch (err) {
                                console.error('Failed to copy: ', err);
                            }
                        }} />
                    </div>
                </div>

                <ArgumentsDisplay invocationRecord={invocationRecord} options={options} />
            </div>
        </div>
    );
};



function ArgumentsDisplay({ invocationRecord, options }) {

    useEffect(() => {
        Prism.highlightAll(false, ()=>{
            console.log('highlighted.')
        });
    }, [invocationRecord, options]);

    const displayOption = options.displayOption
    console.log('Display option:', displayOption)
    if (displayOption == 'tree') {
        const treeNodes = getTreeNodesFromInvocation(invocationRecord?.callArgs);
        return (
            <div>
                <Tree value={treeNodes}
                    nodeTemplate={treeNodeTemplate}>
                </Tree>
            </div>
        )
    } else if (displayOption == 'json') {
        const recString = JSON.stringify(invocationRecord, null, 2)
        return (

            <div>
                <ScrollPanel>
                    <pre><code className={'language-json'}>{recString}</code></pre>
                </ScrollPanel>
            </div>

        )
    } else {
        return (<div></div>)
    }
}

/*
format of invocation record
{type: 'FUNCTION_CALL_EVENT', callArgs: args, timestamp: Date.now(), fnPath: '${fnPath}'}*/
export default function InvocationsList({invocationRecords, backgroundConnection}) {
    console.log('Loading InvocationsList. Records: ', invocationRecords)
    const options = [{ name: "JSON View", value: "json" }, { name: "Tree View", value: "tree" }]
    const [displayOption, setDisplayOption] = useState("json")

    invocationRecords = invocationRecords.map((invocationRecord, index) => {
        invocationRecord._index = index
        return invocationRecord
    })
    return (
        <div className='flex flex-column p-4 gap-1'>
            <div className='text-xl font-bold'>Function Invocations</div>
            <SelectButton value={displayOption}
                onChange={(e) => setDisplayOption(e.value)} options={options} optionLabel="name" />

            <DataView value={invocationRecords}
                itemTemplate={(item) => { return (dataViewItemTemplate(item, { displayOption: displayOption }, backgroundConnection)) }}
                sortField='_index'
                sortOrder={-1}
                emptyMessage="No recorded invocations yet."
                options={{ displayOption: displayOption }}>

            </DataView>
        </div>
    )
}