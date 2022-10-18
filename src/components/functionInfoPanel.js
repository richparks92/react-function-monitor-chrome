import './functionInfoPanel.css'
import { Divider } from 'primereact/divider';
export default function FunctionInfoPanel({functionName, functionParentPath}){
    return(    <div id="functionInfoContainer">
    <div id="functionNamePanel" className="functionInfoPanel">
      <span className='infoLabel'>Function Name</span>
      <strong className= "infoLabelSpan" display='block'>{functionName}</strong>
    </div>
    <div id="functionPathPanel" className='functionInfoPanel'>
    <span className='infoLabel' id="functionInfoPanel">Function Path</span>
      <strong className='infoLabelSpan'>{functionParentPath}</strong>
    </div>

  </div>)

}