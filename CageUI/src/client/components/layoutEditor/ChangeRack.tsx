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
import { useLayoutEditorContext } from '../../context/LayoutEditorContextManager';
import { SelectedObj } from '../../types/layoutEditorTypes';
import { Cage, Rack, UnitType } from '../../types/typings';


interface ChangeRackProps {
    onSubmit: (newType: { value: string, label: string }, isNew: boolean) => void;
    currRack: Rack;
}

export const ChangeRack: FC<ChangeRackProps> = (props) => {
    const {onSubmit, currRack} = props;
    const {localRoom} = useLayoutEditorContext();

    const [options, setOptions] = useState<{ value: string, label: string }[]>([]);
    const [showCreateRackPopup, setShowCreateRackPopup] = useState<boolean>(false);
    const [defaultOption, setDefaultOption] = useState<{ value: string, label: string }>({value: currRack.objectId, label: `${currRack.itemId} - ${currRack.type.name}`});

    const handleChange = (newVal: { value: string, label: string }) => {
        onSubmit(newVal, newVal.value === 'new');
    };

    useEffect(() => {
        if(defaultOption.value === "new"){
            handleChange(defaultOption);
        }
    }, [defaultOption]);

    useEffect(() => {
        if (options.length > 0) {
            setOptions(options);
        } else {
            const optConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'racks',
                columns: ['rackid', 'rack_type', 'rowid', 'objectid']
            };
            const rackTypesConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'rack_types',
                columns: ['name', 'rowid']
            };
            const rackPromise = labkeyActionSelectWithPromise(optConfig);
            const rackTypesPromise = labkeyActionSelectWithPromise(rackTypesConfig);

            Promise.all([rackPromise, rackTypesPromise]).then(([rackResult, rackTypesResult]) => {
                const tmp = [];
                if (rackResult.rows.length > 0) {

                    for (const row of rackResult.rows) {
                        const rackTypeName = rackTypesResult.rows.find(r => r.rowid === parseInt(row.rack_type)).name;
                        tmp.push({label: `${row.rackid} - ${rackTypeName}`, value: row.objectid});
                    }

                }

                const localRack = localRoom.rackGroups.flatMap(group => group.racks);

                if (localRack.length > 0) {
                    localRack.forEach((r) => {
                        if (!tmp.find((lbl) => lbl.label === `${r.itemId} - ${r.type.name}`)) {
                            tmp.push({label: `${r.itemId} - ${r.type.name}`, value: r.objectId});
                        }
                    });
                }
                setOptions(tmp);
            });
        }


    }, [options]);

    return (
        <>
            <div className="context-menu-row">
                <div className="context-menu-input menu-item">
                    <Select
                        options={options}
                        value={defaultOption}
                        className={'select-menu'}
                        classNamePrefix={'select'}
                        onChange={handleChange}
                    />
                </div>
                <Button
                    variant="secondary"
                    className={'menu-item'}
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
                        setDefaultOption={setDefaultOption}
                    />
            }
        </>

    );
};