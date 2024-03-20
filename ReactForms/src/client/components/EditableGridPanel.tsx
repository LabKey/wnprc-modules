import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    MaterialReactTable,
    type MRT_Row,
    type MRT_TableOptions,
    useMaterialReactTable,
    MRT_ActionMenuItem,
} from 'material-react-table';
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    MenuItem
} from '@mui/material';
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Email } from '@mui/icons-material';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import { EditableGridCell } from './EditableGridCell';
import { EditableGridCreateModal} from './EditableGridCreateModal';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import {textFilter, isWithinRange} from '../query/columnFilters';

interface EditableGridPanelProps<T extends object> {
    data: any;
    metaData: QueryColumn[];
    columnHelper: any;
    schema: string;
    query: string;
    formControl: any;
    validationFns?: {
        [key: string]: (arg: T) => boolean
    };
}
const EditableGridPanel = (props: EditableGridPanelProps<any>) => {
    const {data, metaData, columnHelper, schema, query, formControl, validationFns} = props;

    const [open, setOpen] = useState(true);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    const [validationErrors, setValidationErrors] = useState<any>({});
    const {getValues,setValue,setError, trigger, formState} = useFormContext();
    const {remove} = useFieldArray(({control: formControl, name: `${schema}-${query}`}));
    const queryClient = useQueryClient();
    const updateForm = useForm(
        {
            mode: "onChange",
            reValidateMode: "onChange"
        });
    const createForm = useForm(
        {
            mode: "onChange",
            reValidateMode: "onChange"
        });

    console.log("QC: ", queryClient.getQueryData(['rows']));
    console.log("DATA: ", data);
    console.log("MetaData: ", metaData);
    console.log("Fields: ", getValues());

    const columns = useMemo(() => metaData.map((col, colIdx)=> {
        return(columnHelper.accessor(`${schema}-${query}.${col.name}`, {
            header: `${col.name}`,
            id: `${col.name}`,
            meta: {...metaData[colIdx]},
            Cell: ({cell}) => (
                <EditableGridCell
                    className={""}
                    type={(cell.column.columnDef.meta as QueryColumn).type}
                    prevForm={null}
                    name={`${schema}-${query}.${cell.row.id}.${col.name}`}
                    required={metaData[colIdx].required}
                    validation={validationFns?.[col.name] ?? undefined}
                />
            ),
            filterVariant: (col.type === "Date and Time") ? 'datetime-range' : 'text',
            filterFn: (col.type === "Date and Time") ? isWithinRange : textFilter
        }))}
    ), [metaData]);

    //call READ hook
    const {
        data: fetchedUsers = [],
        isError: isLoadingUsersError,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
    } = useGetUsers(data, schema, query);


    //CREATE action
    const handleCreateUser: MRT_TableOptions<any>['onCreatingRowSave'] = async ({
                                                                                    values,
                                                                                    table,
                                                                                }) => {

        createForm.reset();
        Object.keys(values).forEach((key) => {
            const columnId = key.slice(key.lastIndexOf(".") + 1);
            // check if columnId has validation fns Key here is ${schema}-${query}.${rowIdx}.${columnId}
            if(validationFns?.hasOwnProperty(columnId)){
                createForm.register(key,{
                    validate: value => validationFns[columnId](value),
                });
                createForm.setValue(key, values[key]);
            }else{
                createForm.register(key);
                createForm.setValue(key, values[key]);
            }
        })
        await createForm.trigger();
        const oldValidationErrors = createForm.formState.errors;

        if (Object.keys(oldValidationErrors).length !== 0 ) {
            setValidationErrors(formState.errors);
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
        // update table state
        queryClient.setQueryData(
            [`${schema}-${query}`],
            (prevRows: any) => (
                [
                    ...prevRows,
                    {
                        ...newTableVals,
                        id: (Math.random() + 1).toString(36).substring(7),
                    },
                ] as any[]),
        );
        // Update react hook form state
        for (let key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const newKey = key.replace("mrt-row-create", `${(queryClient.getQueryState([`${schema}-${query}`]).data as Array<any>).length - 1}`);
                setValue(newKey, values[key]);
            }
        }

        setIsCreatingUser(false);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleUpdateUser: MRT_TableOptions<any>['onEditingRowSave'] = async ({
                                                                                   values,
                                                                                   table
                                                                               }) => {
        const updatedRowIdx: number = parseInt(Object.keys(values).map(key => key.match(/\.(\d+)\./)?.[1])[0]);
        updateForm.reset();
        Object.keys(values).forEach((key) => {
            const columnId = key.slice(key.lastIndexOf(".") + 1);
            // check if columnId has validation fns Key here is ${schema}-${query}.${rowIdx}.${columnId}
            if(validationFns?.hasOwnProperty(columnId)){
                updateForm.register(key,{
                    validate: value => validationFns[columnId](value),
                });
                updateForm.setValue(key, values[key]);
            }else{
                updateForm.register(key);
                updateForm.setValue(key, values[key]);
            }
        })
        await updateForm.trigger();
        const oldValidationErrors = updateForm.formState.errors;

        if (Object.keys(oldValidationErrors).length !== 0 ) {
            setValidationErrors(formState.errors);
            return;
        }
        setValidationErrors({});
        // Update form state
        Object.keys(values).forEach((key, idx) => {
            setValue(key, values[key]);
        });
        // Update table state
        queryClient.setQueryData([`${schema}-${query}`], (prevRows: any) =>
            prevRows?.map((prevRow, prevRowIdx) => {
                if(prevRowIdx !== updatedRowIdx) {
                    return prevRow;
                }
                const newVal = Object.entries(values).reduce((acc, [key, value]) => {
                    const newKey = key.slice(key.lastIndexOf(".") + 1)
                    acc[newKey] = value;
                    return acc;
                }, {});
                return(
                    newVal
                );
            }),
        )
        await trigger();
        setIsUpdatingUser(false);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = async (row: MRT_Row<any>) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setIsDeletingUser(true);
            queryClient.setQueryData([`${schema}-${query}`], (prevUsers: any) =>
                prevUsers?.filter((_, rowIdx) => rowIdx !== row.index),
            );
            remove(row.index);
            setIsDeletingUser(false);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedUsers,
        filterFns: {
            textFilter: (row, id, filterValue, addMeta) => textFilter(row, id, filterValue, addMeta),
            isWithinRange: (row, id, filterValue, addMeta) => isWithinRange(row, id, filterValue),
        },
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        layoutMode: "semantic",
        enableGlobalFilter: false,
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
        muiFilterTextFieldProps:{
            FormHelperTextProps: {
                sx: {
                    display: "none",
                    visibility: "hidden"
                }
            }
        },
        muiCreateRowModalProps: {
            open: open,
            key: "createRowModal",
            PaperProps: {
                component: "form",
                id: "createRowForm",
                onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCreatingUser(true);
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
            key: "updateRowModal",
            PaperProps: {
                component: "form",
                id: "updateRowForm",
                onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsUpdatingUser(true);
                    const getTypeByName = (array, name) => array.find(obj => obj.name === name)?.type;
                    const formData: FormData & any = new FormData(e.currentTarget);
                    // Builds new row object, transforms string dates into date objects
                    const formJson = Array.from(formData.entries()).reduce((acc, [key, value]) => {
                        acc[key] = getTypeByName(metaData, key.match(/[^.]*$/)[0]) === "Date and Time" ? new Date(value) : value;
                        return acc;
                    }, {});
                    console.log("Valid values: ", formJson);
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
        onCreatingRowSave: handleCreateUser,
        onEditingRowSave: handleUpdateUser,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row }) => (
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
                        action={"create"}
                        modalForm={createForm}
                    />} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <Button
                        type={'submit'}
                        form={"createRowForm"}
                    >
                        submit
                    </Button>
                    <Button
                        id={"createCancelButton"}
                        type={'button'}
                        onClick={() => {
                            setOpen(false);
                            table.setCreatingRow(undefined);
                        }}
                    >
                        cancel
                    </Button>
                </DialogActions>
            </>
        ),
        //optionally customize modal content
        renderEditRowDialogContent: ({ table, row }) => (
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
                        action={"edit"}
                        modalForm={updateForm}
                    />}
                </DialogContent>
                <DialogActions>
                    <Button
                        type={'submit'}
                        form={"updateRowForm"}
                    >   submit
                    </Button>
                    <Button
                        id={"updateCancelButton"}
                        type={'button'}
                        onClick={() => {
                            setOpen(false);
                            table.setEditingRow(undefined);
                        }}
                    >   cancel
                    </Button>
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
                    table.setCreatingRow(true);
                }}
            >
                Create New Blood Draw
            </Button>
        ),
        renderCellActionMenuItems: ({ closeMenu, cell, row, table }) => [
            <MRT_ActionMenuItem
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
                key="contains"
                onClick={() => onSelectFilterMode('textFilter')}
            >
                Text
            </MenuItem>,
            <MenuItem
                key="datetime-range"
                onClick={() => onSelectFilterMode('isWithinRange')}
            >
                Date Time Range
            </MenuItem>
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

//READ hook (get users from api)
function useGetUsers(data: any, schema, query) {
    const {getValues} = useFormContext();
    return useQuery<any[]>({
        queryKey: [`${schema}-${query}`],
        queryFn: async () => {
            //send api request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve(getValues()[`${schema}-${query}`]);
        },
        refetchOnWindowFocus: false,
    });
}

//DELETE hook (delete user in api)
function useDeleteUser(schema, query) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rowId: number) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (rowId: number) => {
            queryClient.setQueryData([`${schema}-${query}`], (prevUsers: any) =>
                prevUsers?.filter((_, rowIdx) => rowIdx !== rowId),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

export const MUIEditableGridPanel = (props) => {
    console.log(props);
    const {defaultValues, redirectSchema, redirectQuery, metaData, componentProps, formControl} = props;
    const {columnHelper, validationFns} = componentProps;
    if(!metaData) return;
    if (!(redirectSchema && redirectQuery && defaultValues && `${redirectSchema}-${redirectQuery}` in defaultValues)) return;
    const data = defaultValues[`${redirectSchema}-${redirectQuery}`];
    data[0].date = data[0].date.toString();

    //Put this with your other react-query providers near root of your app
    return(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <QueryClientProvider client={queryClient}>
                <EditableGridPanel
                    data={data}
                    metaData={metaData}
                    columnHelper={columnHelper}
                    schema={redirectSchema}
                    query={redirectQuery}
                    formControl={formControl}
                    validationFns={validationFns}
                />
            </QueryClientProvider>
        </LocalizationProvider>

    );
};
