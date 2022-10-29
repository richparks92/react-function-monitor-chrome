import React, { useState, useEffect } from 'react'
import { AutoComplete } from 'primereact'

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
                        return fn.startsWith(event.query);
                    });
                }
            }
            setfilteredFns(_filteredFns)
        }, 250)
    }
    return (
        <div>    <AutoComplete value={selectedFn}
            suggestions={filteredFns}
            completeMethod={searchFns} onChange={(e) => setSelectedFn(e.value)} />
            <div><span>{selectedFn}</span></div></div>


    )

}
