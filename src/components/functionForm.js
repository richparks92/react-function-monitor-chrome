import React, { useState, useEffect } from 'react'
import { AutoComplete } from 'primereact'
import {Button} from 'primereact/button'
import './css/functionForm.css'
export default function FunctionForm({ client, fnArray }) {
    fnArray = fnArray || []
    //const [fns, setFns] = useState()
    const [filteredFns, setfilteredFns] = useState([])
    const [selectedFn, setSelectedFn] = useState()

    const searchFns = (event) => {
        setTimeout(() => {
            let _filteredFns = []
            if (fnArray.length > 0) {
                if (!event.query.trim().length) {
                    _filteredFns = [...fnArray];
                }
                else {
                    _filteredFns = fnArray.filter((fn) => {
                        return fn.startsWith(event.query)|| fn.startsWith(`window.${event.query}`);
                    });
                }
            }
            setfilteredFns(_filteredFns)
        }, 250)
    }
    return (
        <div>  
            <h6>Select Function</h6>  
            <div className = "functionForm">
            <AutoComplete size="50" value={selectedFn}
            suggestions={filteredFns}
            completeMethod={searchFns} onChange={(e) => setSelectedFn(e.value)} />

            <Button icon="pi pi-check" iconPos="right" onClick={(e)=>{
                if(selectedFn.length>0) client.setFnDetails(selectedFn)
                console.log('Function submission event.')
            }}/>
            </div>
            </div>


    )

}
