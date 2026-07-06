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
import { FC, useState, useCallback, useMemo } from 'react';
import { DataGrid, GridAutosizeOptions, GridColDef, GridRowModel, useGridApiRef } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import * as dayjs from 'dayjs';
import { AdoptionData } from '../../types/adoptionFormTypes';
import { dateTimeColumnType } from '../DateTimeGridField';
import { generateUUID } from '../../utils/helpers';

interface AdoptionFormProps {}

export const AdoptionForm: FC<AdoptionFormProps> = (props) => {
    const [animals, setAnimals] = useState<AdoptionData[]>([]);
    const apiRef = useGridApiRef();
    const [autoSizeOptions] = useState<GridAutosizeOptions>({
        includeHeaders: true,
        includeOutliers: true,
        expand: true,
        outliersFactor: 1.5,
    });

    const handleAddAnimal = useCallback(() => {
        const newAnimal: AdoptionData = {
            uuid: generateUUID(),
            id: '',
            date: dayjs(),
            dam: '',
            sire: '',
            type: ''
        };
        setAnimals(prev => [...prev, newAnimal]);
    }, []);

    const processRowUpdate = useCallback((newRow: GridRowModel<AdoptionData>) => {
        setAnimals(prev => prev.map(row => (row.uuid === newRow.uuid ? newRow : row)));
        return newRow;
    }, []);

    const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
        {
            field: 'id',
            headerName: 'ID',
            minWidth: 100,
            editable: true,
            display: 'flex'
        },
        {
            field: 'date',
            headerName: 'Date',
            ...dateTimeColumnType,
            minWidth: 180,
            editable: true,
            display: 'flex'
        },
        {
            field: 'dam',
            headerName: 'Dam',
            minWidth: 120,
            editable: true,
            display: 'flex'
        },
        {
            field: 'sire',
            headerName: 'Sire',
            minWidth: 120,
            editable: true,
            display: 'flex'
        },
        {
            field: 'type',
            headerName: 'Type',
            minWidth: 120,
            editable: true,
            display: 'flex'
        }
    ], []);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
                <Button variant="contained" onClick={handleAddAnimal}>
                    Add Infant
                </Button>
            </Box>
            <Box sx={{width: '100%' }}>
                <DataGrid
                    rows={animals}
                    columns={columns}
                    apiRef={apiRef}
                    processRowUpdate={processRowUpdate}
                    getRowId={(row) => row.uuid}
                    disableRowSelectionOnClick
                    autosizeOptions={autoSizeOptions}
                    autosizeOnMount
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
                />
            </Box>
        </Box>
    );
};