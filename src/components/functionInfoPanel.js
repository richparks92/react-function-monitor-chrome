import React, { Fragment } from 'react'
import './css/functionInfoPanel.css'
import { Card } from 'primereact/card'
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

export default function FunctionInfoPanel({ functionName, functionParentPath }) {
  functionName = functionName || ''
  functionParentPath = functionParentPath || ''
  return (
    <div id="functionInfoContainer">
      <div id="functionNamePanel" className="functionInfoPanel">
        <Card title={functionName.length>0 ? "Selected Function":""} width="500px">
          {functionName && functionName.length > 0 && 
            <Fragment>
              <span style={{ color: "gray" }}>{functionParentPath}</span>
              <span style={{ color: "orange", fontSize: "20px", fontWeight: "bold" }}> .{functionName}</span>
            </Fragment>
          }

          {!functionName && !functionName.length > 0 &&
            <Fragment>
              <span style={{ color: "gray" }}><em>No function currently selected.</em></span>
            </Fragment>}
        </Card>

      </div>
    </div>

  )
}

