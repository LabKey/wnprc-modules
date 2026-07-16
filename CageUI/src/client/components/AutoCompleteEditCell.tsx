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
import { useState } from 'react';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { Autocomplete, TextField } from '@mui/material';

interface AutoCompleteEditCellParams {
    options: any[]
    required: boolean;
    multiple?: boolean;
    disableClearable?: boolean;
}

export const AutoCompleteEditCell = (props: GridRenderEditCellParams & AutoCompleteEditCellParams) => {
    const { id, field, value, options, required, multiple, disableClearable } = props;
    const apiRef = useGridApiContext();
    const [open, setOpen] = useState(true);

    const handleChange = (event: any, newValue: any) => {
        apiRef.current.setEditCellValue({ id, field, value: newValue });
        if (!multiple && (newValue || newValue === null)) {
            apiRef.current.stopCellEditMode({ id, field });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Tab') {
            apiRef.current.stopCellEditMode({ id, field });
        }
    };

    const isError = required && (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '');
    const selectedOption = multiple ? (value || []) : (options.find(opt => opt.value === value || opt === value) || null);

    return (
        <Autocomplete
            options={options}
            getOptionLabel={(option) => option.label || ''}
            value={selectedOption}
            onChange={handleChange}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={(event, reason) => {
                if (reason === 'selectOption' || reason === 'blur' || reason === 'escape') {
                    setOpen(false);
                }
            }}
            fullWidth
            multiple={multiple}
            disableClearable={disableClearable}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={(params) => (
                <TextField
                    {...params}
                    autoFocus
                    variant="standard"
                    onKeyDown={handleKeyDown}
                    required={required}
                    error={isError}
                />
            )}
        />
    );
};