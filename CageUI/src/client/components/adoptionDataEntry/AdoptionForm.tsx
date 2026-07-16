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
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
    DataGrid,
    GridAutosizeOptions,
    GridColDef,
    GridRenderCellParams,
    GridRowModel,
    useGridApiRef,
    useGridApiContext,
    GridRenderEditCellParams, GridCellParams
} from '@mui/x-data-grid';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { AdoptionData, AdoptionResult, AdoptionStatus } from '../../types/adoptionFormTypes';
import { dateTimeColumnType } from '../DateTimeGridField';
import { generateUUID } from '../../utils/helpers';
import { HousingTransferData } from '../../types/housingFormTypes';
import { Option } from '@labkey/components';
import { Query } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { AutoCompleteEditCell } from '../AutoCompleteEditCell';

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
            objectid: generateUUID(),
            id: '',
            date: dayjs(),
            dam: '',
            sire: '',
            type: AdoptionStatus.Start,
            result: null
        };
        setAnimals(prev => [...prev, newAnimal]);
    }, []);

    const processRowUpdate = useCallback((newRow: GridRowModel<AdoptionData>, oldRow: GridRowModel<AdoptionData>) => {
        if (newRow.type !== AdoptionStatus.End) {
            newRow.result = null;
        }
        setAnimals(prev => prev.map(row => (row.objectid === newRow.objectid ? newRow : row)));
        return newRow;
    }, []);

    const handleCellClick = useCallback((params: GridCellParams) => {
        if (params.isEditable && params.cellMode === 'view') {
            apiRef.current.startCellEditMode({ id: params.id, field: params.field });
        }
    }, [apiRef]);

    const adoptionStatusOptions = useMemo(() => {
        return Object.keys(AdoptionStatus)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                label: key,
                value: AdoptionStatus[key as keyof typeof AdoptionStatus]
            }));
    }, []);

    const adoptionResultOptions = useMemo(() => {
        return Object.keys(AdoptionResult)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                label: key,
                value: AdoptionResult[key as keyof typeof AdoptionResult]
            }));
    }, []);

    const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
        {
            field: 'id',
            headerName: 'Infant Id',
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
            headerName: 'Foster Dam',
            minWidth: 120,
            editable: true,
            display: 'flex',
            renderEditCell: (params) => (
                <TextField
                    variant="standard"
                    fullWidth
                    value={params.value || ''}
                    onChange={(e) => params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })}
                    error={!params.value}
                    required
                    autoFocus
                />
            )
        },
        {
            field: 'type',
            headerName: 'Type',
            minWidth: 120,
            editable: true,
            display: 'flex',
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={true}
                    options={adoptionStatusOptions}
                />
            ),
            valueFormatter: (value) => {
                const val = (value as any)?.value !== undefined ? (value as any).value : value;
                if (val === undefined || val === null) return '';
                return AdoptionStatus[val as number] || '';
            }
        },
        {
            field: 'result',
            headerName: 'Result',
            minWidth: 120,
            editable: true,
            display: 'flex',
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={params.row.type === AdoptionStatus.End}
                    options={adoptionResultOptions}
                />
            ),
            valueFormatter: (value) => {
                const val = (value as any)?.value !== undefined ? (value as any).value : value;
                if (val === undefined || val === null) return '';
                return AdoptionResult[val as number] || '';
            },
            isCellEditable: (params) => params.row.type === AdoptionStatus.End
        }
    ], [adoptionStatusOptions, adoptionResultOptions]);

    const getCellClassName = useCallback((params: GridCellParams<AdoptionData>) => {
        const { field, value, row } = params;

        const isRequired =
            field === 'date' ||
            field === 'dam' ||
            field === 'type' ||
            (field === 'result' && row.type === AdoptionStatus.End);

        if (isRequired && (value === null || value === undefined || value === '' || (typeof value === 'object' && (value as any).value === null))) {
            return 'required-field-error';
        }

        return '';
    }, []);

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
                    onCellClick={handleCellClick}
                    processRowUpdate={processRowUpdate}
                    getCellClassName={getCellClassName}
                    getRowId={(row) => row.objectid}
                    disableRowSelectionOnClick
                    autosizeOptions={autoSizeOptions}
                    autosizeOnMount
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
                />
            </Box>
        </Box>
    );
};

