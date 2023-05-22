import { useEffect, useState } from "react";
import * as React from "react";
import Select from 'react-select';
import { labkeyActionSelectWithPromise } from '../query/helpers';

interface PropTypes {
    optConf: any;
    optDep?: any;
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
        optConf,
        optDep,
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

    const [optState, setOptState] = useState([]);

    useEffect(() => {
        labkeyActionSelectWithPromise(optConf).then(data => {
            let options = [];
            let value = optConf.columns[0];
            let display = optConf.columns[1] || optConf.columns[0];
            data["rows"].forEach(item => {
                options.push({value: item[value], label: item[display]});
            });

            // If dropdown is for projects, add defaults
            if(name === "project"){
                options.push({value:300901, label:"300901"});
                options.push({value:400901, label:"400901"});
            }

            // remove possible duplicates
            const duplicatesRemovedArray = options.reduce((accumulator, currentObject) => {
                const isDuplicate = accumulator.some(
                    (obj) => obj.value === currentObject.value && obj.label === currentObject.label
                );

                if (!isDuplicate) {
                    accumulator.push(currentObject);
                }
                return accumulator;
            }, []);
            setOptState(duplicatesRemovedArray);
        });
    }, optDep);

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
        value={optState.find(option => option.value === value)}
        className={classname}
        defaultValue={null}
        onChange={(event) => handleInputChange(event,setState)}
        options={optState}
        required={required}
        isClearable={isClearable}
        />
    );
};

export default DropdownSearch;
