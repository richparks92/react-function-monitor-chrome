import {DataTable} from 'primereact/datatable'
import { Column } from 'primereact/column';

export default function InvocationsList(props){
return(

<DataTable value = {props.invocationRecords} responsiveLayout="scroll">
    <Column field = "fnPath" header="Function Path" ></Column>
    <Column field = "callArgs" header="Call Arguments" ></Column>
    <Column field = "timestamp" header="Timestamp" ></Column>
</DataTable>

)
}