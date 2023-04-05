import React, { useState } from 'react'
import { AutoComplete } from 'primereact'
import { Button } from 'primereact/button'
import './css/functionForm.css'

export default function FunctionForm({ client, fnSuggestionArray, buttonActive, buttonPending }) {
    fnSuggestionArray = fnSuggestionArray || []

    const [filteredSuggestions, setfilteredSuggestions] = useState([])
    const [selectedFn, setSelectedFn] = useState()
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [inputDisabled, setInputDisabled] = useState(false)

    const buttonLabel = buttonActive ? 'Disable Listener' : 'Enable Listener'

    const buttonClickHandler = async () => {
        //Handle if client is not wrapped
        const _selectedFn = selectedFn.trim()
        const _fnPath = client.fnDetails && client.fnDetails.fnPath && client.fnDetails.fnPath.length > 0 ? client.fnDetails.fnPath : undefined

        if (!client.isFnWrapped) {
            if (_fnPath && (_selectedFn.length < 1 || _selectedFn == _fnPath)) {
                await client.wrapFunction()
                console.log('Wrapping existing function.')
                return
            }

            if (_selectedFn.length > 0) {
                await client.setFnDetails(_selectedFn)
                await client.wrapFunction()
                console.log('Wrapping selected function.')
            }
            if (!_fnPath && _selectedFn.length < 1) {
                console.log("No input function.")
            }
        } else {
            //If client is wrapped
            await client.unwrapFunction();
        }

        client.setters.updateStateFromClientDetails()
        setInputDisabled(client.isFnWrapped)
    }

    const searchFns = (event) => {
        setTimeout(() => {
            let _filteredSuggestions = []
            let query = event.query.trim()
            console.log(`Query: "${query}"`)
            const isFnWrapped = client.isFnWrapped
            //If fnSuggestionArray is empty then exit function
            if (fnSuggestionArray.length > 0) {
                if (query.length > 0) {
                    _filteredSuggestions = fnSuggestionArray.filter((fn) => {
                        return fn.startsWith(query) || fn.startsWith(`window.${query}`);
                    });
                }
                //If fnSuggestionArray > 0 AND query is empty
                else {
                    _filteredSuggestions = [...fnSuggestionArray];
                    if (!isFnWrapped) setButtonDisabled(true)
                }
            }
            //If query is empty or matches currently (populated) selectedFn, set button disabled.
            if (query.length == 0 || query == selectedFn || `window.${query}` == selectedFn) {
                if (!isFnWrapped) setButtonDisabled(true)
            } else {
                setButtonDisabled(false)
            }

            setfilteredSuggestions(_filteredSuggestions)
        }, 250)
    }
    return (
        <div>
            <h4>Select Function</h4>
            <div className="functionForm">
                <AutoComplete  value={selectedFn} minLength="0" size = "40"
                    suggestions={filteredSuggestions}
                    completeMethod={searchFns} onChange={(e) => setSelectedFn(e.value)}
                    disabled={inputDisabled}
                    onClick={() => {
                        //setInputDisabled(false)
                        console.log('Clicked input.')
                    }} />

                <Button icon="pi pi-check" loadingIcon="pi pi-spin pi-spinner" loading={buttonPending}
                    iconPos="right"
                    onClick={(e) => { (async () => await buttonClickHandler())() }}
                    disabled={buttonDisabled}
                    label={buttonLabel} />
            </div>
        </div>



    )

}
