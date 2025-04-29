import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';


interface ChangeRackProps {
    onSubmit: (newType: {value: string, label: string}) => void;
}

export const ChangeRack: FC<ChangeRackProps> = (props) => {
    const {onSubmit} = props;

    const [options, setOptions] = useState<{value: string, label: string}[]>(null);

    const handleChange = (newVal) => {
        onSubmit(newVal);
    };


    useEffect(() => {
        if(options){
            setOptions(options)
        }else{
            const optConfig: SelectRowsOptions = {
                schemaName: "cageui",
                queryName: "racks",
                columns: ['rackid', 'rack_type']
            }
            const rackTypesConfig: SelectRowsOptions = {
                schemaName: "cageui",
                queryName: "rack_types",
                columns: ['name', 'rowid']
            }
            const rackPromise = labkeyActionSelectWithPromise(optConfig);
            const rackTypesPromise = labkeyActionSelectWithPromise(rackTypesConfig);

            Promise.all([rackPromise, rackTypesPromise]).then(([rackResult, rackTypesResult]) => {

                if(rackResult.rows.length > 0){
                    const tmp = [];

                    for (const row of rackResult.rows) {
                        const rackTypeName = rackTypesResult.rows.find(r => r.rowid === parseInt(row.rack_type)).name;
                        tmp.push({label: `${row.rackid} - ${rackTypeName}`, value: `${row.rackid}`});
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