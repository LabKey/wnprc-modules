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
import { HousingTransferData } from '../../types/housingFormTypes';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface HousingFormProps {
    selectedAnimals?: string[];
}

export const HousingForm: FC<HousingFormProps> = (props) => {
    const { selectedAnimals } = props;
    const [animals, setAnimals] = useState<HousingTransferData[]>([]);
    const [newAnimalId, setNewAnimalId] = useState<string>('');

    useEffect(() => {
        if (selectedAnimals && selectedAnimals.length > 0) {
            const initialAnimals = selectedAnimals.map(id => ({
                id,
                inDate: dayjs(),
                outDate: null,
                room: '',
                cage: '',
                condition: '',
                reasonForMove: '',
                remarks: '',
                performedBy: ''
            }));
            setAnimals(initialAnimals);
        }
    }, [selectedAnimals]);

    const handleAddAnimal = () => {
        if (newAnimalId.trim() === '') return;
        
        const newAnimal: HousingTransferData = {
            id: newAnimalId,
            inDate: dayjs(),
            outDate: null,
            room: '',
            cage: '',
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
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {
            field: 'inDate',
            headerName: 'In Date',
            width: 225,
            renderCell: (params: GridRenderCellParams) => (
                <DateTimePicker
                    value={params.value}
                    onChange={(newValue) => {
                        const updatedAnimals = [...animals];
                        const index = updatedAnimals.findIndex(a => a.id === params.id);
                        if (index > -1) {
                            updatedAnimals[index].inDate = newValue;
                            setAnimals(updatedAnimals);
                        }
                    }}
                    slotProps={{ 
                        textField: { 
                            variant: 'standard', 
                            fullWidth: true,
                            onKeyDown: (e) => e.stopPropagation()
                        } 
                    }}
                />
            ),
        },
        {
            field: 'outDate',
            headerName: 'Out Date',
            width: 225,
            renderCell: (params: GridRenderCellParams) => (
                <DatePicker
                    value={params.value}
                    onChange={(newValue) => {
                        const updatedAnimals = [...animals];
                        const index = updatedAnimals.findIndex(a => a.id === params.id);
                        if (index > -1) {
                            updatedAnimals[index].outDate = newValue;
                            setAnimals(updatedAnimals);
                        }
                    }}
                    slotProps={{ 
                        textField: { 
                            variant: 'standard', 
                            fullWidth: true,
                            onKeyDown: (e) => e.stopPropagation()
                        } 
                    }}
                />
            ),
        },
        { field: 'room', headerName: 'Room', width: 100, editable: true },
        { field: 'cage', headerName: 'Cage', width: 100, editable: true },
        { field: 'condition', headerName: 'Condition', width: 120, editable: true },
        { field: 'reasonForMove', headerName: 'Reason For Move', width: 150, editable: true },
        { field: 'remarks', headerName: 'Remarks', width: 200, editable: true },
        { field: 'performedBy', headerName: 'Performed By', width: 150, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
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
                        display: 'grid',
                        gridTemplateRows: 'auto 1f auto',
                    }}
                    rows={animals}
                    columns={columns}
                    processRowUpdate={processRowUpdate}
                    getRowId={(row) => row.id}
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