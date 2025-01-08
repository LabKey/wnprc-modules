import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { DefaultRackTypes, RackTypes, RackTypesStrings } from './typings';
import { labkeyActionSelectWithPromise } from './helpers';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';


interface ChangeRackTypePopupProps {
    onSubmit: (newType: {value: number, label: string}) => void;
    onClose: () => void;
    popupRef: React.MutableRefObject<any>;
}

export const ChangeRackTypePopup: FC<ChangeRackTypePopupProps> = (props) => {
    const {onSubmit, onClose, popupRef} = props;

    const [options, setOptions] = useState<{value: number, label: string}[]>(null);

    const handleChange = (newVal) => {
        console.log("newVal: ", newVal);
        onSubmit(newVal);
        onClose(); // Close the popup after submitting
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
                    console.log("DDD: ", d.rows);
                    const tmp = [];

                    for (const row of d.rows) {
                        console.log("Row", row);
                        tmp.push({label: row.rack_type, value: row.rackid});
                    }
                    console.log("Tmp", tmp);
                    setOptions(tmp);
                }
            })
        }
    }, [options]);

    return (
        <div className="popup-overlay" >
            <div className="popup-content" ref={popupRef}>
                <Select
                    options={options}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}