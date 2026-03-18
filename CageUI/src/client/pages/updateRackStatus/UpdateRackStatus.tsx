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

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import {
    labkeyActionSelectWithPromise,
    labkeyGetUserPermissions,
    updateRackConditionStatus
} from '../../api/labkeyActions';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { RackConditionOption, RackConditions } from '../../types/typings';
import { Filter } from '@labkey/api';
import { RackSwitchOption } from '../../types/homeTypes';
import Select from 'react-select';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';


export const UpdateRackStatus: FC = () => {
    const [user, setUser] = useState<GetUserPermissionsResponse>(null);

    const [rackOptions, setRackOptions] = useState<RackSwitchOption[]>([]);
    const [rackConditions, setRackConditions] = useState<RackConditionOption[]>([]);
    const [selectedCondition, setSelectedCondition] = useState<RackConditionOption>(null)
    const [selectedOption, setSelectedOption] = useState<RackSwitchOption>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState<"success" | "error">(); // 'success' or 'error'

    useEffect(() => {
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: GetUserPermissionsResponse) => {
            if (profile.user) {
                setUser(profile);
            }
        }).catch((e) => {
            console.error(e);
        });
    }, []);

    useEffect(() => {
        const config: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'cageui_condition_codes',
            columns: ['value', 'title']
        }
         labkeyActionSelectWithPromise(config).then((res) => {
             if(res.rowCount > 0){
                 const opts: RackConditionOption[] = [];
                 res.rows.forEach(row => {
                     opts.push({
                         value: row.value,
                         label: row.title,
                     })
                 })
                 setRackConditions(opts);
             }
         })
    }, []);

    useEffect(() => {
        const racksConfig: SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'racks',
            columns: ['room','objectid', 'rack_type/displayName', 'rackid', 'rack_type/stationary', 'rack_type/rowid', 'condition'],
            filterArray: [
                Filter.create('room', null, Filter.Types.ISBLANK),
            ]
        };
        labkeyActionSelectWithPromise(racksConfig).then((racksResult) => {
            if (racksResult.rowCount > 0) {
                const options = racksResult.rows.reduce((acc, row) => {
                    acc.push({
                        value: {
                            objectId: row.objectid,
                            rackId: row.rackid,
                            typeRowId: row['rack_type/rowid'],
                        },
                        label: `${row.rackid} - ${row['rack_type/displayName']} - ${RackConditions[row.condition]}`
                    });
                    return acc;
                }, [] as RackSwitchOption[]);
                setRackOptions(options);
            }
        });
    }, []);

    const handleRackChange = (rackOption: RackSwitchOption) => {
        setSelectedOption(rackOption);
    }

    const handleConditionChange = (condition: RackConditionOption) => {
        setSelectedCondition(condition);
    }

    const handleSaveClick = () => {
        if(!selectedCondition || !selectedOption) return;
        setShowSaveConfirm(true);
    }

    const submitRackConditionChange = async () => {
        try {
            const res = await updateRackConditionStatus(selectedOption, selectedCondition);
            if (res.errors && res.errors.length > 0) {
                setMessage(res.errors);
                setMessageType('error');
            } else {
                setMessage('Rack condition updated successfully!');
                setMessageType('success');
            }
        } catch (error) {
            setMessage(['An error occurred while updating the rack condition']);
            setMessageType('error');
        }
    }

    return (
        <div className="update-rack-container">
            <div className="form-group">
                <label>Available Racks</label>
                <Select
                    options={rackOptions}
                    defaultValue={selectedOption}
                    className="select-menu"
                    classNamePrefix="select"
                    onChange={handleRackChange}
                />
            </div>

            <div className="form-group">
                <label>Rack Condition</label>
                <Select
                    options={rackConditions}
                    defaultValue={selectedCondition}
                    className="select-menu"
                    classNamePrefix="select"
                    onChange={handleConditionChange}
                />
            </div>

            {showSaveConfirm &&
                <ConfirmationPopup
                    message={`Are you sure you want to change <strong>${selectedOption?.label}</strong> to <strong>${selectedCondition?.label}</strong>`}
                    onConfirm={() => {
                        submitRackConditionChange();
                    }}
                    onCancel={() => setShowSaveConfirm(false)}
                    onClose={() => setShowSaveConfirm(false)}
                />
            }
            <button className="update-button" onClick={handleSaveClick}>Update Rack Condition</button>

            {message && (
                <div className={`update-rack-message ${messageType}`}>
                    {Array.isArray(message) ? (
                        <ul>
                            {message.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    ) : (
                        <span>{message}</span>
                    )}
                </div>
            )}
        </div>

    );
};