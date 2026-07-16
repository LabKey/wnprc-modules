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
import {
    DataGrid,
    GridColDef,
    GridRowsProp,
    useGridApiContext,
    GridRenderEditCellParams,
    GRID_DATE_COL_DEF,
    GRID_DATETIME_COL_DEF,
    GridColTypeDef,
    GridFilterInputValueProps,
    getGridDateOperators,
} from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Says this import is unused but will break typescript if removed
import { enUS as locale } from 'date-fns/locale';
import { format } from 'date-fns/format';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { Dayjs } from 'dayjs';

AdapterDateFns; // this is here to prevent intellij/ide "remove unused imports" from cleaning up the required import above.

// Check out the code used here at this link to explain it further. (MUI X v9.3.0)
// https://mui.com/x/react-data-grid/custom-columns/#date-pickers
/**
 * `date` column
 */

const dateColumnType: GridColTypeDef<Date, string> = {
    ...GRID_DATE_COL_DEF,
    resizable: false,
    renderEditCell: (params) => {
        return <GridEditDateCell {...params} />;
    },
    filterOperators: getGridDateOperators(false).map((item) => ({
        ...item,
        InputComponent: GridFilterDateInput,
        InputComponentProps: { showTime: false },
    })),
    valueFormatter: (value) => {
        if (value) {
            return format(value, 'MM/dd/yyyy', { locale });
        }
        return '';
    },
};

function GridEditDateCell({
                              id,
                              field,
                              value,
                              colDef,
                              hasFocus,
                          }: GridRenderEditCellParams<any, Date | null, string>) {
    const apiRef = useGridApiContext();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(true);
    const Component = colDef.type === 'dateTime' ? DateTimePicker : DatePicker;

    const handleChange = (newValue: unknown) => {
        apiRef.current.setEditCellValue({ id, field, value: newValue });
    };

    const handleAccept = (newValue: unknown) => {
        apiRef.current.setEditCellValue({ id, field, value: newValue });
        apiRef.current.stopCellEditMode({ id, field });
    };

    const handleClose = () => {
        setOpen(false);
        apiRef.current.stopCellEditMode({ id, field });
    };

    useEnhancedEffect(() => {
        if (hasFocus) {
            inputRef.current!.focus();
        }
    }, [hasFocus]);

    return (
        <Component
            value={value}
            autoFocus
            open={open}
            onOpen={() => setOpen(true)}
            onClose={handleClose}
            onChange={handleChange}
            onAccept={handleAccept}
            closeOnSelect={false}
            timeSteps={{ minutes: 1 }}
            slotProps={{
                actionBar: {
                    actions: ['cancel', 'accept'],
                },
                textField: {
                    inputRef,
                    variant: 'standard',
                    fullWidth: true,
                    sx: {
                        padding: '0 9px',
                        justifyContent: 'center',
                        '& .MuiInput-underline:after': {
                            borderBottomColor: value ? 'primary' : 'error.main',
                        },
                    },
                    error: !value,
                    slotProps: {
                        input: {
                            disableUnderline: false,
                            sx: { fontSize: 'inherit' },
                        },
                    },
                },
            }}
        />
    );
}

function GridFilterDateInput(
    props: GridFilterInputValueProps & { showTime?: boolean },
) {
    const { item, showTime, applyValue, apiRef } = props;

    const Component = showTime ? DateTimePicker : DatePicker;

    const handleFilterChange = (newValue: unknown) => {
        applyValue({ ...item, value: newValue });
    };

    return (
        <Component
            value={item.value ? new Date(item.value) : null}
            autoFocus
            label={apiRef.current.getLocaleText('filterPanelInputLabel')}
            slotProps={{ textField: { size: 'small' } }}
            onChange={handleFilterChange}
        />
    );
}

/**
 * `dateTime` column
 */

export const dateTimeColumnType: GridColTypeDef<Date, string> = {
    ...GRID_DATETIME_COL_DEF,
    resizable: true,
    renderEditCell: (params) => {
        return <GridEditDateCell {...params} />;
    },
    filterOperators: getGridDateOperators(true).map((item) => ({
        ...item,
        InputComponent: GridFilterDateInput,
        InputComponentProps: { showTime: true },
    })),
    valueFormatter: (value: Dayjs) => {
        if (value) {
            return format(value.toDate(), 'MM/dd/yyyy hh:mm a', { locale });
        }
        return '';
    },
};
