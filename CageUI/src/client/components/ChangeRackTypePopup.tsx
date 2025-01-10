import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { DefaultRackTypes, RackTypes, RackTypesStrings } from './typings';
import { labkeyActionSelectWithPromise } from './helpers';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';


interface ChangeRackTypePopupProps {
    onSubmit: (newType: {value: number, label: string}) => void;
}

export const ChangeRackTypePopup: FC<ChangeRackTypePopupProps> = (props) => {
    const {onSubmit} = props;

    const [options, setOptions] = useState<{value: number, label: string}[]>(null);

    const handleChange = (newVal) => {
        onSubmit(newVal);
    };


    useEffect(() => {
        if(options){
            setOptions(options)
        }else{
            const optConfig: SelectRowsOptions = {
                schemaName: "wnprc",
                queryName: "racks"
            }
            labkeyActionSelectWithPromise(optConfig).then(d => {
                if(d.rows.length > 0){
                    const tmp = [];

                    for (const row of d.rows) {
                        tmp.push({label: row.rack_type, value: row.rackid});
                    }
                    setOptions(tmp);
                }
            })
        }
    }, [options]);

    return (
        <div className="context-menu-row">
            <div className="context-menu-input">
                <Select
                    options={options}
                    className={"select-menu"}
                    classNamePrefix={"select"}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}