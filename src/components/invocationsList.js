import 'primeflex/primeflex.css';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';

import { Tree } from 'primereact/tree';
import 'primeicons/primeicons.css';
import { getTreeNodesFromInvocation } from '../scripts/helpers';

const tempArgs = [{
    'transactionProducts': [{
        'sku': 'DD44',
        'name': 'T-Shirt',
        'category': 'Apparel',
        'price': 11.99,
        'quantity': 1
    }, {
        'sku': 'AA1243544',
        'name': 'Socks',
        'category': 'Apparel',
        'price': 9.99,
        'quantity': 2
    }]
},
    'stringTest']

const nodes = [
    {
        "key": "0",
        "inputType": "obj",
        "label": "Object {}",
        "icon": "pi pi-box",
        "children": [
            {
                "key": "0-0",
                "inputType": "obj",
                "label": "container {}",
                "icon": "pi pi-box",
                "children": [
                    {
                        "key": "0-0-0",
                        "inputType": "num",
                        "data": {
                            "objKey": "b",
                            "objVal": 1
                        },
                        "label": 1,
                        "icon": "pi pi-calculator"
                    },
                    {
                        "key": "0-0-1",
                        "inputType": "num",
                        "data": {
                            "objKey": "c",
                            "objVal": 2
                        },
                        "label": 2,
                        "icon": "pi pi-calculator"
                    }
                ]
            }
        ]
    },
    {
        "key": "1",
        "inputType": "str",
        "label": "hi",
        "icon": "pi pi-pencil"
    },
    {
        "key": "2",
        "inputType": "arr",
        "label": "Array [2]",
        "icon": "pi pi-list",
        "children": [
            {
                "key": "2-0",
                "inputType": "num",
                "label": 3,
                "icon": "pi pi-calculator"
            },
            {
                "key": "2-1",
                "inputType": "num",
                "label": 4,
                "icon": "pi pi-calculator"
            }
        ]
    },
    {
        "key": "3",
        "inputType": "arr",
        "label": "Array [1]",
        "icon": "pi pi-list",
        "children": [
            {
                "key": "3-0",
                "inputType": "obj",
                "label": "Object {}",
                "icon": "pi pi-box",
                "children": [
                    {
                        "key": "3-0-0",
                        "inputType": "str",
                        "data": {
                            "objKey": "five",
                            "objVal": "six"
                        },
                        "label": "six",
                        "icon": "pi pi-pencil"
                    }
                ]
            }
        ]
    }
];

//The outer row will separate function name/time called and the tree table
const dataViewItemTemplate = (invocationRecord) => {
    console.log('dv template')
    const treeNodes = getTreeNodesFromInvocation(invocationRecord.callArgs);
    console.log('nodes:')
    console.log(treeNodes)

    return (
        <div className="col-12">
            <div className="flex flex-row gap-4">
                <div className='flex flex-column'>
                    <div className="text-lg font-bold text-500">SAMPLE FUNCTION NAME</div>
                </div>
                <div className='flex flex-column' >
                    <Tree value={treeNodes}
                        nodeTemplate={treeNodeTemplate}>
                    </Tree>
                </div>
            </div>
        </div>
    );
};

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
export default function InvocationsList2(props) {
    console.log(`Props: ${JSON.stringify(props)}`)
    const invocationRecords = props.invocationRecords.map((invocationRecord) => {
        invocationRecord.callArgs = JSON.parse(invocationRecord.callArgs)
        //console.log(`InvocationList2 map: ${JSON.stringify(invocationRecord)}`)
        return invocationRecord
    })
    console.log(`InvocationsList2 records ${JSON.stringify(invocationRecords)}`)
    return (
        <DataView value= {invocationRecords} itemTemplate={dataViewItemTemplate}></DataView>
    )
}