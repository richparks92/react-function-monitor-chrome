import {DataTable} from 'primereact/datatable'
import { Column } from 'primereact/column';

export default function invocationsListOld(props){
    const invocationRecords = props.invocationRecords.map((invocationRecord)=> {
        invocationRecord.callArgs = JSON.stringify(invocationRecord.callArgs)
        //console.log(`InvocationList map: ${invocationRecord}`)
        return invocationRecord
    })
    //console.log(`Invocation Records: ${invocationRecords}`)

return (
//changed from props.invocationRecords
<DataTable value = {invocationRecords} responsiveLayout="scroll" emptyMessage="iss empty">
    
    <Column field = "fnPath" header="Function Path" ></Column>
    <Column field = "callArgs" header="Call Arguments" ></Column>
    <Column field = "timestamp" header="Timestamp" ></Column>
</DataTable>

)
}