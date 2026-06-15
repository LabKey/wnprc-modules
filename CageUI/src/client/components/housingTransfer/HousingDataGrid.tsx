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
import { HousingRowMetadata, HousingTransferData } from '../../types/housingFormTypes';
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
import * as dayjs from 'dayjs';
import { Autocomplete, Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Option } from '@labkey/components';
import { Filter } from '@labkey/api';
import { dateTimeColumnType } from './DateTimeGridField';
import { findAnimalsInCage } from '../../api/popularQueries';

interface HousingDataGridProps {
    roomLabel: string;
    animals: HousingTransferData[];
    onAnimalsChange: (animals: HousingTransferData[]) => void;
    onAnimalsFound: (room: string, cage: Option<string>, animals: HousingTransferData[], triggeredBy: string) => void;
    roomOptions: Option<number>[];
    reasonOptions: Option<string>[];
    centerAnimals: string[];
}

export const HousingDataGrid: FC<HousingDataGridProps> = (props) => {
    const { roomLabel, animals, onAnimalsChange, onAnimalsFound, roomOptions, reasonOptions, centerAnimals } = props;
    const [rowMetadata, setRowMetadata] = useState<Record<string, HousingRowMetadata>>({});
    const [newAnimalId, setNewAnimalId] = useState<string>(null);
    const [autoSizeOptions] = useState<GridAutosizeOptions>({
        includeHeaders: true,
        includeOutliers: true,
        expand: true,
        outliersFactor: 1.5,
    });
    const apiRef = useGridApiRef();

    const filteredCenterAnimals = useMemo(() => {
        const addedAnimalIds = new Set(animals.map(a => a.id));
        return centerAnimals.filter(id => !addedAnimalIds.has(id));
    }, [centerAnimals, animals]);

    useEffect(() => {
        if (apiRef.current) {
            const timeout = setTimeout(() => {
                apiRef.current?.autosizeColumns(autoSizeOptions);
            }, 250);
            return () => clearTimeout(timeout);
        }
    }, [apiRef, animals, autoSizeOptions]);

    const handleAddAnimal = useCallback(() => {
        if (!newAnimalId || newAnimalId.trim() === '') return;
        
        const newAnimal: HousingTransferData = {
            id: newAnimalId,
            inDate: dayjs(),
            outDate: null,
            destinationRoom: {value: null, label: ''},
            destinationCage: {value: '', label: ''},
            condition: '',
            reasonForMove: [],
            remarks: '',
            performedBy: ''
        };
        onAnimalsChange([...animals, newAnimal]);
        setNewAnimalId(null);
    }, [newAnimalId, animals, onAnimalsChange, roomLabel]);

    const handleRemoveAnimal = useCallback((id: string) => {
        onAnimalsChange(animals.filter(a => a.id !== id));
    }, [animals, onAnimalsChange]);

    const handleCellChange = useCallback((field: string, paramId: GridRowId, value: any)=> {
        onAnimalsChange(animals.map(a => a.id === paramId ? { ...a, [field]: value } : a));
    }, [animals, onAnimalsChange]);

    const handleRoomChange = useCallback(async (paramId: GridRowId, newValue: Option<number>) => {
        if (!newValue) {
            setRowMetadata(prev => ({
                ...prev,
                [paramId]: {
                    cageOptions: []
                }
            }));
            onAnimalsChange(animals.map(a => 
                a.id === paramId 
                    ? { ...a, destinationRoom: { value: null, label: '' }, destinationCage: { value: '', label: '' } } 
                    : a
            ));
            return;
        }

        const selectedRoom = newValue.label;
        let cageOptions: Option<string>[] = [];

        if (newValue.label === 'No Change' && newValue.value === 0) {
            setRowMetadata(prev => ({
                ...prev,
                [paramId]: {
                    cageOptions: []
                }
            }));
            onAnimalsChange(animals.map(a =>
                a.id === paramId
                    ? { ...a, destinationRoom: newValue, destinationCage: { label: 'No Change', value: '0' } }
                    : a
            ));
            return;
        }

        if (selectedRoom) {
            const config: SelectRowsOptions = {
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
                cageOptions
            }
        }));

        const updatedAnimals = animals.map(a => {
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
        onAnimalsChange(updatedAnimals);
    }, [animals, onAnimalsChange]);

    const processRowUpdate = useCallback((newRow: GridRowModel<HousingTransferData>) => {
        const updatedAnimals = animals.map((row) => (row.id === newRow.id ? newRow : row));
        onAnimalsChange(updatedAnimals);
        return newRow;
    }, [animals, onAnimalsChange]);

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
                    condition: '',
                    reasonForMove: [],
                    remarks: '',
                    performedBy: '',
                    triggeredBy: triggeredById
                } as HousingTransferData));

                onAnimalsFound(room, cage, existingAnimals, triggeredById);
            }
        } catch (err) {
            console.error('Error fetching animals in cage:', err);
        }
    }, [onAnimalsFound]);

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
        { field: 'destinationRoom', headerName: 'Room', flex: 1, minWidth: 150, renderCell: (params: GridRenderCellParams) => {
                const currentRoom: Option<number> = params.row.destinationRoom;
                return (
                    <Autocomplete
                        fullWidth
                        value={roomOptions.find(option => option.value === currentRoom?.value) || null}
                        options={roomOptions}
                        getOptionLabel={(option: Option<number>) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        onBlur={(event) => event.stopPropagation()}
                        onChange={(event, newValue) => {
                            handleRoomChange(params.id, newValue);
                        }}
                        blurOnSelect
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                size="small"
                            />
                        )}
                    />
                );
            }
        },
        { field: 'destinationCage', headerName: 'Cage', flex: 1, minWidth: 100, renderCell: (params: GridRenderCellParams) => {
                const currentRow = params.row as HousingTransferData;
                const currentCage = currentRow.destinationCage;
                const metadata = rowMetadata[currentRow.id];

                return (
                    <Autocomplete
                        fullWidth
                        value={
                            (metadata?.cageOptions?.find(option => option.value === currentCage.value)) ||
                            (currentCage.label === 'No Change' ? currentCage : null) ||
                            null
                        }
                        options={metadata?.cageOptions || []}
                        getOptionLabel={(option: Option<string>) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        disableClearable={currentRow.destinationRoom?.value === 0 && currentCage.value === '0'}
                        onChange={(event, newValue) => {
                            const updatedValue = newValue || { value: '', label: '' };
                            // Get current state animal
                            const animal = animals.find(a => a.id === params.id);
                            
                            // Immediately update animals state with new cage
                            const updatedAnimals = animals.map(a => a.id === params.id ? { ...a, destinationCage: updatedValue } : a);
                            onAnimalsChange(updatedAnimals);
                            
                            // Fetch animals in this cage if room is also set
                            if (newValue && animal?.destinationRoom?.label) {
                                fetchAnimalsInCage(animal.destinationRoom.label, newValue, params.id as string);
                            }
                        }}
                        blurOnSelect
                        onBlur={(event) => event.stopPropagation()}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                size="small"
                            />
                        )}
                    />
                );
            }
        },
        { field: 'condition', headerName: 'Condition', minWidth: 100, editable: true, display: 'flex' },
        { field: 'reasonForMove', headerName: 'Reason For Move', flex: 2, minWidth: 200, renderCell: (params: GridRenderCellParams) => {
            return (
                <Autocomplete
                    value={params.row.reasonForMove || []}
                    options={reasonOptions || []}
                    getOptionLabel={(option: Option<string>) => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onBlur={(event) => event.stopPropagation()}
                    onChange={(event, newValue) => {
                        handleCellChange('reasonForMove', params.id, newValue || [])
                    }}
                    blurOnSelect
                    renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        const SelectionIcon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;
                        return (
                            <li key={key} {...optionProps}>
                                <SelectionIcon
                                    fontSize="small"
                                    style={{ marginRight: 8, padding: 9, boxSizing: 'content-box' }}
                                />
                                {option.label}
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            size="small"
                        />
                    )}
                    multiple
                    fullWidth
                    disableCloseOnSelect
                />
            )}
        },
        { field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 200, display: 'flex', renderCell: (params: GridRenderCellParams) => {
            return (
                <TextField
                    variant={'standard'}
                    multiline={true}
                    fullWidth
                    onBlur={(event) => {
                        // Prevent event propagation to avoid DataGrid intercepting blur
                        event.stopPropagation();
                    }}
                    value={params.row.remarks || ''}
                    onChange={(event) => handleCellChange('remarks', params.id, event.target.value)}
                />
            )}
        },
        { field: 'performedBy', headerName: 'Performed By', minWidth: 150, editable: true, display: 'flex' },
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
    ], [reasonOptions, rowMetadata, roomOptions, handleCellChange, handleRemoveAnimal, fetchAnimalsInCage, handleRoomChange]);

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
            <div className="add-animal-controls" style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                <Autocomplete
                    value={filteredCenterAnimals.find(option => option === newAnimalId) || null}
                    options={filteredCenterAnimals}
                    getOptionLabel={(option: string) => option || ''}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={"Animals"}
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

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    sx={{
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
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    autosizeOptions={autoSizeOptions}
                    autosizeOnMount
                    disableRowSelectionOnClick
                />
            </Box>
        </Box>
    );
};
