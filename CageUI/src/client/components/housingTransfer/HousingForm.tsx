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
    GridColDef,
    GridRenderCellParams,
    GridRowId,
    GridRowModel,
    useGridApiRef
} from '@mui/x-data-grid';
import * as dayjs from 'dayjs';
import { Autocomplete, Box, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Option } from '@labkey/components';
import { Filter } from '@labkey/api';
import { dateTimeColumnType } from './DateTimeGridField';

interface HousingFormProps {
    selectedAnimals?: string[];
}

export const HousingForm: FC<HousingFormProps> = (props) => {
    const { selectedAnimals } = props;
    const [animals, setAnimals] = useState<HousingTransferData[]>([]);
    const [rowMetadata, setRowMetadata] = useState<Record<string, HousingRowMetadata>>({});
    const [newAnimalId, setNewAnimalId] = useState<string>('');
    const [roomOptions, setRoomOptions] = useState<Option<number>[]>(null);
    const [reasonOptions, setReasonOptions] = useState<Option<string>[]>(null);
    const [autoSizeOptions, setAutoSizeOptions] = useState<GridAutosizeOptions>({
        includeHeaders: true,
        includeOutliers: true,
        expand: true,
        outliersFactor: 1.5
    })
    const apiRef = useGridApiRef();

    useEffect(() => {
        console.log("animals: ", animals)
    }, [animals]);

    useEffect(() => {
        if (selectedAnimals && selectedAnimals.length > 0) {
            const initialAnimals = selectedAnimals.map(id => ({
                id,
                inDate: dayjs(),
                outDate: null,
                room: {value: null, label: ''},
                cage: {value: '', label: ''},
                condition: '',
                reasonForMove: [],
                remarks: '',
                performedBy: ''
            }));
            setAnimals(initialAnimals);
        }
    }, [selectedAnimals]);

    useEffect(() => {
        const config: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
            filterArray: [Filter.create('room', 'template', Filter.Types.DOES_NOT_CONTAIN)]
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: Option<number>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.room, value: row.rowid});
                });
                setRoomOptions(rowOptions);
            }
        }).catch(err => {
            console.error('Error fetching prev room', err);
        });
    }, []);

    useEffect(() => {
        const config: SelectRowsOptions = {
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

    useEffect(() => {
        apiRef.current?.autosizeColumns(autoSizeOptions);
    }, [apiRef.current, animals]);

    const handleAddAnimal = useCallback(() => {
        if (newAnimalId.trim() === '') return;
        
        const newAnimal: HousingTransferData = {
            id: newAnimalId,
            inDate: dayjs(),
            outDate: null,
            room: {value: null, label: ''},
            cage: {value: '', label: ''},
            condition: '',
            reasonForMove: [],
            remarks: '',
            performedBy: ''
        };
        setAnimals(prev => [...prev, newAnimal]);
        setNewAnimalId('');
    }, [newAnimalId]);

    const handleRemoveAnimal = useCallback((id: string) => {
        setAnimals(prev => prev.filter(a => a.id !== id));
    }, []);

    // This function is used to change state when not using a custom component within the grid
    const processRowUpdate = useCallback((newRow: GridRowModel<HousingTransferData>) => {
        setAnimals((prev) => prev.map((row) => (row.id === newRow.id ? newRow : row)));
        return newRow;
    }, []);

    // This function is used to change state when using a custom component such as autocomplete within the grid
    const handleCellChange = useCallback((field: string, paramId: GridRowId, value: any)=> {
        setAnimals((prev) => {
            const index = prev.findIndex(a => a.id === paramId);
            if (index > -1) {
                const updatedAnimals = [...prev];
                updatedAnimals[index] = {
                    ...updatedAnimals[index],
                    [field]: value
                };
                return updatedAnimals;
            }
            return prev;
        });
    }, []);

    const handleValidate = useCallback(() => {
        setAnimals(prev => {
            console.log('Validating form...', prev);
            return prev;
        });
        alert('Validation triggered (see console)');
    }, []);

    const handleSubmit = useCallback(() => {
        setAnimals(prev => {
            console.log('Submitting form...', prev);
            return prev;
        });
        alert('Submit triggered (see console)');
    }, []);

    const handleSave = useCallback(() => {
        setAnimals(prev => {
            console.log('Saving form...', prev);
            return prev;
        });
        alert('Save triggered (see console)');
    }, []);

    const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
        { field: 'id', headerName: 'ID', editable: false, display: 'flex' },
        {
            field: 'inDate',
            headerName: 'In Date',
            ...dateTimeColumnType,
            display: 'flex',
            editable: true,
        },
        {
            field: 'outDate',
            headerName: 'Out Date',
            ...dateTimeColumnType,
            display: 'flex',
            editable: true,
        },
        { field: 'room', headerName: 'Room', renderCell: (params: GridRenderCellParams) => {
                const currentRoom: Option<number> = params.row.room; // assuming room is stored as a number
                return (
                    <Autocomplete
                        fullWidth
                        value={roomOptions.find(option => option.value === currentRoom.value) || null}
                        options={roomOptions}
                        getOptionLabel={(option: Option<number>) => option.label}
                        onChange={async (event, newValue) => {
                            if(!newValue) {
                                handleCellChange('room', params.id, {value: null, label: ''})
                                return;
                            }
                            // Fetch cage options for the selected room
                            const selectedRoom = newValue.label;
                            let cageOptions: Option<string>[] = [];

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
                                    }));
                                } catch (err) {
                                    console.error('Error fetching cage options:', err);
                                }
                            }

                            // Update metadata
                            setRowMetadata(prev => ({
                                ...prev,
                                [params.id]: {
                                    cageOptions
                                }
                            }));
                            handleCellChange('room', params.id, newValue)
                        }}
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
        { field: 'cage', headerName: 'Cage', renderCell: (params: GridRenderCellParams) => {
                const currentRow = params.row as HousingTransferData;
                const currentCage = currentRow.cage;
                const metadata = rowMetadata[currentRow.id];

                return (
                    <Autocomplete
                        fullWidth
                        value={metadata?.cageOptions?.find(option => option.value === currentCage.value) || null}
                        options={metadata?.cageOptions || []}
                        getOptionLabel={(option: Option<string>) => option.label}
                        onChange={(event, newValue) => {
                            if(!newValue){
                                handleCellChange('cage', params.id, {value: '', label: ''});
                                return;
                            }
                            handleCellChange('cage', params.id, newValue)
                        }}
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
        { field: 'condition', headerName: 'Condition', editable: true, display: 'flex' },
        { field: 'reasonForMove', headerName: 'Reason For Move', editable: true, renderCell: (params: GridRenderCellParams) => {
            return (
                <Autocomplete
                    value={params.row.reasonForMove || []}
                    options={reasonOptions || []}
                    getOptionLabel={(option: Option<string>) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onChange={(event, newValue) => {
                        handleCellChange('reasonForMove', params.id, newValue || [])
                    }}
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
        { field: 'remarks', headerName: 'Remarks', display: 'flex', renderCell: (params: GridRenderCellParams) => {
            return (
                <TextField
                    variant={'standard'}
                    multiline={true}
                    fullWidth
                    value={params.row.remarks || ''}
                    onChange={(event) => handleCellChange('remarks', params.id, event.target.value)}
                />
            )}
        },
        { field: 'performedBy', headerName: 'Performed By', editable: true, display: 'flex' },
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
    ], [reasonOptions, rowMetadata, roomOptions, handleCellChange, handleRemoveAnimal]);

    return (
        <div className="housing-form-container">
            <div className="add-animal-controls">
                <input 
                    type="text" 
                    value={newAnimalId} 
                    onChange={(e) => setNewAnimalId(e.target.value)}
                    placeholder="Enter Animal ID"
                    className="form-control animal-id-input"
                />
                <button className="btn btn-primary" onClick={handleAddAnimal}>
                    Add Animal
                </button>
            </div>

            <Box sx={{width: '100%'}}>
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
                    processRowUpdate={processRowUpdate}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    autosizeOptions={autoSizeOptions}
                    autosizeOnMount
                    disableRowSelectionOnClick
                />
            </Box>

            {animals.length > 0 && (
                <div className="form-actions">
                    <button className="btn btn-info" onClick={handleValidate}>Validate</button>
                    <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
}