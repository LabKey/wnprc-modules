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
import { FC, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import { RackConditionOption, RackConditions } from '../../../types/typings';
import { useRoomContext } from '../../../context/RoomContextManager';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { ActionURL, Filter } from '@labkey/api';
import { RackSwitchOption } from '../../../types/homeTypes';
import { LayoutErrors } from '../../LayoutErrors';
import { LoadingScreen } from '../../LoadingScreen';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { generateUUID } from '../../../utils/helpers';

interface ChangeRackPopupProps {
    showChangeRackPopup: React.Dispatch<React.SetStateAction<boolean>>;

}

export const ChangeRackPopup: FC<ChangeRackPopupProps> = (props) => {
    const {showChangeRackPopup} = props;
    const {submitRackChange} = useRoomContext();
    const {selectedRack} = useHomeNavigationContext();
    const [rackOptions, setRackOptions] = useState<RackSwitchOption[]>([]);
    const [rackConditions, setRackConditions] = useState<RackConditionOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedOption, setSelectedOption] = useState<RackSwitchOption>({
        value: {
            objectId: selectedRack.objectId,
            rackId: selectedRack.itemId,
            typeRowId: selectedRack.type.rowid,
        },
        label: `${selectedRack.itemId} - ${selectedRack.type.displayName}`
    });
    const [selectedCondition, setSelectedCondition] = useState<RackConditionOption>({
        value: RackConditions.Operational,
        label: RackConditions[RackConditions.Operational]})
    const [showConfirmation, setShowConfirmation] = useState(false);
    const popupRef = useRef(null);
    const [showLayoutErrors, setShowLayoutErrors] = useState<string[]>([]);

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
                Filter.create('rack_type/stationary', false, Filter.Types.EQUAL),
                Filter.create('condition', RackConditions.Operational, Filter.Types.EQUAL),
                Filter.create('room', null, Filter.Types.ISBLANK),
            ]
        };
        labkeyActionSelectWithPromise(racksConfig).then((racksResult) => {
            if (racksResult.rowCount > 0) {
                let options = racksResult.rows.reduce((acc, row) => {
                    acc.push({
                        value: {
                            objectId: row.objectid,
                            rackId: row.rackid,
                            typeRowId: row['rack_type/rowid'],
                        },
                        label: `${row.rackid} - ${row['rack_type/displayName']}`
                    });
                    return acc;
                }, [] as RackSwitchOption[]);
                const ghostCageOption: RackSwitchOption = {
                    value: {
                        objectId: generateUUID(),
                        rackId: 0,
                        typeRowId: 0
                    },
                    label: "Ghost Rack"
                }
                options = [ghostCageOption, ...options];
                setRackOptions(options);
            }
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (popupRef.current && !popupRef.current.contains(event.target) && !isSaving) {
                showChangeRackPopup(false);
            }
        };

        // Add event listener to detect clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef]);

    const handleRackChange = (rackOption: RackSwitchOption) => {
        setSelectedOption(rackOption);
    }

    const handleConditionChange = (condition: RackConditionOption) => {
        setSelectedCondition(condition);
    }

    const handleSave = async () => {
        // First time it saves confirm, second time start save api call
        if(!showConfirmation){
            setShowConfirmation(true);
        }else{
            setShowConfirmation(false);
            setIsSaving(true);
            const res = await submitRackChange(selectedOption, selectedRack, selectedCondition);

            if (res.success) {
                // succssesful save
                setIsSaving(false);
                showChangeRackPopup(false);
                //navigateTo({selected: 'Room', room: selectedRoom.name});
                window.location.href = ActionURL.buildURL(
                ActionURL.getController(),
                'home',
                ActionURL.getContainer(),
                {room: res.roomName, rack: res.rack});
            } else {
                setIsSaving(false);
                if (res?.reason) {
                    setShowLayoutErrors(res.reason);
                } else {
                    setShowLayoutErrors(['Unknown error occurred. Please try again or submit a ticket.']);
                }
            }
        }
    }

    return (
        <div className="popup-overlay">
            {isSaving &&
                <LoadingScreen
                    isVisible={isSaving}
                    message={"Saving..."}
                    targetElement={document.getElementById('rack-view-container')}
                />
            }
            <div className="popup" ref={popupRef}>
                <div className={'popup-row'}>
                    {!showConfirmation && showLayoutErrors.length === 0 &&
                        <>
                            <div className="context-menu-input menu-item">
                                <label>Available Racks</label>
                                <Select
                                    options={rackOptions}
                                    defaultValue={selectedOption}
                                    className={'select-menu'}
                                    classNamePrefix={'select'}
                                    onChange={handleRackChange}
                                />
                            </div>
                            <div className="context-menu-input menu-item">
                                <label>Previous Rack Condition</label>
                                <Select
                                    options={rackConditions}
                                    defaultValue={selectedCondition}
                                    className={'select-menu'}
                                    classNamePrefix={'select'}
                                    onChange={handleConditionChange}
                                />
                            </div>
                        </>


                    }
                    {showConfirmation &&
                    <div className="context-menu-input menu-item">
                        Are you sure you want to change this rack to <span style={{fontWeight: 'bold'}}>{selectedOption.label}</span> ?
                    </div>}
                    {showLayoutErrors && showLayoutErrors.length > 0 &&
                        <LayoutErrors
                                errors={showLayoutErrors}
                        />
                    }
                </div>

                <div className={'popup-row menu-item-group'}>
                    {showLayoutErrors.length === 0 &&
                        <Button
                            variant={'secondary'}
                            onClick={() => {
                                handleSave();
                            }}
                        >
                            {!showConfirmation ? 'Save' : 'Yes'}
                        </Button>
                    }
                    <Button
                        variant={'secondary'}
                        onClick={() => showChangeRackPopup(false)}
                    >
                        {!showConfirmation ? 'Close' : 'No'}
                    </Button>
                </div>
            </div>
        </div>
    );
}