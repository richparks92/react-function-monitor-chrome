import React from 'react'
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css'
import { Divider } from 'primereact/divider';

export default function PrimeTest(){
    return(<div className="flex">
    <div>Content 1</div>
    <Divider layout="vertical" type = "solid"/>
    <div>Content 2</div>
    <Divider layout="vertical" type = "solid" />
    <div>Content 3</div>
    </div>)
}
