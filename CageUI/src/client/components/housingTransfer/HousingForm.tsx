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
import { FC, useState, useEffect, useCallback } from 'react';
import { HousingRowMetadata, HousingTransferData } from '../../types/housingFormTypes';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridRowModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Autocomplete, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from '@mui/material/Select';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import MenuItem from '@mui/material/MenuItem';
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
                reasonForMove: '',
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

    const handleAddAnimal = () => {
        if (newAnimalId.trim() === '') return;
        
        const newAnimal: HousingTransferData = {
            id: newAnimalId,
            inDate: dayjs(),
            outDate: null,
            room: {value: null, label: ''},
            cage: {value: '', label: ''},
            condition: '',
            reasonForMove: '',
            remarks: '',
            performedBy: ''
        };
        setAnimals([...animals, newAnimal]);
        setNewAnimalId('');
    };

    const handleRemoveAnimal = (id: string) => {
        setAnimals(animals.filter(a => a.id !== id));
    };

    const processRowUpdate = useCallback((newRow: GridRowModel<HousingTransferData>) => {
        setAnimals((prev) => prev.map((row) => (row.id === newRow.id ? newRow : row)));
        return newRow;
    }, []);

    const handleCellChange = (field: string, paramId: GridRowId, value: any)=> {
        const updatedAnimals = [...animals];
        const index = updatedAnimals.findIndex(a => a.id === paramId);
        if (index > -1) {
            updatedAnimals[index][field] = value;
            setAnimals(updatedAnimals);
        }
    }

    const handleValidate = () => {
        console.log('Validating form...', animals);
        alert('Validation triggered (see console)');
    };

    const handleSubmit = () => {
        console.log('Submitting form...', animals);
        alert('Submit triggered (see console)');
    };

    const handleSave = () => {
        console.log('Saving form...', animals);
        alert('Save triggered (see console)');
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1, minWidth: 100, editable: false, display: 'flex' },
        {
            field: 'inDate',
            headerName: 'In Date',
            ...dateTimeColumnType,
            display: 'flex',
            flex: 1,
            minWidth: 225,
        },
        {
            field: 'outDate',
            headerName: 'Out Date',
            ...dateTimeColumnType,
            display: 'flex',
            flex: 1,
            minWidth: 225,
            editable: true,
        },
        { field: 'room', headerName: 'Room', flex: 1, minWidth: 200,  renderCell: (params: GridRenderCellParams) => {
                const currentRoom: Option<number> = params.row.room; // assuming room is stored as a number
                return (
                    <Autocomplete
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
        { field: 'cage', headerName: 'Cage', flex: 1, minWidth: 100, renderCell: (params: GridRenderCellParams) => {
                const currentRow = params.row as HousingTransferData;
                const currentCage = currentRow.cage;
                const metadata = rowMetadata[currentRow.id];

                return (
                    <Autocomplete
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
        { field: 'condition', headerName: 'Condition', flex: 1, minWidth: 100, editable: true },
        { field: 'reasonForMove', headerName: 'Reason For Move', flex: 1, minWidth: 100, editable: true },
        { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 100, renderCell: (params: GridRenderCellParams) => {
            return (
                <TextField
                    variant={'standard'}
                    multiline={true}
                    onChange={(event) => handleCellChange('remarks', params.id, event.target.value)}
                />
            )}
        },
        { field: 'performedBy', headerName: 'Performed By', flex: 1, minWidth: 100, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1, minWidth: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleRemoveAnimal(params.id as string)} color="error">
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

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

            <div className={"data-grid-parent"}>
                <DataGrid
                    sx={{
                        gridTemplateRows: 'auto 1f auto',
                        '& .MuiDataGrid-cell': {
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-cellContent': {
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiInputBase-root': {
                            height: '100%',
                        },
                        '& .MuiOutlinedInput-root': {
                            height: '100%',
                        },
                        '& .MuiAutocomplete-root': {
                            height: '100%',
                        },
                        '& .MuiTextField-root': {
                            height: '100%',
                        },
                        '& .MuiDateTimePicker': {
                            height: '100%',
                        },
                    }}
                    rows={animals}
                    columns={columns}
                    processRowUpdate={processRowUpdate}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    disableRowSelectionOnClick
                />
            </div>

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