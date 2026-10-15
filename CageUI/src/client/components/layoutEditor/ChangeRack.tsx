/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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

import React, { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Button } from 'react-bootstrap';
import { CreateRackPopup } from './CreateRackPopup';
import { useLayoutEditorContext } from '../../context/LayoutEditorContextManager';
import { Rack, RackChangeOption, UnitType } from '../../types/typings';
import { isRackDefault } from '../../utils/LayoutEditorHelpers';
import { Filter, Query } from '@labkey/api';


interface ChangeRackProps {
    onSubmit: (newType: RackChangeOption) => void;
    currRack: Rack;
}

export const ChangeRack: FC<ChangeRackProps> = (props) => {
    const {onSubmit, currRack} = props;
    const {localRoom} = useLayoutEditorContext();

    const [options, setOptions] = useState<RackChangeOption[]>([]);
    const [showCreateRackPopup, setShowCreateRackPopup] = useState<boolean>(false);
    const [defaultOption, setDefaultOption] = useState<RackChangeOption>({
        value: {
            rackId: currRack.itemId,
            rackObjectId: currRack.objectId,
            rackType: currRack.type,
            isNew: currRack.isNew,
        },
        label: `${currRack.itemId} - ${currRack.type.displayName}`
    });

    const handleChange = (newVal: RackChangeOption) => {
        onSubmit(newVal);
    };

    useEffect(() => {
        if (options.length > 0) {
            setOptions(options);
        } else {
            const optConfig: Query.SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'racks',
                columns: ['rackid', 'rack_type', 'rowid', 'objectid', 'room'],
                filterArray: [Filter.create('room', null, Filter.Types.ISBLANK)]
            };
            const rackTypesConfig: Query.SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'rack_types',
                columns: ['displayName', 'rowid', 'type', 'manufacturer/title', 'manufacturer/value', 'size', 'stationary'],
            };
            const rackPromise = labkeyActionSelectWithPromise(optConfig);
            const rackTypesPromise = labkeyActionSelectWithPromise(rackTypesConfig);

            Promise.all([rackPromise, rackTypesPromise]).then(([rackResult, rackTypesResult]) => {
                const tmp: RackChangeOption[] = [];
                if (rackResult.rows.length > 0) {
                    for (const row of rackResult.rows) {
                        const rackType: UnitType = rackTypesResult.rows.find(r => r.rowid === parseInt(row.rack_type));
                        tmp.push({
                            label: `${row.rackid} - ${rackType.displayName}`,
                            value: {
                                rackId:row.rackid,
                                rackObjectId: row.objectid,
                                isNew: false,
                                rackType: {
                                    ...rackType,
                                    manufacturer: {
                                        value: rackType['manufacturer/value'],
                                        title: rackType['manufacturer/title'],
                                    },
                                    isDefault: isRackDefault(rackType.type)
                                }
                            }
                        });
                    }

                }

                const localRack = localRoom.rackGroups.flatMap(group => group.racks);

                if (localRack.length > 0) {
                    localRack.forEach((r) => {
                        if (!tmp.find((lbl) => lbl.label === `${r.itemId} - ${r.type.displayName}`)) {
                            tmp.push(
                                {
                                    label: `${r.itemId} - ${r.type.displayName}`,
                                    value: {
                                        rackId: r.itemId,
                                        rackObjectId: r.objectId,
                                        rackType: r.type,
                                        isNew: r.isNew,
                                    }
                                }
                            );
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
                        changeOption={handleChange}
                    />
            }
        </>

    );
};