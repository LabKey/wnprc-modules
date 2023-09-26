import { useEffect, useState } from "react";
import * as React from "react";
import Select from 'react-select';
import { labkeyActionSelectWithPromise } from '../query/helpers';
import { useFormContext, Controller, FieldPathValue, FieldValues } from 'react-hook-form';

interface PropTypes {
    optConf: any; // Options query config
    optDep?: any; // Option dependencies/watch
    name: any;
    id: string;
    classname: string;
    initialValue?: any;
    required: boolean;
    isClearable?: boolean;
    validation?: any;
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
        validation
    } = props;
    const {control, formState: {errors}} = useFormContext();
    const [optState, setOptState] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stateName, fieldName] = name.split('.');
    const [defaultValue, setDefaultValue] = useState(null);

    useEffect(() => {
        labkeyActionSelectWithPromise(optConf).then(data => {
            const options = [];
            const value = optConf.columns[0];
            const display = optConf.columns[1] || optConf.columns[0];
            data["rows"].forEach(item => {
                options.push({value: item[value], label: item[display]});
                if(item[value] === initialValue){
                    setDefaultValue({value: item[value], label: item[display]});
                }
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
            setIsLoading(false);
        });
    }, optDep || []);


    if(isLoading) {
        return (<div>Loading...</div>);
    }
    return (
        <div className={'dropdown-controller'}>
            <Controller
                control={control}
                name={name}
                defaultValue={defaultValue as FieldPathValue<FieldValues, any>}
                rules={{
                    validate: validation,
                    required: required ? "This field is required" : false
                } as FieldPathValue<FieldValues, any>}
                render={({field: { onChange, value, name, ref }}) => (
                    <Select
                        ref={ref}
                        id={id}
                        value={value}
                        className={classname}
                        getOptionLabel={x => x.label}
                        getOptionValue={x => x.value}
                        onChange={onChange}
                        options={optState}
                        isClearable={isClearable}
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderColor: errors?.[stateName]?.[fieldName] ? 'red' : null,
                            }),
                            container: (base) => ({
                                ...base,
                                width: 'max-content',
                            }),
                            menu: (base) => ({
                                ...base,
                                width: 'max-content',
                            })
                        }}
                    />
                )}
            />
            <div className={"react-error-text"}>
                {errors?.[stateName]?.[fieldName]?.message}
            </div>
        </div>
    );
};

export default DropdownSearch;
