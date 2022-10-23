import React, { useState } from 'react'
import { AutoComplete } from 'primereact'


export default function FunctionForm({windowObject, client}){
    const [fns, setFns] = useState(['aaaabcd','aaaabcde', 'aaaac', 'aaaae'])
    const [filteredFns, setfilteredFns] = useState([])
    const [selectedFn, setSelectedFn] = useState([])

    const searchFns= (event)=>{
        setTimeout(()=>{
            let _filteredFns
            if (!event.query.trim().length) {
                _filteredFns = [...fns];

            }
            else {
                _filteredFns = fns.filter((fn) => {
                    return fn.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            setfilteredFns(_filteredFns)
        }, 250)
    }
    return(
        <div>    <AutoComplete value={selectedFn}
        fns={fns} 
        completeMethod={searchFns} dropdown="true" onChange={(e) => setSelectedFn(e.value)} />
        <span>{selectedFn}</span></div>


        )
        
}
