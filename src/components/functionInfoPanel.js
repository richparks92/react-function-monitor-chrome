import React from 'react'
import './css/functionInfoPanel.css'
import {Card} from 'primereact/card'
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

export default function FunctionInfoPanel({functionName, functionParentPath}){
    return(    
    <div id="functionInfoContainer">
      {/* <div id="functionNamePanel" className="functionInfoPanel">
      <Card title ="Function Name">{functionName}</Card>
    </div>
    
    <div id="functionPathPanel" className='functionInfoPanel'>
    <Card title ="Function Path">{functionParentPath}</Card>
    </div> */}
    <div id="functionNamePanel" className="functionInfoPanel">
      <Card title ="Function Name" width = "500px"><span color= "gray">{functionParentPath}</span>.<span color = "orange">{functionName}</span></Card>
    </div>
  </div>

  )
}

