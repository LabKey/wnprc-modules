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
import { Autocomplete, Box, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { AdoptionData, AdoptionResult, AdoptionStatus } from '../../types/adoptionFormTypes';
import { dateTimeColumnType } from '../DateTimeGridField';
import { generateUUID } from '../../utils/helpers';
import { ActionURL, Filter, Query } from '@labkey/api';
import { labkeyActionSelectWithPromise, startAdoptionSubmission } from '../../api/labkeyActions';
import { AutoCompleteEditCell } from '../AutoCompleteEditCell';
import { LoadingScreen } from '../LoadingScreen';
import { LayoutErrors } from '../LayoutErrors';

interface AdoptionFormProps {
    prevForm?: AdoptionData;
}

export const AdoptionForm: FC<AdoptionFormProps> = (props) => {
    const {prevForm} = props;
    const [animals, setAnimals] = useState<AdoptionData[]>(prevForm ? [prevForm] : []);
    const [centerAnimals, setCenterAnimals] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const apiRef = useGridApiRef();
    const [autoSizeOptions] = useState<GridAutosizeOptions>({
        includeHeaders: true,
        includeOutliers: true,
        expand: true,
        outliersFactor: 1.5,
    });

    useEffect(() => {
        if (apiRef.current) {
            const timeout = setTimeout(() => {
                apiRef.current?.autosizeColumns(autoSizeOptions);
            }, 250);
            return () => clearTimeout(timeout);
        }
    }, [apiRef, animals, autoSizeOptions]);

    useEffect(() => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'study',
            queryName: 'demographics',
            viewName: 'Alive, at Center',
            columns: ['Id']
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: string[] = [];
                result.rows.forEach(row => {
                    rowOptions.push(row.Id);
                });
                setCenterAnimals(rowOptions);
            }
        }).catch(err => {
            console.error('Error fetching alive at center animals', err);
        });
    }, []);

    const handleAddAnimal = useCallback(() => {
        const newAnimal: AdoptionData = {
            objectid: generateUUID(),
            id: '',
            date: dayjs(),
            dam: null,
            sire: null,
            type: {
                label: AdoptionStatus[AdoptionStatus.Start] as keyof typeof AdoptionStatus,
                value: AdoptionStatus.Start
            },
            result: null
        };
        setAnimals(prev => [...prev, newAnimal]);
    }, []);

    const handleDeleteRow = useCallback((objectid: string) => {
        setAnimals(prev => prev.filter(animal => animal.objectid !== objectid));
    }, []);

    const processRowUpdate = useCallback((newRow: GridRowModel<AdoptionData>, oldRow: GridRowModel<AdoptionData>) => {
        if (newRow.type && newRow.type.value !== AdoptionStatus.End) {
            newRow.result = null;
        }

        if (!prevForm && newRow.id && newRow.id !== oldRow.id) {
            const config: Query.SelectRowsOptions = {
                schemaName: 'study',
                queryName: 'adoptionsOngoing',
                filterArray: [Filter.create('Id', newRow.id, Filter.Types.EQUAL)],
                columns: ['dam']
            };

            labkeyActionSelectWithPromise(config).then(result => {
                if (result.rows.length !== 0) {
                    const damId = result.rows[0].dam;
                    setAnimals(prev => prev.map(row => (row.objectid === newRow.objectid ? { ...newRow, dam: damId } : row)));
                }
            }).catch(err => {
                console.error('Error fetching ongoing adoption for dam ID', err);
            });
        }

        setAnimals(prev => prev.map(row => (row.objectid === newRow.objectid ? newRow : row)));
        return newRow;
    }, [prevForm]);

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

    const centerAnimalsOptions = useMemo(() => {
        return centerAnimals.map(animalId => ({
            label: animalId,
            value: animalId
        }));
    }, [centerAnimals]);

    const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
        {
            field: 'id',
            headerName: 'Infant Id',
            minWidth: 100,
            flex: 1,
            display: 'flex',
            editable: true,
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={true}
                    options={centerAnimalsOptions}
                    returnValueOnly={true}
                />
            ),
            valueFormatter: (value) => {
                if (value === undefined || value === null) return '';
                return value;
            }
        },
        {
            field: 'date',
            headerName: 'Date',
            ...dateTimeColumnType,
            minWidth: 180,
            flex: 1,
            display: 'flex',
            editable: true
        },
        {
            field: 'dam',
            headerName: 'Foster Dam',
            minWidth: 120,
            flex: 1,
            display: 'flex',
            editable: true,
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={false}
                    options={centerAnimalsOptions}
                    returnValueOnly={true}
                />
            ),
            valueFormatter: (value) => {
                if (value === undefined || value === null) return '';
                return value;
            }
        },
        {
            field: 'sire',
            headerName: 'Foster Sire',
            minWidth: 120,
            flex: 1,
            display: 'flex',
            editable: true,
            renderEditCell: (params) => (
                <AutoCompleteEditCell
                    {...params}
                    required={false}
                    options={centerAnimalsOptions}
                    returnValueOnly={true}
                />
            ),
            valueFormatter: (value) => {
                if (value === undefined || value === null) return '';
                return value;
            }
        },
        {
            field: 'type',
            headerName: 'Type',
            minWidth: 120,
            flex: 1,
            display: 'flex',
            editable: true,
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
            flex: 1,
            display: 'flex',
            editable: true,
            renderEditCell: (params) => {
                if(params.row.type?.value !== AdoptionStatus.End){
                    return;
                }
                return(
                    <AutoCompleteEditCell
                        {...params}
                        required={params.row.type?.value === AdoptionStatus.End}
                        options={adoptionResultOptions}
                    />
                );
            },
            valueFormatter: (value) => {
                const val = (value as any)?.value !== undefined ? (value as any).value : value;
                if (val === undefined || val === null) return '';
                return AdoptionResult[val as number] || '';
            },
            isCellEditable: (params) => params.row.type?.value === AdoptionStatus.End
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            minWidth: 80,
            display: 'flex',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleDeleteRow(params.row.objectid)} color="error">
                    <DeleteIcon/>
                </IconButton>
            ),
        }
    ], [adoptionStatusOptions, adoptionResultOptions, centerAnimalsOptions, handleDeleteRow]);

    const isRowValid = useCallback((row: AdoptionData) => {
        const { id, date, type, result } = row;
        const isTypeEnd = type?.value === AdoptionStatus.End;

        return (
            id !== '' && id !== null && id !== undefined &&
            date !== null && date !== undefined &&
            type !== null && type !== undefined &&
            (!isTypeEnd || (result !== null && result !== undefined))
        );
    }, []);

    const isFormValid = useMemo(() => {
        return animals.length > 0 && animals.every(isRowValid);
    }, [animals, isRowValid]);

    const getCellClassName = useCallback((params: GridCellParams<AdoptionData>) => {
        const { field, value, row } = params;

        const isRequired =
            field === 'id' ||
            field === 'date' ||
            field === 'type' ||
            (field === 'result' && row.type?.value === AdoptionStatus.End);

        if (isRequired && (value === null || value === undefined || value === '')) {
            return 'required-field-error';
        }

        return '';
    }, []);

    const handleSubmit = useCallback(() => {
        console.log('Submitting form...', animals);
        startAdoptionSubmission(animals).then((res) => {
            if(res.success){
                // Housing transfer complete
                window.location.href = ActionURL.buildURL(
                    "query",
                    'executeQuery',
                    ActionURL.getContainer(),
                {schemaName: "study", queryName: "adoptions"});
            }else{
                // If this happens, the issue is likely related to a faulty submission in the java portion that didn't throw
                // an error correctly. Otherwise, it would have gotten caught in the catch below.
                setErrorMsg(["Unknown Error Occurred"]);
            }
            setIsSaving(false);
        }).catch(err => {
            if(err.errors){
                setErrorMsg(err.errors.map(e => e.msg));
            }else{
                setErrorMsg(err);
            }
            setIsSaving(false);
        });
    }, [animals]);

    return (
        <Box sx={{ p: 3 }} className="MuiDataGrid-form-container">
            <LoadingScreen
                isVisible={isSaving}
                message={"Saving Form..."}
                targetElement={document.getElementById("adoption-form-root")}
            />
            {!prevForm &&
                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={handleAddAnimal}>
                        Add Infant
                    </Button>
                </Box>
            }

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={animals}
                    columns={columns}
                    apiRef={apiRef}
                    onCellClick={handleCellClick}
                    processRowUpdate={processRowUpdate}
                    getCellClassName={getCellClassName}
                    getRowId={(row) => row.objectid}
                    getRowHeight={() => 'auto'}
                    disableRowSelectionOnClick
                    autosizeOptions={autoSizeOptions}
                    columnVisibilityModel={{
                        actions: !prevForm,
                    }}
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
            {animals.length > 0 && (
                <div className="form-actions">
                    <button
                        className="btn btn-success"
                        disabled={isSaving || !isFormValid}
                        onClick={() => {setErrorMsg([]); setIsSaving(true); handleSubmit();}}
                    >
                        Submit
                    </button>
                </div>
            )}
            {errorMsg.length > 0 && <LayoutErrors errors={errorMsg} />}
        </Box>
    );
};

