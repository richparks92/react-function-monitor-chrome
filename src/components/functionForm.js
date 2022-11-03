import React, { useState, useEffect } from 'react'
import { AutoComplete } from 'primereact'
import { Button } from 'primereact/button'
import './css/functionForm.css'

export default function FunctionForm({ client, fnArray }) {
    fnArray = fnArray || []
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [filteredFns, setfilteredFns] = useState([])
    const [selectedFn, setSelectedFn] = useState()

    const searchFns = (event) => {
        setTimeout(() => {
            let _filteredFns = []
            let query = event.query.trim()
            console.log(`Query: "${query}"`)


            //If fnArray is empty then exit function
            if (fnArray.length > 0) {
                if (query.length > 0) {
                    _filteredFns = fnArray.filter((fn) => {
                        return fn.startsWith(query) || fn.startsWith(`window.${query}`);
                    });
                }
                //If fnArray > 0 AND query is empty
                else {
                    _filteredFns = [...fnArray];
                    setButtonDisabled(true)
                }
            }
            //If query is empty or matches currently (populated) selectedFn, set button disabled.
            if (query.length == 0 || query == selectedFn || `window.${query}` == selectedFn) {
                setButtonDisabled(true)
            } else {
                setButtonDisabled(false)
            }

            setfilteredFns(_filteredFns)
        }, 250)
    }
    return (
        <div>
            <h4>Select Function</h4>
            <div className="functionForm">
                <AutoComplete size="50" value={selectedFn}
                    suggestions={filteredFns}
                    completeMethod={searchFns} onChange={(e) => setSelectedFn(e.value)} />

                <Button icon="pi pi-check" iconPos="right" onClick={(e) => {
                    if (selectedFn.length > 0) client.setFnDetails(selectedFn)
                    console.log('Function submission event.')
                }} disabled={buttonDisabled} />
            </div>
        </div>


    )

}
