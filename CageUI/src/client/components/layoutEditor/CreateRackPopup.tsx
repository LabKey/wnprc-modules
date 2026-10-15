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
import { Query } from '@labkey/api';
import { Button } from 'react-bootstrap';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import Select from 'react-select';
import { isRackDefault } from '../../utils/LayoutEditorHelpers';
import { RackChangeOption, UnitType } from '../../types/typings';
import { generateUUID } from '../../utils/helpers';

interface CreateRackPopupProps {
    showCreateRackPopup: React.Dispatch<React.SetStateAction<boolean>>;
    currentRackOptions: RackChangeOption[];
    setRackOptions: React.Dispatch<React.SetStateAction<RackChangeOption[]>>;
    changeOption: (newVal: RackChangeOption) => void;
}

export const CreateRackPopup: FC<CreateRackPopupProps> = (props) => {
    const {showCreateRackPopup, setRackOptions, currentRackOptions, changeOption} = props;

    const [centerRacks, setCenterRacks] = useState<Map<string, number[]>>(new Map());

    const [rackTypeOptions, setRackTypeOptions] = useState<{ value: UnitType, label: string }[]>(null);
    const [selectedRackType, setSelectedRackType] = useState<{ value: UnitType, label: string }>(null);
    const [nextRackId, setNextRackId] = useState<number | null>(null);
    const [rackIdValue, setRackIdValue] = useState<string>('');

    useEffect(() => {
        const rackTypesConfig: Query.SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'rack_types',
            columns: ['displayName', 'rowid', 'type', 'manufacturer/title', 'manufacturer/value', 'size', 'stationary'],
        };
        labkeyActionSelectWithPromise(rackTypesConfig).then((rackTypesResult) => {
            if (rackTypesResult.rowCount > 0) {
                const options = rackTypesResult.rows.reduce((acc, row) => {
                    if (!isRackDefault(row.type)) {
                        acc.push({
                            value: {
                                ...row,
                                manufacturer: {
                                    value: row['manufacturer/value'],
                                    title: row['manufacturer/title'],
                                },
                                isDefault: false,
                            },
                            label: row.displayName
                        });
                    }
                    return acc;
                }, [] as { value: number, label: string }[]);
                setRackTypeOptions(options);
            }

            if (currentRackOptions.length > 0) {
                // Process all racks
                const rackUpdates: [string, number][] = [];

                for (const rack of currentRackOptions) {
                    const rackTypeName = rack.label.split(' - ')[1];
                    const rackId = parseInt(rack.label.split(' - ')[0]);
                    if (rackTypeName) {
                        rackUpdates.push([rackTypeName, rackId]);
                    }
                }

                // Apply all updates at once
                rackUpdates.forEach(([typeName, rackId]) => {
                    if (isRackIdAvailable(typeName, rackId)) {
                        addRack(typeName, rackId);
                    }
                });
            }
        });
    }, []);


    const isRackIdAvailable = (rackTypeName: string, rackId: number): boolean => {
        const rackIds = centerRacks.get(rackTypeName) || [];
        return !rackIds.includes(rackId);
    };


    const addRack = (rackTypeName: string, rackId: number) => {
        setCenterRacks(prev => {
            const updatedRacks = new Map(prev);

            if (!updatedRacks.has(rackTypeName)) {
                updatedRacks.set(rackTypeName, []);
            }

            const rackIds = updatedRacks.get(rackTypeName)!;
            if (!rackIds.includes(rackId)) {
                rackIds.push(rackId);
                updatedRacks.set(rackTypeName, rackIds);
            }
            return updatedRacks;
        });
    };

    const generateNextRackId = (rackTypeName: string) => {
        const rackIds = centerRacks.get(rackTypeName) || [];
        if (rackIds.length === 0) {
            return 1;
        }

        // Find the maximum ID and add 1
        const maxId = Math.max(...rackIds);
        return maxId + 1;
    };

    const handleRackTypeChange = (selectedType: { value: UnitType, label: string }) => {
        setSelectedRackType(selectedType);

        // Generate next available ID when rack type is selected
        if (selectedType) {
            const nextId = generateNextRackId(selectedType.label);
            setNextRackId(nextId);
        } else {
            setNextRackId(null);
        }
    };

    const fillNextRackId = () => {
        if (selectedRackType && nextRackId) {
            setRackIdValue(nextRackId.toString());
        }
    };

    const handleSave = () => {
        setRackOptions(prev => {
            const newOptions = [...prev];
            if (selectedRackType && rackIdValue) {
                const newOption: RackChangeOption = {
                    value: {
                        isNew: true,
                        rackId: parseInt(rackIdValue),
                        rackObjectId: generateUUID(),
                        rackType: selectedRackType.value
                    },
                    label: `${rackIdValue} - ${selectedRackType.label}`
                };
                newOptions.push(newOption);

                changeOption(newOption);
            }
            return newOptions;
        });
        showCreateRackPopup(false);
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className={'popup-row'}>
                    <div className="context-menu-input menu-item">
                        <label>Rack Type</label>
                        <Select
                            options={rackTypeOptions}
                            className={'select-menu'}
                            classNamePrefix={'select'}
                            onChange={handleRackTypeChange}
                        />
                    </div>
                </div>

                <div className={'popup-row'}>
                    <div className="context-menu-input menu-item">
                        <label>Rack Id</label>
                        <input
                            type="number"
                            className={'no-scroll'}
                            placeholder={'Rack Id'}
                            value={rackIdValue} // You'll need to manage this state
                            onChange={(e) => setRackIdValue(e.target.value)}
                        />
                        {selectedRackType && nextRackId && (
                            <Button
                                variant={'secondary'}
                                onClick={fillNextRackId}
                            >
                                Auto Fill
                            </Button>
                        )}
                    </div>
                </div>

                <div className={'popup-row menu-item-group'}>
                    <Button
                        variant={'secondary'}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                    <Button
                        variant={'secondary'}
                        onClick={() => showCreateRackPopup(false)}
                    >
                        Close
                    </Button>
                </div>

            </div>
        </div>
    );
}