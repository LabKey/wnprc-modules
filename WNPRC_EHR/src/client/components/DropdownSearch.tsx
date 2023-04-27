import { useEffect, useState } from "react";
import * as React from "react";
import Select from 'react-select';

interface PropTypes {
    options: any;
    name: any;
    id: string;
    classname: string;
    initialvalue: string;
    onfocus?: any;
    required: boolean;
    isClearable?: boolean;
    value: any;
    setState: any;
}

/**
 * Renders dropdown select options. Expects a set of options w/ value & label properties,
 * as well as a @value function to handle the option that is selected and id and name.
 */
const DropdownSearch: React.FunctionComponent<PropTypes> = (props) => {
    const {
        options,
        value,
        name,
        id,
        classname,
        initialvalue,
        onfocus,
        required,
        isClearable,
        setState
    } = props;

    const handleInputChange = (selectedOption, setState) => {
        const value = selectedOption ? selectedOption.value : null;
        setState((prevState) => ({
            ...prevState,
            [name]: {value: value, error: ""}
        }));
    };

    return (
        <Select
        name={name}
        id={id}
        value={options.find(option => option.value === value)}
        className={classname}
        defaultValue={null}
        onChange={(event) => handleInputChange(event,setState)}
        options={options}
        required={required}
        isClearable={isClearable}
        />
    );
};

export default DropdownSearch;
