import { useEffect, useRef, useState } from 'react';
import * as React from "react";
import Select, { createFilter } from 'react-select';
import { getConfig, labkeyActionSelectWithPromise } from '../query/helpers';
import { useFormContext, Controller, FieldPathValue, FieldValues } from 'react-hook-form';
import AsyncSelect from 'react-select/async';

interface PropTypes {
    optConf: any; // Options query config
    optDep?: any; // Option dependencies/watch
    name: any;
    id: string;
    classname: string;
    initialValue?: string;
    required: boolean;
    isClearable?: boolean;
    validation?: any;
    defaultOpts?: any;
    controlled?: boolean;
    newDefaults?: any;
}

/**
 * Renders dropdown select options. Expects a set of options w/ value & label properties
 * Some issues with the initial load in validation due to react-hook-form and react-select compatibility
 */
const DropdownSearch: React.FunctionComponent<PropTypes> = (props) => {
    const {
        optConf,
        optDep,
        name,
        id,
        classname,
        initialValue,
        required,
        isClearable,
        validation,
        defaultOpts,
        controlled,
        newDefaults
    } = props;
    const {control, formState: {errors}} = useFormContext();
    const [optState, setOptState] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uncontrolledState, setUncontrolledState] = useState(initialValue);
    const nameParsed = name.split(".");
    let stateName;
    let fieldName;
    let rowNum;
    if(nameParsed.length === 2) {
        [stateName,fieldName] = nameParsed;
    }else{ // it is 3
        [stateName,rowNum,fieldName] = nameParsed;
    }
    const changeUncontrolled = (selectedOption) => {
        setUncontrolledState(selectedOption || null);
    }
    const promiseOptions = (inputValue: string) =>
        new Promise<any[]>((resolve) => {
            resolve(testFunc(inputValue));
        });
    const testFunc = async (inputValue: string): Promise<any> => {
        const tempTestConf = {
            schemaName: optConf.schemaName,
            queryName: optConf.queryName,
            displayColumn: optConf.columns[0],
            keyColumn: optConf.columns[1],
        }
        const tempWatchState = {
            name: optConf.columns[1],
            field: inputValue
        }
        const testConf = getConfig(tempTestConf, tempWatchState);
        console.log("OPTL: ", testConf);

        try {
            const data = await labkeyActionSelectWithPromise(testConf);
            console.log("data: ", data);
            const options = [];
            const value = optConf.columns[0];
            const display = optConf.columns[1];
            data["rows"].forEach(item => {
                options.push({value: item[value], label: item[display]});
            });

            if(defaultOpts) {
                defaultOpts.forEach((option) => {
                    options.push(option);
                });
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

            return duplicatesRemovedArray;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    useEffect(() => {
        labkeyActionSelectWithPromise(optConf).then(data => {
            const options = [];
            const value = optConf.columns[0];
            const display = optConf.columns[1];
            data["rows"].forEach(item => {
                options.push({value: item[value], label: item[display]});
            });

            if(defaultOpts) {
                defaultOpts.forEach((option) => {
                    options.push(option);
                });
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
            setIsLoading(false);
        });
    }, [optDep] || []);


    if(isLoading) {
        return (<div>Loading...</div>);
    }else if(controlled){
    return (
        <div className={'dropdown-controller'}>
            <Controller
                control={control}
                name={name}
                rules={{
                    validate: validation,
                    required: required ? "This field is required" : false
                } as FieldPathValue<FieldValues, any>}
                render={({field: { onChange, value, name, ref }}) => (
                    <Select
                        ref={ref}
                        inputId={id}
                        value={optState.find((c) => (
                            c.value.toString() === value?.toString()
                        ))}
                        className={classname}
                        classNamePrefix={'react-hook-select'}
                        getOptionLabel={x => x.label}
                        getOptionValue={x => x.value}
                        onChange={(selectedOption) => {
                            onChange(selectedOption?.value ? selectedOption.value : null);
                        }}
                        options={optState}
                        isClearable={isClearable}
                        filterOption={createFilter({ignoreAccents: false})}
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderColor: rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName] ? 'red' : null) : (errors?.[stateName]?.[fieldName] ? 'red' : null),
                                height: '20px'
                            }),
                            container: (base) => ({
                                ...base,
                                width: 'auto',
                            }),
                            menu: (base) => ({
                                ...base,
                                width: 'max-content',
                                zIndex: 2
                            }),
                        }}
                    />
                )}
                />
                <div className={"react-error-text"}>
                    {rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName]?.message) : (errors?.[stateName]?.[fieldName]?.message)}
                </div>
            </div>
        );
    }else{
        return (
            <div className={'dropdown-controller'}>
                <AsyncSelect
                    defaultOptions={newDefaults}
                    cacheOptions
                    loadOptions={promiseOptions}

                />
                <Select
                    defaultValue={initialValue}
                    inputId={id}
                    required={required}
                    name={name}
                    value={optState.find((c) => (
                        c.value.toString() === uncontrolledState?.toString()
                    ))}
                    className={classname}
                    classNamePrefix={'react-hook-select'}
                    getOptionLabel={x => x.label}
                    getOptionValue={x => x.value}
                    onChange={(selectedOption) => (changeUncontrolled(selectedOption))}
                    options={optState}
                    isClearable={isClearable}
                    filterOption={createFilter({ignoreAccents: false})}
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderColor: rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName] ? 'red' : null) : (errors?.[stateName]?.[fieldName] ? 'red' : null),
                            height: '20px'
                        }),
                        container: (base) => ({
                            ...base,
                            width: 'auto',
                        }),
                        menu: (base) => ({
                            ...base,
                            width: 'max-content',
                            zIndex: 2
                        }),
                    }}
                />
                <div className={'react-error-text'}>
                    {rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName]?.message) : (errors?.[stateName]?.[fieldName]?.message)}
                </div>
            </div>
        );
    }
};

export default DropdownSearch;
