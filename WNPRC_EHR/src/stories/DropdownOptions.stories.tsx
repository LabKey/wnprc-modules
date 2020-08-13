import * as React from 'react';
import DropdownOptions from "../components/DropdownOptions";
import {useState} from "react";

export default {
    title: 'DropdownOptions',
    component: DropdownOptions,
};

export const ToStorybook = () => {
    const restraints = [{key: "option1"}, {key: "option2"}];

    const [restraint, setRestraint] = useState("initialvalue");

    return (
    <DropdownOptions
        options={restraints}
        initialvalue={restraint}
        value={setRestraint}
        name="dropdown"
        id="dropdown-id"
        classname="form-control"
        valuekey="key"
        displaykey="key"
        required={true}
    />
    )
};
