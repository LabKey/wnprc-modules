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
import { ConditionCode, ConditionTypes, HousingRowMetadata, HousingTransferData } from '../../types/housingFormTypes';
import {
    DataGrid,
    GridAutosizeOptions,
    GridCellParams,
    GridColDef,
    GridRenderCellParams,
    GridRowId,
    GridRowModel,
    useGridApiRef
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Option } from '@labkey/components';
import { Filter, Query, Security } from '@labkey/api';
import { dateTimeColumnType } from '../DateTimeGridField';
import { fetchConditionCodes, findAnimalsInCage } from '../../api/popularQueries';
import { canEditConditionPermission } from '../../utils/homeHelpers';
import { AutoCompleteEditCell } from '../AutoCompleteEditCell';
import {
    checkIsMarm,
    checkIsInfant,
    getCagingCodes,
    getCode,
    infantInDestination,
    checkIsAdopted, checkIsMale, getSocialCode, checkIsMotherInDest, checkIsFatherInDest, checkIsAdoptedMotherInDest,
    checkIsAdoptedFatherInDest
} from '../../utils/housingTransferHelpers';

interface HousingDataGridProps {
    prevData: boolean;
    autoConditions: boolean;
    user: Security.GetUserPermissionsResponse;
    roomLabel: string;
    animals: HousingTransferData[];
    allAnimals: HousingTransferData[];
    onAnimalsChange: (animals: HousingTransferData[]) => void;
    onAnimalsFound: (room: string, cage: Option<string>, animals: HousingTransferData[], triggeredBy: string) => void;
    roomOptions: Option<string>[];
    reasonOptions: Option<string>[];
    centerAnimals?: string[];
    roomAnimals?: string[];
    animalLocations?: Record<string, { room: Option<string>, cage: Option<string> }>;
    conditionCodes: ConditionCode[];
}

export const HousingDataGrid: FC<HousingDataGridProps> = (props) => {
    const {prevData, autoConditions, user, roomLabel, animals, allAnimals, onAnimalsChange, onAnimalsFound, roomOptions, reasonOptions, centerAnimals, roomAnimals, animalLocations, conditionCodes } = props;
    const [rowMetadata, setRowMetadata] = useState<Record<string, HousingRowMetadata>>({});
    const [canEditCondition, setCanEditCondition] = useState<boolean>(false);
    const [newAnimalId, setNewAnimalId] = useState<string>(null);
    const [specialHousingDialogOpen, setSpecialHousingDialogOpen] = useState<boolean>(false);
    const [specialHousingAnimalId, setSpecialHousingAnimalId] = useState<string | null>(null);
    const [specialHousingRoomInput, setSpecialHousingRoomInput] = useState<string>('');
    const [specialHousingPrevAnimal, setSpecialHousingPrevAnimal] = useState<HousingTransferData | null>(null);
    const [autoSizeOptions] = useState<GridAutosizeOptions>({
        includeHeaders: true,
        includeOutliers: true,
        expand: true,
        outliersFactor: 1.5,
    });
    const apiRef = useGridApiRef();

    const isSpecialHousing = useCallback((animal: HousingTransferData) => {
        if (!animal) return false;
        return animal.destinationCage?.label === 'Special Housing' || 
               animal.destinationCage?.value === 'Special Housing' || 
               animal.destinationRoom?.label === 'Special Housing' || 
               animal.destinationRoom?.value === 'Special Housing' ||
               (animal.condition && animal.condition.some(c => c.value === 'x'));
    }, []);

    const handleSpecialHousingConfirm = useCallback(() => {
        const trimmedRoom = specialHousingRoomInput.trim();
        if (!trimmedRoom || !specialHousingAnimalId) return;

        const xCode = getCode('x', conditionCodes) || { value: 'x', label: 'x - special', type: ConditionTypes.special };

        const updatedAnimals = animals.map(a => {
            if (a.id === specialHousingAnimalId) {
                return {
                    ...a,
                    destinationRoom: { label: trimmedRoom, value: trimmedRoom },
                    destinationCage: { label: 'Special Housing', value: 'Special Housing' },
                    condition: [xCode]
                };
            }
            return a;
        });

        setRowMetadata(prev => ({
            ...prev,
            [specialHousingAnimalId]: {
                ...prev[specialHousingAnimalId],
                cageOptions: [],
                animalsInDestinationCage: []
            }
        }));

        onAnimalsChange(updatedAnimals);
        setSpecialHousingDialogOpen(false);
        setSpecialHousingAnimalId(null);
        setSpecialHousingRoomInput('');
        setSpecialHousingPrevAnimal(null);
    }, [animals, conditionCodes, onAnimalsChange, specialHousingAnimalId, specialHousingRoomInput]);

    const handleSpecialHousingCancel = useCallback(() => {
        if (specialHousingPrevAnimal && specialHousingAnimalId) {
            const updatedAnimals = animals.map(a => a.id === specialHousingAnimalId ? specialHousingPrevAnimal : a);
            onAnimalsChange(updatedAnimals);
        }
        setSpecialHousingDialogOpen(false);
        setSpecialHousingAnimalId(null);
        setSpecialHousingRoomInput('');
        setSpecialHousingPrevAnimal(null);
    }, [animals, onAnimalsChange, specialHousingAnimalId, specialHousingPrevAnimal]);

    const filteredRoomAnimals = useMemo(() => {
        const addedAnimalIds = new Set(allAnimals.map(a => a.id));
        const candidateAnimals = roomAnimals || [];
        return candidateAnimals.filter(id => !addedAnimalIds.has(id));
    }, [roomAnimals, allAnimals]);


    useEffect(() => {
        setCanEditCondition(canEditConditionPermission(user));
    }, []);

    useEffect(() => {
        if (apiRef.current) {
            const timeout = setTimeout(() => {
                apiRef.current?.autosizeColumns(autoSizeOptions);
            }, 250);
            return () => clearTimeout(timeout);
        }
    }, [apiRef, animals, autoSizeOptions]);



    useEffect(() => {
        updateConditionCodes(animals, animals);
    }, [allAnimals]);

    useEffect(() => {
        if (autoConditions) {
            updateConditionCodes(animals, animals);
        }
    }, [autoConditions]);

    const handleCellChange = useCallback((field: string, paramId: GridRowId, value: any)=> {
        const updatedAnimals = animals.map(a => a.id === paramId ? { ...a, [field]: value } : a);
        onAnimalsChange(updatedAnimals);
    }, [animals, onAnimalsChange]);

    const fetchProjectOptions = useCallback(async (animalId: string) => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'study',
            queryName: 'ActiveAssignments',
            columns: ['project', 'project/displayName'],
            filterArray: [Filter.create('Id', animalId, Filter.Types.EQUALS)]
        };

        try {
            const result = await labkeyActionSelectWithPromise(config);
            const projectOptions: Option<string>[] = result.rows.map(row => ({
                label: row['project/displayName'] || row.project.toString(),
                value: row.project.toString()
            }));

            setRowMetadata(prev => ({
                ...prev,
                [animalId]: {
                    ...prev[animalId],
                    projectOptions
                }
            }));
        } catch (err) {
            console.error('Error fetching project options:', err);
        }
    }, []);

    useEffect(() => {
        animals.forEach(animal => {
            if (animal.reasonForMove.find(r => r.value === 'Breeding')) {
                if (!rowMetadata[animal.id]?.projectOptions) {
                    fetchProjectOptions(animal.id);
                }
            }
        });
    }, [animals, fetchProjectOptions]);



    /**
     * Function for calculating condition codes based on flow chart.
     * @param animalId The ID of the animal to calculate for
     * @param animalsInCage List of all animals (IDs) that will be in the destination cage, this includes animalId above
     */
    const calculateConditionCodes = useCallback(async (animalId: string, animalsInCage: string[], destCageId: string, reasonForMove: Option<string>[]): Promise<ConditionCode[]> => {
        if (destCageId === 'Special Housing' || destCageId === '-1') {
            const xCode = getCode('x', conditionCodes) || { value: 'x', label: 'x - special', type: ConditionTypes.special };
            return [xCode];
        }

        // TODO: Implement the actual flow chart logic here
        const newCond: ConditionCode[] = [];
        let pairingCode;
        // The user will finish this function.
        // For now, return a placeholder or keep existing if any.

        // Calculate pairing codes
        if(animalsInCage.length === 1){
            pairingCode = 's';
        }else if(animalsInCage.length === 2){
            pairingCode = 'p';
        }else{
            pairingCode = 'g';
        }
        newCond.push(getCode(pairingCode, conditionCodes));

        // Calculate caging code
        const cageCodes = await getCagingCodes(destCageId);
        if(cageCodes.length > 0){
            cageCodes.forEach(code => {
                newCond.push(getCode(code, conditionCodes));
            })
        }

        // Calculate Social Code

        const isAnimalMarm = await checkIsMarm(animalId);
        const isAnimalInfant = await checkIsInfant(animalId);

        if(isAnimalMarm || isAnimalInfant){
            if(pairingCode === 'p'){
                const socialCode = await getSocialCode(animalId, animalsInCage);
                if(socialCode){
                    newCond.push(getCode(socialCode, conditionCodes));
                }
            }else{
                const isMotherInDestination = await checkIsMotherInDest(animalId, animalsInCage);
                const isFatherInDestination = await checkIsFatherInDest(animalId, animalsInCage);
                const isAdoptedMotherInDestination = await checkIsAdoptedMotherInDest(animalId, animalsInCage);
                const isAdoptedFatherInDestination = await checkIsAdoptedFatherInDest(animalId, animalsInCage);

                if(isMotherInDestination && isFatherInDestination){
                    newCond.push(getCode('mf', conditionCodes));
                }else if(isMotherInDestination && isAdoptedFatherInDestination){
                    newCond.push(getCode('amf', conditionCodes));
                }else if (isAdoptedMotherInDestination && isFatherInDestination){
                    newCond.push(getCode('mfa', conditionCodes));
                }else if (isAdoptedMotherInDestination && isAdoptedFatherInDestination){
                    newCond.push(getCode('mafa', conditionCodes));
                }else{
                    const socialCode = await getSocialCode(animalId, animalsInCage);
                    if(socialCode){
                        newCond.push(getCode(socialCode, conditionCodes));
                    }
                }
            }
        }else { // Animal in transit is not infant or marm
            const isBreeding = reasonForMove.find((r: Option<string>) => r.value === 'Breeding');

            // Check if any animals in destination are infant offspring to the animal in transit
            const infantId = await infantInDestination(animalsInCage);
            if (infantId) {
                if (isBreeding) {
                    const isMale = await checkIsMale(animalId);
                    if (isMale) {
                        newCond.push(getCode('b', conditionCodes));
                    } else {
                        newCond.push(getCode('bi', conditionCodes));
                    }
                } else {
                    const isInfantAdopted = await checkIsAdopted(animalId, infantId);
                    if (isInfantAdopted) {
                        newCond.push(getCode('ia', conditionCodes));
                    } else {
                        newCond.push(getCode('i', conditionCodes));
                    }
                }
            } else {
                if (isBreeding) {
                    newCond.push(getCode('b', conditionCodes));
                }
            }
        }
        
        return newCond;
    }, [conditionCodes]);

    const updateConditionCodes = useCallback(async (affectedAnimals: HousingTransferData[], currentAnimals: HousingTransferData[]) => {
        if(!autoConditions) return;
        const cageGroups: Record<string, string[]> = {};
        const newRowMetadata: Record<string, Partial<HousingRowMetadata>> = {};

        const getEffectiveCageId = (animal: HousingTransferData): string | null => {
            if (isSpecialHousing(animal)) {
                return null;
            }
            if (animal.destinationRoom?.label === 'No Change') {
                return animal.currentCage?.value || null;
            }
            return animal.destinationCage?.value || null;
        };

        const getOriginalCageId = (animal: HousingTransferData): string | null => {
            return animal.currentCage?.value || null;
        };

        const getOriginalRoomLabel = (animal: HousingTransferData): string | null => {
            return animal.currentRoom?.label || null;
        };

        // Determine all cages that might have changed occupants
        const affectedCageIds = new Set<string>();
        currentAnimals.forEach(a => {
            const dest = getEffectiveCageId(a);
            if (dest) affectedCageIds.add(dest);
            const orig = getOriginalCageId(a);
            if (orig) affectedCageIds.add(orig);
        });

        // For each affected cage, calculate the TRUE set of future occupants
        for (const cageId of affectedCageIds) {
            // 1. Start with physical occupants
            const physicalAnimals = await findAnimalsInCage(cageId);
            let occupants = physicalAnimals.map(a => a.id);

            // 2. Remove any that are in the form (any room) and moving AWAY from this cage
            const leavingAnimals = allAnimals.filter(a => {
                const orig = getOriginalCageId(a);
                const dest = getEffectiveCageId(a);
                return orig === cageId && dest !== cageId;
            });
            const leavingIds = new Set(leavingAnimals.map(a => a.id));
            occupants = occupants.filter(id => !leavingIds.has(id));

            // 3. Add any that are in the form (any room) and moving INTO this cage
            const enteringAnimals = allAnimals.filter(a => {
                const orig = getOriginalCageId(a);
                const dest = getEffectiveCageId(a);
                return dest === cageId && orig !== cageId;
            });
            enteringAnimals.forEach(a => {
                if (!occupants.includes(a.id)) {
                    occupants.push(a.id);
                }
            });

            cageGroups[cageId] = occupants;
        }

        const updatedAnimals = await Promise.all(currentAnimals.map(async (a) => {
            if (isSpecialHousing(a)) {
                newRowMetadata[a.id] = {
                    animalsInDestinationCage: []
                };
                const xCode = getCode('x', conditionCodes) || { value: 'x', label: 'x - special', type: ConditionTypes.special };
                return { ...a, condition: [xCode] };
            }

            const cageId = getEffectiveCageId(a);
            if (cageId && cageGroups[cageId]) {
                const cageMates = cageGroups[cageId];
                newRowMetadata[a.id] = {
                    animalsInDestinationCage: cageMates.filter(id => id !== a.id)
                };

                const newCondition = await calculateConditionCodes(a.id, cageMates, cageId, a.reasonForMove);
                if (newCondition) {
                    return { ...a, condition: newCondition };
                }
            } else if (a.currentRoom?.label === roomLabel && getOriginalCageId(a)) {
                // If animal is in this grid but doesn't have a destination yet, 
                // it might still be in its original cage if no move is planned.
                // However, for the purpose of the transfer form, we usually care about the destination.
                // If destination is blank, we can show its current cage mates as a reference.
                const cageId = getOriginalCageId(a);
                if (cageId && cageGroups[cageId]) {
                    const cageMates = cageGroups[cageId];
                    newRowMetadata[a.id] = {
                        animalsInDestinationCage: cageMates.filter(id => id !== a.id)
                    };
                }
            } else {
                newRowMetadata[a.id] = {
                    animalsInDestinationCage: []
                };
            }
            return a;
        }));


        // Update row metadata for tooltips
        setRowMetadata(prev => {
            const updated = { ...prev };
            Object.keys(newRowMetadata).forEach(id => {
                updated[id] = {
                    ...updated[id],
                    ...newRowMetadata[id]
                };
            });
            return updated;
        });

        if (JSON.stringify(updatedAnimals) !== JSON.stringify(currentAnimals)) {
            onAnimalsChange(updatedAnimals);
        }
    }, [calculateConditionCodes, onAnimalsChange, allAnimals, autoConditions, isSpecialHousing, conditionCodes, roomLabel]);

    const handleAddAnimal = useCallback(() => {
        if (!newAnimalId || newAnimalId.trim() === '') return;

        const location = animalLocations?.[newAnimalId];
        const newAnimal: HousingTransferData = {
            id: newAnimalId,
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
            currentRoom: location?.room || { value: null, label: roomLabel },
            currentCage: location?.cage || { value: '', label: '' }
        };
        const updatedAnimals = [...animals, newAnimal];
        onAnimalsChange(updatedAnimals);
        setNewAnimalId(null);

        // Potential recalculation if needed, though room/cage are empty for new animal
        updateConditionCodes(updatedAnimals, updatedAnimals);
    }, [newAnimalId, animals, onAnimalsChange, updateConditionCodes, animalLocations, roomLabel]);

    const handleRoomChange = useCallback(async (paramId: GridRowId, newValue: Option<string>) => {
        let updatedAnimalsState = animals;
        if (!newValue || newValue.value === null || (typeof newValue === 'object' && Object.keys(newValue).length === 0)) {
            setRowMetadata(prev => ({
                ...prev,
                [paramId]: {
                    ...prev[paramId],
                    cageOptions: [],
                    animalsInDestinationCage: []
                }
            }));
            updatedAnimalsState = animals.map(a =>
                a.id === paramId
                    ? { ...a, destinationRoom: { value: null, label: '' }, destinationCage: { value: '', label: '' } }
                    : a
            );
            onAnimalsChange(updatedAnimalsState);
            return updatedAnimalsState;
        }

        if (newValue.value === 'Special Housing' || newValue.label === 'Special Housing') {
            const targetAnimal = animals.find(a => a.id === paramId);
            const initialRoom = (targetAnimal && targetAnimal.destinationRoom?.label && targetAnimal.destinationRoom.label !== 'Special Housing')
                ? targetAnimal.destinationRoom.label
                : '';
            setSpecialHousingAnimalId(paramId as string);
            setSpecialHousingPrevAnimal(targetAnimal || null);
            setSpecialHousingRoomInput(initialRoom);
            setSpecialHousingDialogOpen(true);
            return animals;
        }

        if (newValue.value === 'No Change') {
            const specialCageOption = { label: 'No Change', value: '0' };
            setRowMetadata(prev => ({
                ...prev,
                [paramId]: {
                    ...prev[paramId],
                    cageOptions: [],
                    animalsInDestinationCage: []
                }
            }));
            updatedAnimalsState = animals.map(a =>
                a.id === paramId
                    ? { ...a, destinationRoom: newValue, destinationCage: specialCageOption }
                    : a
            );
            onAnimalsChange(updatedAnimalsState);
            return updatedAnimalsState;
        }

        const selectedRoom = newValue.label;
        let cageOptions: Option<string>[] = [];

        if (selectedRoom) {
            const config: Query.SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'cagesInRoom',
                columns: ['room', 'rack_object_id', 'rackid', 'cage_object_id', 'cage_number'],
                filterArray: [Filter.create('room', selectedRoom, Filter.Types.EQUALS)]
            };

            try {
                const result = await labkeyActionSelectWithPromise(config);
                cageOptions = result.rows.map(row => ({
                    label: row.cage_number.toString(),
                    value: row.cage_object_id
                })).sort((a, b) => {
                    return Number(a.label) - Number(b.label);
                });
            } catch (err) {
                console.error('Error fetching cage options:', err);
            }
        }

        setRowMetadata(prev => ({
            ...prev,
            [paramId]: {
                ...prev[paramId],
                cageOptions,
                animalsInDestinationCage: []
            }
        }));

        updatedAnimalsState = animals.map(a => {
            if (a.id === paramId) {
                const updated = {
                    ...a,
                    destinationRoom: newValue,
                    destinationCage: { value: '', label: '' }
                };
                return updated;
            }
            return a;
        });
        onAnimalsChange(updatedAnimalsState);
        return updatedAnimalsState;

        // Update condition codes as destination cage was cleared
    }, [animals, onAnimalsChange]);

    const handleRemoveAnimal = useCallback((id: string) => {
        const updatedAnimals = animals.filter(a => a.id !== id);
        onAnimalsChange(updatedAnimals);
        // Recalculate for everyone else as someone left their potential cage
        updateConditionCodes(updatedAnimals, updatedAnimals);
    }, [animals, onAnimalsChange, updateConditionCodes]);



    const handleAnimalsChange = useCallback((updatedAnimals: HousingTransferData[]) => {
        onAnimalsChange(updatedAnimals);
    }, [onAnimalsChange]);

    const fetchAnimalsInCage = useCallback(async (room: string, cage: Option<string>, triggeredById: string) => {
        try {
            const result = await findAnimalsInCage(cage.value);
            if (result.length > 0) {
                const existingAnimals = result.map(animal => ({
                    id: animal.id,
                    inDate: dayjs(),
                    outDate: null,
                    destinationRoom: { value: null, label: '' }, // Keep destination clear for existing animals in that room
                    destinationCage: { value: '', label: '' },
                    condition: [],
                    reasonForMove: [],
                    project: null,
                    remarks: '',
                    performedBy: '',
                    alert: false,
                    triggeredBy: triggeredById
                } as HousingTransferData));

                onAnimalsFound(room, cage, existingAnimals, triggeredById);
            }
        } catch (err) {
            console.error('Error fetching animals in cage:', err);
        }
    }, [onAnimalsFound]);

    const processRowUpdate = useCallback(async (newRow: GridRowModel<HousingTransferData>, oldRow: GridRowModel<HousingTransferData>) => {
        let updatedAnimals = animals.map((row) => (row.id === newRow.id ? newRow : row));
        let finalRow = newRow;

        if (newRow.destinationRoom?.value !== oldRow.destinationRoom?.value || 
            (newRow.destinationRoom?.value === null && oldRow.destinationRoom?.value !== null)) {
            updatedAnimals = await handleRoomChange(newRow.id, newRow.destinationRoom);
            finalRow = updatedAnimals.find(a => a.id === newRow.id) || newRow;
        } else if (newRow.destinationCage?.value !== oldRow.destinationCage?.value) {
            if (newRow.destinationCage && newRow.destinationRoom?.label &&
                newRow.destinationCage.value !== 'Special Housing' && 
                newRow.destinationCage.label !== 'Special Housing' && 
                newRow.destinationCage.value !== '0' && 
                newRow.destinationCage.value !== '-1') {
                fetchAnimalsInCage(newRow.destinationRoom.label, newRow.destinationCage, newRow.id);
            }
        }

        if (JSON.stringify(newRow.reasonForMove) !== JSON.stringify(oldRow.reasonForMove)) {
            const isBreeding = newRow.reasonForMove.find((r: Option<string>) => r.value === 'Breeding');
            if (isBreeding && !rowMetadata[newRow.id]?.projectOptions) {
                fetchProjectOptions(newRow.id);
            }
        }

        onAnimalsChange(updatedAnimals);
        return finalRow;
    }, [animals, onAnimalsChange, handleRoomChange, fetchAnimalsInCage, fetchProjectOptions, rowMetadata]);

    const getCellClassName = useCallback((params: GridCellParams<HousingTransferData>) => {
        const { field, value, row } = params;

        let isRequired = false;
        if (field === 'destinationRoom') {
            isRequired = true;
        } else if (field === 'destinationCage') {
            isRequired = true;
        } else if (field === 'condition') {
            isRequired = true;
        } else if (field === 'reasonForMove') {
            isRequired = true;
        } else if (field === 'remarks') {
            const reasonForMoveValues = (row.reasonForMove || []).map((r: Option<string>) => r.value);
            const isSpecial = isSpecialHousing(row);
            isRequired = reasonForMoveValues.includes("Other (write reason in remarks section)") ||
                reasonForMoveValues.includes("Behavior") ||
                isSpecial;
        } else if (field === 'performedBy') {
            isRequired = true;
        } else if (field === 'project') {
            const isBreeding = row.reasonForMove.find((r: Option<string>) => r.value === 'Breeding');
            isRequired = !!isBreeding;
        }

        const isMissing = isRequired && (
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value === '') ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && 'value' in (value as any) && ((value as any).value === null || (value as any).value === ''))
        );

        if (isMissing) {
            return 'required-field-error';
        }

        return '';
    }, [isSpecialHousing]);

    const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
        { field: 'id', headerName: 'ID', minWidth: 100, editable: false, display: 'flex' },
        {
            field: 'inDate',
            headerName: 'In Date',
            ...dateTimeColumnType,
            minWidth: 180,
            display: 'flex',
            editable: true,
        },
        {
            field: 'outDate',
            headerName: 'Out Date',
            ...dateTimeColumnType,
            minWidth: 180,
            display: 'flex',
            editable: true,
        },
        {
            field: 'destinationRoom',
            headerName: 'Room',
            flex: 1,
            minWidth: 150,
            editable: true,
            renderEditCell: (params) => {
                const currentRow = params.row as HousingTransferData;
                const rowRoomOptions = [...roomOptions];
                if (currentRow.destinationRoom?.label && !rowRoomOptions.some(opt => opt.label === currentRow.destinationRoom.label)) {
                    rowRoomOptions.splice(1, 0, { label: currentRow.destinationRoom.label, value: currentRow.destinationRoom.value || currentRow.destinationRoom.label });
                }
                return (
                    <AutoCompleteEditCell
                        {...params}
                        required={true}
                        options={rowRoomOptions}
                    />
                );
            },
            valueFormatter: (value: Option<number>) => value?.label || '',
        },
        {
            field: 'destinationCage',
            headerName: 'Cage',
            flex: 1,
            minWidth: 100,
            editable: true,
            isCellEditable: (params) => {
                const isSpecial = params.row.destinationCage?.label === 'Special Housing' || params.row.destinationCage?.value === 'Special Housing';
                const isNoChange = params.row.destinationRoom?.value === 'No Change' || params.row.destinationRoom?.label === 'No Change';
                return !isSpecial && !isNoChange;
            },
            renderEditCell: (params) => {
                const metadata = rowMetadata[params.id as string];
                const currentRow = params.row as HousingTransferData;
                return (
                    <AutoCompleteEditCell
                        {...params}
                        required={true}
                        options={metadata?.cageOptions || []}
                        disableClearable={currentRow.destinationRoom?.value === 'No Change' && currentRow.destinationCage?.value === '0'}
                    />
                );
            },
            valueFormatter: (value: Option<string>) => value?.label || '',
        },
        {
            field: 'condition',
            headerName: 'Condition',
            minWidth: 150,
            editable: true,
            display: 'flex',
            renderCell: (params: GridRenderCellParams) => {
                const metadata = rowMetadata[params.id as string];
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2">
                            {(params.value as Option<string>[] || []).map(o => o.label).join(', ')}
                        </Typography>
                        {metadata?.animalsInDestinationCage && metadata.animalsInDestinationCage.length > 0 && (
                            <Tooltip title={`Cage mates: ${metadata.animalsInDestinationCage.join(', ')}`}>
                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'action.active' }} />
                            </Tooltip>
                        )}
                    </Box>
                );
            },
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={true}
                    multiple={true}
                    options={conditionCodes || []}
                />
            ),
            isCellEditable: () => canEditCondition,
        },
        {
            field: 'reasonForMove',
            headerName: 'Reason For Move',
            flex: 2,
            minWidth: 200,
            editable: true,
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={true}
                    multiple={true}
                    options={reasonOptions || []}
                />
            ),
            valueFormatter: (value: Option<string>[]) => (value || []).map(o => o.label).join(', '),
        },
        {
            field: 'project',
            headerName: 'Project',
            flex: 0.5,
            minWidth: 100,
            editable: true,
            renderEditCell: (params) => {
                const metadata = rowMetadata[params.id as string];
                return (
                    <AutoCompleteEditCell
                        {...params}
                        required={true}
                        options={metadata?.projectOptions || []}
                    />
                );
            },
            valueFormatter: (value: any) => (value as Option<string>)?.label || value || '',
            isCellEditable: (params) => {
                const reasonForMove = params.row.reasonForMove || [];
                return !!reasonForMove.find((r: Option<string>) => r.value === 'Breeding');
            },
        },
        { field: 'ejacConfirmed', headerName: 'Ejaculation Confirmed', flex: 0.5, minWidth: 100,
            renderCell: (params: GridRenderCellParams) => {
                const currentRow = params.row as HousingTransferData;
                const isBreedingEnded = currentRow.reasonForMove.find((r: Option<string>) => r.value === 'Breeding ended');

                if (isBreedingEnded) {
                    const isAlert = params.value as boolean;
                    return (
                        <IconButton
                            size="small"
                            onClick={() => {
                                handleCellChange('ejacConfirmed', params.id, !isAlert);
                            }}
                        >
                            {isAlert ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />}
                        </IconButton>
                    );
                }
                return null;
            }
        },
        { field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 200, editable: true, renderCell: (params: GridRenderCellParams) => {
            const reasonForMoveValues = (params.row.reasonForMove || []).map((r: Option<string>) => r.value);
            const isSpecial = isSpecialHousing(params.row);
            const requiresRemarks = reasonForMoveValues.includes("Other (write reason in remarks section)") ||
                reasonForMoveValues.includes("Behavior") ||
                isSpecial;
            const isMissing = requiresRemarks && (!params.row.remarks || params.row.remarks.trim() === '');
            
            return (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ 
                        color: isMissing ? 'error.main' : 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.2
                    }}>
                        {params.value}
                    </Typography>
                </Box>
            )},
            renderEditCell: (params) => {
                const reasonForMoveValues = (params.row.reasonForMove || []).map((r: Option<string>) => r.value);
                const isSpecial = isSpecialHousing(params.row);
                const requiresRemarks = reasonForMoveValues.includes("Other (write reason in remarks section)") ||
                    reasonForMoveValues.includes("Behavior") ||
                    isSpecial;
                const isMissing = requiresRemarks && (!params.value || params.value.trim() === '');
                
                return (
                    <TextField
                        variant="standard"
                        fullWidth
                        multiline
                        autoFocus
                        value={params.value || ''}
                        onChange={(e) => params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.stopPropagation();
                            }
                        }}
                        required={requiresRemarks}
                        error={isMissing}
                        sx={{
                            '& .MuiInputBase-input': {
                                lineHeight: 1.2,
                                whiteSpace: 'pre-wrap',
                            },
                            '& .MuiInput-root': {
                                padding: '4px 0 5px',
                            }
                        }}
                    />
                );
            }
        },
        { field: 'performedBy', headerName: 'Performed By', minWidth: 150, editable: true, renderCell: (params: GridRenderCellParams) => {
            const isMissing = !params.value || params.value.trim() === '';
            return (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isMissing ? 'error.main' : 'inherit' }}>
                        {params.value}
                    </Typography>
                </Box>
            );
        },
        renderEditCell: (params) => {
            const isMissing = !params.value || params.value.trim() === '';
            return (
                <TextField
                    fullWidth
                    variant="standard"
                    autoFocus
                    value={params.value || ''}
                    onChange={(e) => params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })}
                    required
                    error={isMissing}
                    sx={{
                        '& .MuiInput-root': {
                            padding: '4px 0 5px',
                        }
                    }}
                />
            );
        }},
        {
            field: 'alert',
            headerName: 'Alert',
            minWidth: 80,
            display: 'flex',
            renderCell: (params: GridRenderCellParams) => {
                const isAlert = params.value as boolean;
                return (
                    <IconButton
                        size="small"
                        onClick={() => {
                            handleCellChange('alert', params.id, !isAlert);
                        }}
                    >
                        {isAlert ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />}
                    </IconButton>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            display: 'flex',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleRemoveAnimal(params.id as string)} color="error">
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ], [reasonOptions, rowMetadata, roomOptions, handleCellChange, handleRemoveAnimal, fetchAnimalsInCage, handleRoomChange, fetchProjectOptions, animals, onAnimalsChange, isSpecialHousing]);

    const handleCellClick = useCallback((params: GridCellParams) => {
        if (params.isEditable && params.cellMode === 'view') {
            apiRef.current.startCellEditMode({ id: params.id, field: params.field });
        }
    }, [apiRef]);

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Room: {roomLabel}
            </Typography>
            {!prevData &&
                <div className="add-animal-controls" style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <Autocomplete
                        value={filteredRoomAnimals.find(option => option === newAnimalId) || null}
                        options={filteredRoomAnimals}
                        getOptionLabel={(option: string) => option || ''}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={"Animals in Room"}
                                variant="standard"
                                size="small"
                            />
                        )}
                        onChange={(e, newValue) => setNewAnimalId(newValue)}
                    />
                    <button className="btn btn-primary" onClick={handleAddAnimal}>
                        Add Animal
                    </button>
                </div>
            }

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    sx={{
                        '& .required-field-error': {
                            backgroundColor: '#ffebee', // Light red background
                            '&:hover': {
                                backgroundColor: '#ffcdd2',
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                        },
                        '& .MuiDataGrid-cellContent': {
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiInputBase-root': {
                            height: 'auto',
                            minHeight: '100%',
                        },
                        '& .MuiOutlinedInput-root': {
                            height: 'auto',
                        },
                        '& .MuiAutocomplete-root': {
                            width: '100%',
                        },
                        '& .MuiTextField-root': {
                            width: '100%',
                        },
                        '& .MuiDateTimePicker': {
                            height: '100%',
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            margin: 0,
                        },
                    }}
                    rows={animals}
                    columns={columns}
                    apiRef={apiRef}
                    onCellClick={handleCellClick}
                    processRowUpdate={processRowUpdate}
                    getCellClassName={getCellClassName}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    autosizeOptions={autoSizeOptions}
                    columnVisibilityModel={{
                        actions: !prevData,
                        outDate: !!(prevData && animals.find(animal => animal.outDate)), // Show outdate if the record has an outdate. (prevForm with outdate filled)
                        project: !!animals.find(animal => animal.reasonForMove.find(reason => reason.value === "Breeding")), // Show project if a reason has breeding
                        ejacConfirmed: !!animals.find(animal => animal.reasonForMove.find(reason => reason.value === 'Breeding ended')), // Show ejacConfirmed if a reason has breeding ended
                    }}
                    autosizeOnMount
                    disableRowSelectionOnClick
                    hideFooter
                />
            </Box>

            <Dialog
                open={specialHousingDialogOpen}
                onClose={handleSpecialHousingCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Special Housing Room</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Please enter the room for Special Housing:
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Room"
                        fullWidth
                        variant="standard"
                        value={specialHousingRoomInput}
                        onChange={(e) => setSpecialHousingRoomInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && specialHousingRoomInput.trim()) {
                                e.preventDefault();
                                handleSpecialHousingConfirm();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSpecialHousingCancel} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSpecialHousingConfirm}
                        color="primary"
                        variant="contained"
                        disabled={!specialHousingRoomInput.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
