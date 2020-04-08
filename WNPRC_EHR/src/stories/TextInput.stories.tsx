import * as React from 'react';
import  TextInput from '../components/TextInput';
import {useState} from "react";

export default {
    title: 'TextInput',
    component: TextInput,
};

export const ToStorybook = () => {
    const [value, setValue] = useState("test");

    const updateValue = (e) => {
        setValue(e.target.value)
    };

    return (
        <TextInput
            name="test-input-name"
            id="test-input-id"
            className="test-input-class"
            value={value}
            onBlur={() => {console.log("Blurred!")}}
            onFocus={()=> {console.log("Focused!")}}
            onChange={updateValue}
            required={true}
            autoFocus={true}
        />
    )
};

