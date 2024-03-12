import * as React from 'react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
    MRT_EditActionButtons,
    MaterialReactTable,
    // createRow,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_TableOptions,
    useMaterialReactTable, MRT_ActionMenuItem, createRow, openEditingCell, MRT_Cell, MRT_FilterOption,
} from 'material-react-table';
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Stack, MenuItem
} from '@mui/material';
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {compareItems, rankItem, RankingInfo} from "@tanstack/match-sorter-utils";
import { type User } from './testData';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Email } from '@mui/icons-material';
import {QueryDetailsResponse} from '@labkey/api/dist/labkey/query/GetQueryDetails';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import {DateInput} from './DateInput';
import DatePicker from 'react-datepicker';
import ControlledDateInput from './ControlledDateInput';
import { EditableGridCell } from './EditableGridCell';
import {showEditableGridCreateModal, EditableGridCreateModal} from './EditableGridCreateModal';
import { get, useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import {FilterFn} from '@tanstack/react-table';

interface ResizeableTableProps {
    data: any;
    metaData: QueryColumn[];
    columnHelper: any;
    schema: string;
    query: string;
    formControl: any;
}
type TableRow<T> = {
    key: string
    Id: string,
    date: Date,
    project: string,
    protocol: string,
    quantity: string,
    performedby: string,
    assayCode: string,
    billedby: string,
    tube_type: string,
    additionalServices: string,
    instructions: string,
    remark: string,
    QCState: string,
    taskid: string,
    requestid: string
}

const ResizeableTable = (props: ResizeableTableProps) => {
    const {data, metaData, columnHelper, schema, query, formControl} = props;
    const columnNames = Object.keys(data[0]).reduce((result, key) => {
        result[key] = key.charAt(0).toUpperCase() + key.slice(1); // convert the key to titlecase
        return result;
    }, {} as const);
    const [open, setOpen] = useState(true);
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [editingCell, setEditingCell] = useState<MRT_Cell<any>>();
    const [editingRow, setEditingRow] = useState<MRT_Row<any>>();
    const [creatingRow, setCreatingRow] = useState<MRT_Row<any>>();
    const {getValues,setValue, resetField} = useFormContext();
    const [globalFilter, setGlobalFilter] = useState('');
    const {remove} = useFieldArray(({control: formControl, name: `${schema}-${query}`}));
    const queryClient = useQueryClient();
    console.log("QC: ", queryClient.getQueryData(['rows']));
    //const {fields} = useFieldArray({control: formControl, name: "ResizeTable"})
    console.log("Meta: ", metaData);
    console.log("DATA: ", data);
    console.log("Fields: ", getValues());
    const isWithinRange = (row, columnId, value) => {
        const date = row.original[columnId];
        const [startDate, endDate] = value;
        const start = new Date(startDate);
        const end = new Date(endDate);
        //If one filter defined and date is null filter it
        if((start || end) && !date) return false;
        if(start && !end){
            return date.getTime() >= start.getTime()
        }else if(!start && end){
            return date.getTime() <= end.getTime()
        }else if (start && end) {
            return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
        } else return true;
    };
    const textFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
        // Rank the item
        const itemRank = rankItem(row.original[columnId], value);
        console.log("fuzzy1: ", row, columnId, value);
        console.log("Fuzzy rank1: ", itemRank);
        // Store the itemRank info
        addMeta({
            itemRank,
        })

        // Return if the item should be filtered in/out
        return itemRank.passed
    }

    const columns = useMemo(() => metaData.map((col, colIdx) => (
        columnHelper.accessor(`${schema}-${query}.${col.name}`, {
            header: `${col.name}`,
            id: `${col.name}`,
            meta: {...metaData[colIdx]},
            Cell: ({cell}) => (
                <EditableGridCell className={""} type={(cell.column.columnDef.meta as QueryColumn).type} prevForm={null}
                                  name={`${schema}-${query}.${cell.row.id}.${col.name}`} required={metaData[colIdx].required}/>
            ),
            filterVariant: (col.type === "Date and Time") ? 'datetime-range' : 'text',
            filterFn: (col.type === "Date and Time") ? isWithinRange : textFilter
        }))
    ), [metaData]);



    //call CREATE hook
    const { mutateAsync: createUser, isPending: isCreatingUser } =
        useCreateUser();
    //call READ hook
    const {
        data: fetchedUsers = [],
        isError: isLoadingUsersError,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
    } = useGetUsers(data, schema, query);
    //call UPDATE hook
    const { mutateAsync: updateUser, isPending: isUpdatingUser } =
        useUpdateUser();
    //call DELETE hook
    const { mutateAsync: deleteUser, isPending: isDeletingUser } =
        useDeleteUser();

    //CREATE action
    const handleCreateUser: MRT_TableOptions<TableRow<any>>['onCreatingRowSave'] = async ({
        values,
        table,
    }) => {
        const newValidationErrors = validateUser(values, metaData);
        if (newValidationErrors.filter(bool => !bool).length !== 0) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        const newTableVals = {};
        for (let key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const newKey = key.slice(key.lastIndexOf(".") + 1);
                newTableVals[newKey] = values[key];
            }
        }
        //await createUser(values);
        // update table state
        queryClient.setQueryData(
            ['rows'],
            (prevRows: any) => (
                [
                    ...prevRows,
                    {
                        ...newTableVals,
                        id: (Math.random() + 1).toString(36).substring(7),
                    },
                ] as TableRow<any>[]),
        );
        // Update react hook form state
        for (let key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const newKey = key.replace("mrt-row-create", `${(queryClient.getQueryState(['rows']).data as Array<any>).length - 1}`);
                setValue(newKey, values[key]);
            }
        }

        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleUpdateUser: MRT_TableOptions<TableRow<any>>['onEditingRowSave'] = async ({
        values,
        table
    }) => {
        const newValidationErrors = validateUser(values, metaData);
        const updatedRowIdx: number = parseInt(Object.keys(values).map(key => key.match(/\.(\d+)\./)?.[1])[0]);
        if (newValidationErrors.filter(bool => !bool).length !== 0) {
            setValidationErrors(newValidationErrors);
            return;
        }
        console.log("VALS: ", values);
        setValidationErrors({});
        Object.keys(values).forEach((key, idx) => {
            setValue(key, values[key]);
        });
        queryClient.setQueryData(['rows'], (prevRows: any) =>
            prevRows?.map((prevRow, prevRowIdx) => {
                if(prevRowIdx !== updatedRowIdx) {
                    return prevRow;
                }
                const newVal = Object.entries(values).reduce((acc, [key, value]) => {
                    const newKey = key.slice(key.lastIndexOf(".") + 1)
                    acc[newKey] = value;
                    return acc;
                }, {});
                console.log("newVal: ", newVal);
                return(
                    newVal
                );
            }),
        )
        //await updateUser(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<TableRow<any>>) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(row.index);
            remove(row.index);
            console.log(getValues());
        }
    };

    //Global Search
    const handleGlobalFilterChange = (value: string) => {
        console.log("FOUND ME: ", value);
        const filteredData = (queryClient.getQueryData(['rows']) as any[]).map(((prevRow) => {
            if(prevRow) {
                return(prevRow);
            }
            return;
        }));
        console.log("Filtered Data: ", filteredData);

    }
    useEffect(() => {
        console.log("GLOBAL: ", globalFilter);

    },[globalFilter]);
    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
        // Rank the item
        const itemRank = rankItem<Date>(row.original[columnId], value.$d);
        console.log("fuzzy: ", row, columnId, value);
        console.log("Fuzzy rank: ", itemRank);
        // Store the itemRank info
        addMeta({
            itemRank,
        })

        // Return if the item should be filtered in/out
        return itemRank.passed
    }

    const table = useMaterialReactTable({
        columns,
        data: fetchedUsers,
        filterFns: {
            myCustomGlobalFn: fuzzyFilter
        },
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        layoutMode: "semantic",
        enableColumnFilterModes: true,
        enableColumnResizing: true,
        enableCellActions: false,
        getRowId: (row) => row.key,
        muiToolbarAlertBannerProps: isLoadingUsersError
            ? {
                color: 'error',
                children: 'Error loading data',
            }
            : undefined,
        muiTableBodyCellProps: {
            sx: {
                overflow: 'visible',
                zIndex: 'tooltip'
            }
        },
        muiTableBodyRowProps: {
            sx: {
                overflow: 'inherit',
            }
        },
        muiTableContainerProps: {
            sx: {
                minHeight: '500px',
            },
        },
        muiTablePaperProps: {
            sx: {
                marginTop: '10px',
                marginBottom: '10px',
            },
        },
        muiCreateRowModalProps: {
            open: open,
            PaperProps: {
                component: "form",
                id: "createRowForm",
                onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const getTypeByName = (array, name) => array.find(obj => obj.name === name)?.type;
                    const formData: FormData & any = new FormData(e.currentTarget);
                    // Builds new row object, transforms string dates into date objects
                    const formJson = Array.from(formData.entries()).reduce((acc, [key, value]) => {
                        acc[key] = getTypeByName(metaData, key.match(/[^.]*$/)[0]) === "Date and Time" ? new Date(value) : value;
                        return acc;
                    }, {});
                    handleCreateUser({values: formJson, table: table} as any);
                },
            }
        },
        muiEditRowDialogProps: {
            open: open,
            PaperProps: {
                component: "form",
                id: "editRowForm",
                onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const getTypeByName = (array, name) => array.find(obj => obj.name === name)?.type;
                    const formData: FormData & any = new FormData(e.currentTarget);
                    // Builds new row object, transforms string dates into date objects
                    const formJson = Array.from(formData.entries()).reduce((acc, [key, value]) => {
                        acc[key] = getTypeByName(metaData, key.match(/[^.]*$/)[0]) === "Date and Time" ? new Date(value) : value;
                        return acc;
                    }, {});
                    handleUpdateUser({values: formJson, table: table} as any);
                },
            }
        },
        muiSearchTextFieldProps: {
            onKeyDown: (e) => {
                if(e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                else{
                    return true;
                }
            }
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "myCustomGlobalFn",
        onCreatingRowSave: handleCreateUser,
        onEditingRowSave: handleUpdateUser,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Create New Blood Draw</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {<EditableGridCreateModal
                        table={table}
                        row={row}
                        schema={schema}
                        query={query}
                    />} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <button
                        type={'submit'}
                        form={"createRowForm"}
                    >
                        submit
                    </button>
                    <button
                        type={'button'}
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        cancel
                    </button>
                </DialogActions>
            </>
        ),
        //optionally customize modal content
        renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Edit User</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {<EditableGridCreateModal
                        table={table}
                        row={row}
                        schema={schema}
                        query={query}
                    />} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <button type={'submit'} form={"editRowForm"}> submit</button>
                    <button
                        type={'button'}
                        onClick={() => {
                            setOpen(false);
                        }}
                    > cancel</button>
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Edit">
                    <IconButton onClick={() => {
                        setOpen(true);
                        table.setEditingRow(row);
                    }}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        renderTopToolbarCustomActions: ({table }) => (
            <Button
                variant="contained"
                type={"button"}
                onClick={() => {
                    setOpen(true);
                    table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                    //or you can pass in a row object to set default values with the `createRow` helper function
                    // table.setCreatingRow(
                    //   createRow(table, {
                    //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
                    //   }),
                    // );
                }}
            >
                Create New Blood Draw
            </Button>
        ),
        renderCellActionMenuItems: ({ closeMenu, cell, row, table }) => [
            <MRT_ActionMenuItem //or just use the normal MUI MenuItem
                icon={<Email />}
                key={1}
                label="Item 1"
                onClick={() => {
                    //your logic here
                    console.log("cell: ", cell);
                    closeMenu(); //close the menu after the action is performed
                }}
                table={table}
            />
        ],
        renderColumnFilterModeMenuItems: ({ column, onSelectFilterMode }) => [
            <MenuItem
                key="startsWith"
                onClick={() => onSelectFilterMode('startsWith')}
            >
                Start With
            </MenuItem>,
            <MenuItem
                key="endsWith"
                onClick={() => onSelectFilterMode('myCustomGlobalFn')}
            >
                Your Custom Filter Fn
            </MenuItem>,
        ],
        state: {
            isLoading: isLoadingUsers,
            isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
            showAlertBanner: isLoadingUsersError,
            showProgressBars: isFetchingUsers
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
    console.log("Creating Row");
    const {setValue} = useFormContext();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: TableRow<any>) => {
            //send api update request here
            console.log("I RAN");
            for (let key in values) {
                if (Object.prototype.hasOwnProperty.call(values, key)) {
                    const newKey = key.replace("mrt-row-create", `${queryClient.getQueryState(['rows']).dataUpdateCount - 1}`);
                    setValue(newKey, values[key]);
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newUserInfo: TableRow<any>) => {
            queryClient.setQueryData(
                ['rows'],
                (prevUsers: any) => (
                    [
                        ...prevUsers,
                        {
                            ...newUserInfo,
                            id: (Math.random() + 1).toString(36).substring(7),
                        },
                    ] as TableRow<any>[]),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

//READ hook (get users from api)
function useGetUsers(data: any, schema, query) {
    const {getValues} = useFormContext();
    return useQuery<TableRow<any>[]>({
        queryKey: ['rows'],
        queryFn: async () => {
            //send api request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve(getValues()[`${schema}-${query}`]);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put user in api)
function useUpdateUser() {
    const queryClient = useQueryClient();
    console.log("Start update: ", queryClient);
    return useMutation({
        mutationFn: async (user: TableRow<any>) => {
            //send api update request here
            console.log("Saving(3)...", user);

            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newUserInfo: TableRow<any>) => {
            console.log("Saving(2)...");
            console.log("Saving newUser: ", newUserInfo);
            queryClient.setQueryData(['rows'], (prevUsers: any) =>
                prevUsers?.map((prevUser: TableRow<any>) =>
                    prevUser.key === newUserInfo.key ? newUserInfo : prevUser,
                ),
            );
            console.log("Saving ", queryClient.getQueryData(['rows']));
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rowId: number) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (rowId: number) => {
            queryClient.setQueryData(['rows'], (prevUsers: any) =>
                prevUsers?.filter((_, rowIdx) => rowIdx !== rowId),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

const validateEmail = (email: string) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateUser(values: TableRow<any>, metaData: any) {

    return(Object.keys(values).map(key => {
        return true;
    }))
}


const queryClient = new QueryClient();

export const MUIEditableGridPanel = (props) => {
    console.log(props);
    const {defaultValues, redirectSchema, redirectQuery, metaData, componentProps, formControl} = props;
    const {columnHelper} = componentProps;
    if(!metaData) return;
    if (!(redirectSchema && redirectQuery && defaultValues && `${redirectSchema}-${redirectQuery}` in defaultValues)) return;
    const data = defaultValues[`${redirectSchema}-${redirectQuery}`];
    console.log("Meta: ", metaData);
    data[0].date = data[0].date.toString();

    //Put this with your other react-query providers near root of your app
    return(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <QueryClientProvider client={queryClient}>
                <ResizeableTable
                    data={data}
                    metaData={metaData}
                    columnHelper={columnHelper}
                    schema={redirectSchema}
                    query={redirectQuery}
                    formControl={formControl}
                />
            </QueryClientProvider>
        </LocalizationProvider>

    );
};
