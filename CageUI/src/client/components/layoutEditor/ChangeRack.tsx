/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Button } from 'react-bootstrap';
import { CreateRackPopup } from './CreateRackPopup';


interface ChangeRackProps {
    onSubmit: (newType: {value: string, label: string}) => void;
}

export const ChangeRack: FC<ChangeRackProps> = (props) => {
    const {onSubmit} = props;

    const [options, setOptions] = useState<{value: number, label: string}[]>([]);
    const [showCreateRackPopup, setShowCreateRackPopup] = useState<boolean>(false);

    const handleChange = (newVal) => {
        console.log("newVal", newVal);
        onSubmit(newVal);
    };


    useEffect(() => {
        if(options){
            setOptions(options)
        }else{
            const optConfig: SelectRowsOptions = {
                schemaName: "cageui",
                queryName: "racks",
                columns: ['rackid', 'rack_type', 'rowid']
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
                        tmp.push({label: `${row.rackid} - ${rackTypeName}`, value: row.rowid});
                    }
                    setOptions(tmp);
                }
            })
        }
    }, [options]);

    return (
        <>
            <div className="context-menu-row">
                <div className="context-menu-input menu-item">
                    <Select
                        options={options}
                        className={"select-menu"}
                        classNamePrefix={"select"}
                        onChange={handleChange}
                    />
                </div>
                <Button
                    variant="secondary"
                    className={"menu-item"}
                    onClick={() => setShowCreateRackPopup(true)}
                >
                    Create Rack
                </Button>
            </div>
            {showCreateRackPopup &&
                <CreateRackPopup
                        showCreateRackPopup={setShowCreateRackPopup}
                        currentRackOptions={options}
                        setRackOptions={setOptions}
                />
            }
        </>

    );
}