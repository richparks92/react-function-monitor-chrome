import React, { useState } from 'react'
import { AutoComplete } from 'primereact'


export default function FunctionForm(props){
    const [filteredSuggestions, setfilteredSuggestions] = useState()
    const [selectedSuggestion, setSelectedSuggestion] = useState()
    const suggestions = ['aaaabcd','aaaabcde', 'aaaac', 'aaaae']

    const searchSuggestions= (event)=>{
        setTimeout(()=>{
            let _filteredSuggestions
            if (!event.query.trim().length) {
                _filteredSuggestions = [...suggestions];

            }
            else {
                _filteredSuggestions = suggestions.filter((suggestion) => {
                    return suggestion.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            setfilteredSuggestions(_filteredSuggestions)
        }, 250)
    }
    return(
        <div>    <AutoComplete value={selectedSuggestion}
        suggestions={suggestions} 
        completeMethod={searchSuggestions} dropdown="true" onChange={(e) => setSelectedSuggestion(e.value)} />
        <span>{selectedSuggestion}</span></div>


        )
        
}
