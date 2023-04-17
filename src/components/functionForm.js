import React, { useRef, useState } from 'react'
import { AutoComplete } from 'primereact'
import { Button } from 'primereact/button'
import { OverlayPanel } from 'primereact'
//import { wait } from '@testing-library/user-event/dist/utils'
import { wait } from '../scripts/util/helpers'
import './css/functionForm.css'

export default function FunctionForm({ client, fnSuggestionArray, buttonActive, buttonPending }) {
    fnSuggestionArray = fnSuggestionArray || []

    const [filteredSuggestions, setfilteredSuggestions] = useState([])
    const [selectedFn, setSelectedFn] = useState()
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [inputDisabled, setInputDisabled] = useState(false)

    const overlayRef = useRef(null)
    const buttonLabel = buttonActive ? 'Disable Listener' : 'Enable Listener'


    function showOverlay(e) {
        overlayRef.current.show(e)
        setTimeout(overlayRef.current.hide, 2500)
    }

    async function shouldWrapFn(_selectedFn) {
        const _fnPath = client?.fnDetails?.fnPath && client.fnDetails.fnPath.length > 0 ? client.fnDetails.fnPath : undefined
        if (_fnPath) await client.clearFnDetails()

        if (_selectedFn.length < 1) {
            console.log("No input function.")
            return false

        } else {
            const fnExists = await client.doesFunctionExist(_selectedFn);
            
            return fnExists
        }
    }

    const buttonClickHandler = async (e) => {

        console.log('Button clicked.')
        const _selectedFn = selectedFn

        //Handle if client is not wrapped
        if (!client.isFnWrapped) {

            if (await shouldWrapFn(_selectedFn)) {
                await client.setFnDetails(_selectedFn)
                console.log('Wrapping selected function.')
                await client.wrapFunction()
            } else {
                showOverlay(e)
                return
            }

        } else {
            //If client is wrapped
            console.log('Client is already wrapped; triggering unwrapping function.')
            await client.unwrapFunction();
        }

        client.setters.updateStateFromClientDetails()
        setInputDisabled(client.isFnWrapped)
    }

    const searchFns = (event) => {
        setTimeout(() => {
            let _filteredSuggestions = []
            let query = event.query.trim()
            //console.log(`Query: "${query}"`)
            const isFnWrapped = client.isFnWrapped
            //If fnSuggestionArray is empty then exit function
            if (fnSuggestionArray.length > 0) {
                if (query.length > 0) {
                    _filteredSuggestions = fnSuggestionArray.filter((fn) => {
                        return fn.toLowerCase().startsWith(query.toLowerCase()) || fn.toLowerCase().startsWith(`window.${query}`.toLowerCase());
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
                <div>
                    <AutoComplete value={selectedFn} minLength="0" size="40"
                        suggestions={filteredSuggestions}
                        completeMethod={searchFns} onChange={(e) => setSelectedFn(e.value)||''.trim()}
                        disabled={inputDisabled}
                        onClick={() => {
                            //setInputDisabled(false)
                            console.log('Clicked input.')
                        }} />
                </div>
                <div>
                    <Button icon="pi pi-check" loadingIcon="pi pi-spin pi-spinner" loading={buttonPending}
                        iconPos="right"
                        onClick={(e) => { (async () => await buttonClickHandler(e))() }}
                        disabled={buttonDisabled}
                        label={buttonLabel} />
                    <OverlayPanel ref={overlayRef}>
                        <p>That ain't no function pleighboi.</p>
                    </OverlayPanel>

                </div>

            </div>
        </div>



    )

}
