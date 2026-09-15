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
import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { ConditionCode, HousingTransferData } from '../../types/housingFormTypes';
import dayjs from 'dayjs';
import { Autocomplete, Box, TextField } from '@mui/material';
import { labkeyActionSelectWithPromise, startHousingTransfer } from '../../api/labkeyActions';
import { Option } from '@labkey/components';
import { ActionURL, Filter, Query, Security } from '@labkey/api';
import { HousingDataGrid } from './HousingDataGrid';
import { LoadingScreen } from '../LoadingScreen';
import { fetchConditionCodes } from '../../api/popularQueries';
import { canEditConditionPermission } from '../../utils/homeHelpers';
import { LayoutErrors } from '../LayoutErrors';

interface HousingFormProps {
    user: Security.GetUserPermissionsResponse;
    layoutChangeId?: string;
    prevForm?: Record<string, HousingTransferData[]>;
    currRoom?: string;
    selectedAnimals?: string[];
}

export const HousingForm: FC<HousingFormProps> = (props) => {
    const { selectedAnimals, currRoom, user, prevForm, layoutChangeId } = props;
    const [animalsByRoom, setAnimalsByRoom] = useState<Record<string, HousingTransferData[]>>({[currRoom || 'Unassigned']: [] });
    const [centerAnimals, setCenterAnimals] = useState<string[]>([]);
    const [animalLocations, setAnimalLocations] = useState<Record<string, { room: Option<string>, cage: Option<string> }>>({});
    const [animalsByCurRoom, setAnimalsByCurRoom] = useState<Record<string, string[]>>({});
    const [topAnimalId, setTopAnimalId] = useState<string | null>(null);
    const [conditionCodes, setConditionCodes] = useState<ConditionCode[]>([]);
    const [roomOptions, setRoomOptions] = useState<Option<string>[]>(null);
    const [reasonOptions, setReasonOptions] = useState<Option<string>[]>(null);
    const [autoConditions, setAutoConditions] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        console.log("Data: ", animalsByRoom);
    }, [animalsByRoom]);

    useEffect(() => {
        if(prevForm){
            setAnimalsByRoom(prevForm);
        }
    }, [prevForm]);

    useEffect(() => {
        fetchConditionCodes().then(setConditionCodes);
    }, []);

    useEffect(() => {
        if (selectedAnimals && selectedAnimals.length > 0) {
            const config: Query.SelectRowsOptions = {
                schemaName: 'study',
                queryName: 'demographicsCurLocationNew',
                columns: ['id', 'room', 'room/rowid', 'cage'],
                filterArray: [Filter.create('id', selectedAnimals, Filter.Types.IN)]
            };

            labkeyActionSelectWithPromise(config).then(result => {
                const currentLocations: Record<string, {room: Option<number>, cage: Option<string>}> = {};
                result.rows.forEach(row => {
                    currentLocations[row.id] = {
                        room: { label: row.room, value: row['room/rowid'] },
                        cage: { label: row.cage?.cage_number?.toString() || '', value: row.cage?.toString() || '' }
                    };
                });

                const initialAnimals = selectedAnimals.map(id => ({
                    id,
                    inDate: dayjs(),
                    outDate: null,
                    destinationRoom: {value: '', label: ''},
                    destinationCage: {value: '', label: ''},
                    condition: [],
                    reasonForMove: [],
                    project: null,
                    remarks: '',
                    performedBy: '',
                    alert: false,
                    currentRoom: currentLocations[id]?.room || { value: '', label: '' },
                    currentCage: currentLocations[id]?.cage || { value: '', label: '' }
                } as HousingTransferData));
                setAnimalsByRoom({ [currRoom || 'Unassigned']: initialAnimals });
            }).catch(err => {
                console.error('Error fetching current locations:', err);
                const initialAnimals = selectedAnimals.map(id => ({
                    id,
                    inDate: dayjs(),
                    outDate: null,
                    destinationRoom: {value: null, label: ''},
                    destinationCage: {value: '', label: ''},
                    condition: [],
                    reasonForMove: [],
                    project: null,
                    remarks: '',
                    performedBy: '',
                    alert: false,
                    currentRoom: { value: null, label: '' },
                    currentCage: { value: '', label: '' }
                } as HousingTransferData));
                setAnimalsByRoom({ [currRoom || 'Unassigned']: initialAnimals });
            });
        }
    }, [selectedAnimals, currRoom]);

    useEffect(() => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
            filterArray: [Filter.create('room', 'template', Filter.Types.DOES_NOT_CONTAIN)]
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: Option<string>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.room, value: row.room});
                });
                // Add no change to the options
                rowOptions.splice(0,0,{label: "No Change", value: 'No Change'});
                rowOptions.splice(0,0,{label: "Special Housing", value: 'Special Housing'});
                setRoomOptions(rowOptions);
            }
        }).catch(err => {
            console.error('Error fetching prev room', err);
        });
    }, []);

    useEffect(() => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'study',
            queryName: 'demographicsCurLocationNew',
            columns: ['id', 'room', 'room/rowid', 'cage', 'cage/cage_number'],
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rows && result.rows.length > 0) {
                const locations: Record<string, { room: Option<string>, cage: Option<string> }> = {};
                const animalsList: string[] = [];
                const curRoomMap: Record<string, string[]> = {};

                result.rows.forEach(row => {
                    const animalId = row.id || row.Id;
                    if (!animalId) return;
                    animalsList.push(animalId);
                    const roomLabel = row.room || 'Unassigned';
                    const roomRowId = row['room/rowid'] || -1;
                    const cageLabel = row['cage/cage_number'] || null;
                    const cageValue = row.cage || null;

                    locations[animalId] = {
                        room: { label: roomLabel, value: roomRowId },
                        cage: { label: cageLabel, value: cageValue }
                    };

                    if (!curRoomMap[roomLabel]) {
                        curRoomMap[roomLabel] = [];
                    }
                    curRoomMap[roomLabel].push(animalId);
                });

                setAnimalLocations(locations);
                setCenterAnimals(animalsList);
                setAnimalsByCurRoom(curRoomMap);
            }
        }).catch(err => {
            console.error('Error fetching alive at center animals with locations', err);
        });
    }, []);

    useEffect(() => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'housing_reason',
            columns: ['value', 'title'],
            filterArray: [Filter.create('date_disabled', null, Filter.Types.ISBLANK)]
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: Option<string>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value});
                });
                setReasonOptions(rowOptions);
            }
        }).catch(err => {
            console.error('Error fetching housing reasons', err);
        });
    }, []);

    const handleAnimalsChange = useCallback((roomLabel: string, updatedAnimals: HousingTransferData[]) => {
        setAnimalsByRoom(prev => {
            const next = { ...prev };
            const oldAnimals = prev[roomLabel] || [];
            
            // Find if any animal's destination changed
            updatedAnimals.forEach(animal => {
                const oldAnimal = oldAnimals.find(a => a.id === animal.id);
                if (oldAnimal) {
                    const destChanged = oldAnimal.destinationRoom?.value !== animal.destinationRoom?.value || 
                                      oldAnimal.destinationCage?.value !== animal.destinationCage?.value;
                    
                    if (destChanged) {
                        // Destination changed, check if we need to remove triggered animals from old destination
                        const oldRoom = oldAnimal.destinationRoom?.label;
                        if (oldRoom && next[oldRoom]) {
                            // Only remove if no OTHER animal is now pointing to this same old room/cage
                            const otherPointing = Object.values(next).flat().some(a => 
                                a.id !== animal.id && 
                                a.destinationRoom?.label === oldRoom && 
                                a.destinationCage?.value === oldAnimal.destinationCage?.value
                            );

                            if (!otherPointing) {
                                next[oldRoom] = next[oldRoom].filter(a => a.triggeredBy !== animal.id);
                                // If the room is now empty and not the current room, remove the key
                                if (next[oldRoom].length === 0 && oldRoom !== currRoom) {
                                    delete next[oldRoom];
                                }
                            }
                        }
                    }
                }
            });

            next[roomLabel] = updatedAnimals;
            return next;
        });
    }, [currRoom]);

    const handleAnimalsFound = useCallback((room: string, cage: Option<string>, foundAnimals: HousingTransferData[], triggeredBy: string) => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'study',
            queryName: 'demographicsCurLocationNew',
            columns: ['id', 'room', 'room/rowid', 'cage'],
            filterArray: [Filter.create('id', foundAnimals.map(a => a.id), Filter.Types.IN)]
        };

        labkeyActionSelectWithPromise(config).then(result => {
            const currentLocations: Record<string, {room: Option<string>, cage: Option<string>}> = {};
            result.rows.forEach(row => {
                currentLocations[row.id] = {
                    room: { label: row.room, value: row.room },
                    cage: { label: row.cage?.cage_number?.toString() || '', value: row.cage?.toString() || '' }
                };
            });

            setAnimalsByRoom(prev => {
                const next = { ...prev };
                const roomKey = room;

                const existingInTarget = next[roomKey] || [];
                const existingIds = new Set(existingInTarget.map(a => a.id));
                const uniqueNew = foundAnimals
                    .filter(a => !existingIds.has(a.id))
                    .map(a => ({
                        ...a,
                        currentRoom: currentLocations[a.id]?.room || { value: '', label: '' },
                        currentCage: currentLocations[a.id]?.cage || { value: '', label: '' },
                        destinationRoom: { label: 'No Change', value: 'No Change' },
                        destinationCage: { label: 'No Change', value: '0' }
                    }));

                if (uniqueNew.length > 0) {
                    next[roomKey] = [...existingInTarget, ...uniqueNew];
                }

                return next;
            });
        }).catch(err => {
            console.error('Error fetching current locations for found animals:', err);
            setAnimalsByRoom(prev => {
                const next = { ...prev };
                const roomKey = room;

                const existingInTarget = next[roomKey] || [];
                const existingIds = new Set(existingInTarget.map(a => a.id));
                const uniqueNew = foundAnimals.filter(a => !existingIds.has(a.id)).map(a => ({
                    ...a,
                    destinationRoom: { label: 'No Change', value: 'No Change' },
                    destinationCage: { label: 'No Change', value: '0' }
                }));

                if (uniqueNew.length > 0) {
                    next[roomKey] = [...existingInTarget, ...uniqueNew];
                }

                return next;
            });
        });
    }, []);

    const allAnimals = useMemo(() => {
        return Object.values(animalsByRoom).flat();
    }, [animalsByRoom]);

    const isFormValid = useMemo(() => {
        if (allAnimals.length === 0) return false;

        return allAnimals.every(animal => {
            // 1. destinationRoom
            const hasRoom = animal.destinationRoom && animal.destinationRoom.value !== null;
            if (!hasRoom) return false;

            // 2. destinationCage
            const hasCage = animal.destinationCage && (animal.destinationCage.value !== '' || animal.destinationCage.label !== '');
            if (!hasCage) return false;

            // 3. condition
            const hasCondition = animal.condition && animal.condition.length > 0;
            if (!hasCondition) return false;

            // 4. reasonForMove
            const hasReason = animal.reasonForMove && animal.reasonForMove.length > 0;
            if (!hasReason) return false;

            const reasonValues = animal.reasonForMove.map(r => r.value);

            // 5. project (required if Breeding)
            if (reasonValues.includes('Breeding')) {
                if (!animal.project) return false;
            }

            // 6. remarks (required if Other, Behavior, or if Room is Special Housing)
            if (reasonValues.includes('Other (write reason in remarks section)') || reasonValues.includes('Behavior') || animal.destinationRoom?.label === 'Special Housing') {
                if (!animal.remarks || animal.remarks.trim() === '') return false;
            }

            // 7. performedBy
            const hasPerformedBy = animal.performedBy && animal.performedBy.trim() !== '';
            if (!hasPerformedBy) return false;

            return true;
        });
    }, [allAnimals]);

    const handleValidate = useCallback(() => {
        console.log('Validating form...', allAnimals);
        alert('Validation triggered (see console)');
    }, [allAnimals]);

    const handleSubmit = useCallback(() => {
        setErrors([]);
        setIsSaving(true);
        let prevFormId;
        if(prevForm){
             prevFormId = ActionURL.getParameter('lsid');
        }
        startHousingTransfer(allAnimals, prevFormId, layoutChangeId).then((res) => {
            if(res.success){
                // Housing transfer complete
                if(ActionURL.getReturnUrl()){
                    window.location.href = ActionURL.getReturnUrl();
                }else{
                    window.location.href = ActionURL.buildURL(ActionURL.getController(), 'home', ActionURL.getContainer());
                }
            }else{
                const resData = res as any;
                if (resData?.errors && Array.isArray(resData.errors) && resData.errors.length > 0) {
                    setErrors(resData.errors.map((e: any) => (typeof e === 'string' ? e : e.msg || e.message || JSON.stringify(e))));
                } else if (resData?.reason) {
                    setErrors(Array.isArray(resData.reason) ? resData.reason : [resData.reason]);
                } else if (resData?.message) {
                    setErrors([resData.message]);
                } else {
                    setErrors(['Housing Transfer Error']);
                }
            }
            setIsSaving(false);
        }).catch(err => {
            if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                setErrors(err.errors.map((e: any) => (typeof e === 'string' ? e : e.msg || e.message || JSON.stringify(e))));
            } else if (err?.exception) {
                setErrors([err.exception]);
            } else if (err?.message) {
                setErrors([err.message]);
            } else if (typeof err === 'string') {
                setErrors([err]);
            } else {
                setErrors([`Error saving form: ${err}`]);
            }
            setIsSaving(false);
        });
    }, [allAnimals, prevForm, layoutChangeId]);

    const availableCenterAnimals = useMemo(() => {
        const addedAnimalIds = new Set(allAnimals.map(a => a.id));
        return centerAnimals.filter(id => !addedAnimalIds.has(id));
    }, [centerAnimals, allAnimals]);

    const handleAddTopAnimal = useCallback(() => {
        if (!topAnimalId || topAnimalId.trim() === '') return;

        const location = animalLocations[topAnimalId];
        const targetRoom = location?.room?.label || currRoom || 'Unassigned';
        const currentRoomOption = location?.room || { value: null, label: targetRoom };
        const currentCageOption = location?.cage || { value: '', label: '' };

        const newAnimal: HousingTransferData = {
            id: topAnimalId,
            inDate: dayjs(),
            outDate: null,
            destinationRoom: { value: null, label: '' },
            destinationCage: { value: '', label: '' },
            condition: [],
            reasonForMove: [],
            project: null,
            remarks: '',
            performedBy: '',
            alert: false,
            currentRoom: currentRoomOption,
            currentCage: currentCageOption
        };

        setAnimalsByRoom(prev => {
            const next = { ...prev };
            // Clean up empty Unassigned room if targetRoom is different and currRoom was not specified
            if (next['Unassigned'] && next['Unassigned'].length === 0 && targetRoom !== 'Unassigned' && !currRoom) {
                delete next['Unassigned'];
            }
            const existingInTarget = next[targetRoom] || [];
            next[targetRoom] = [...existingInTarget, newAnimal];
            return next;
        });

        setTopAnimalId(null);
    }, [topAnimalId, animalLocations, currRoom]);

    return (
        <div className="MuiDataGrid-form-container">
            <LoadingScreen
                isVisible={isSaving}
                message={"Saving..."}
                targetElement={document.getElementById("housing-transfer-root")}
            />
            {!prevForm && (
                <div className="add-animal-controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Autocomplete
                        value={availableCenterAnimals.find(option => option === topAnimalId) || null}
                        options={availableCenterAnimals}
                        getOptionLabel={(option: string) => option || ''}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={"Add Animal from Center"}
                                variant="standard"
                                size="small"
                            />
                        )}
                        onChange={(e, newValue) => setTopAnimalId(newValue)}
                    />
                    <button className="btn btn-primary" onClick={handleAddTopAnimal}>
                        Add Animal
                    </button>
                </div>
            )}
            {Object.keys(animalsByRoom).map(roomLabel => (
                <HousingDataGrid
                    prevData={!!prevForm}
                    autoConditions={autoConditions}
                    user={user}
                    key={roomLabel}
                    roomLabel={roomLabel}
                    animals={animalsByRoom[roomLabel]}
                    allAnimals={allAnimals}
                    onAnimalsChange={(updated) => handleAnimalsChange(roomLabel, updated)}
                    onAnimalsFound={handleAnimalsFound}
                    roomOptions={roomOptions || []}
                    reasonOptions={reasonOptions || []}
                    roomAnimals={animalsByCurRoom[roomLabel] || []}
                    animalLocations={animalLocations}
                    conditionCodes={conditionCodes}
                />
            ))}

            {allAnimals.length > 0 && (
                <div className="form-actions">
                    {canEditConditionPermission(user) &&
                        <button
                            className="btn btn-info"
                            onClick={() => setAutoConditions(prevState => !prevState)}
                        >
                            {autoConditions ? 'Disable Auto Conditions' : 'Enable Auto Conditions'}
                        </button>
                    }
                    <button className="btn btn-info" onClick={handleValidate}>Validate</button>
                    <button
                        className="btn btn-success"
                        disabled={!isFormValid || isSaving}
                        onClick={() => {setErrors([]); setIsSaving(true); handleSubmit();}}
                    >
                        Submit
                    </button>
                </div>
            )}
            {errors.length > 0 && <LayoutErrors errors={errors} />}
        </div>
    );
}