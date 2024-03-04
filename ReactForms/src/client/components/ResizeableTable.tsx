import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
    MRT_EditActionButtons,
    MaterialReactTable,
    // createRow,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_TableOptions,
    useMaterialReactTable, MRT_ActionMenuItem,
} from 'material-react-table';
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
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

interface ResizeableTableProps {
    data: any;
    metaData: QueryColumn[];
    columnHelper: any;
    schema: string;
    query: string;
}

const ResizeableTable = (props: ResizeableTableProps) => {
    const {data, metaData, columnHelper, schema, query} = props;
    const columnNames = Object.keys(data[0]).reduce((result, key) => {
        result[key] = key.charAt(0).toUpperCase() + key.slice(1); // convert the key to titlecase
        return result;
    }, {} as const);
    const [validationErrors, setValidationErrors] = useState<
        any
    >({});
    console.log("D: ", columnNames);
    console.log("CH: ", columnHelper);
    console.log("MEta: ", metaData);

    const columns = useMemo(() => metaData.map((col, colIdx) => (
        columnHelper.accessor(`${schema}-${query}.${col.name}`, {
            header: `${col.name}`,
            id: `${col.name}`,
            meta: {...metaData[colIdx]},
            Cell: ({cell}) => (
                <EditableGridCell className={""} type={(cell.column.columnDef.meta as QueryColumn).type} prevForm={null}
                                  name={`${schema}-${query}.${cell.row.id}.${col.name}`} required={metaData[colIdx].required}/>
            )
        }))
    ), [metaData]);

    /*
    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () =>
            data.length
                ? Object.keys(data[0]).map((columnId, idx) => ({
                    header: columnNames[columnId as keyof User] ?? columnId,
                    accessorKey: columnId,
                    id: columnId,
                    meta: {...metaData[idx]},
                    Cell: ({cell}) => (
                        (cell.column.columnDef.meta as QueryColumn).type === "Date and Time"
                            ? <ControlledDateInput name={columnId} id={columnId}/>
                            : <div>{cell.getValue() as any}</div>
                    )
                }))
                : [],
        [data],
    );*/
    console.log("COLUMNS: ", columns);
    /*
    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.lastName,
                    helperText: validationErrors?.lastName,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'email',
                header: 'Email',
                muiEditTextFieldProps: {
                    type: 'email',
                    required: true,
                    error: !!validationErrors?.email,
                    helperText: validationErrors?.email,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
            },
            {
                accessorKey: 'state',
                header: 'State',
                editVariant: 'select',
                editSelectOptions: usStates,
                muiEditTextFieldProps: {
                    select: true,
                    error: !!validationErrors?.state,
                    helperText: validationErrors?.state,
                },
            },
        ],
        [validationErrors],
    );*/

    //call CREATE hook
    const { mutateAsync: createUser, isPending: isCreatingUser } =
        useCreateUser();
    //call READ hook
    const {
        data: fetchedUsers = [],
        isError: isLoadingUsersError,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
    } = useGetUsers(data);
    //call UPDATE hook
    const { mutateAsync: updateUser, isPending: isUpdatingUser } =
        useUpdateUser();
    //call DELETE hook
    const { mutateAsync: deleteUser, isPending: isDeletingUser } =
        useDeleteUser();

    //CREATE action
    const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
                                                                                     values,
                                                                                     table,
                                                                                 }) => {
        console.log("VALS: ", values);
        const newValidationErrors = validateUser(values, metaData);
        if (newValidationErrors.filter(bool => !bool).length !== 0) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await createUser(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
                                                                                  values,
                                                                                  table,
                                                                              }) => {
        const newValidationErrors = validateUser(values, metaData);
        if (newValidationErrors.filter(bool => !bool).length !== 0) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await updateUser(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<User>) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(row.original.key);
        }
    };
    const table = useMaterialReactTable({
        columns,
        data: fetchedUsers,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        layoutMode: "semantic",
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
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateUser,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveUser,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Create New Blood Draw</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
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
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Edit">
                    <IconButton onClick={() => table.setEditingRow(row)}>
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                variant="contained"
                onClick={() => {
                    console.log(table);
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
        state: {
            isLoading: isLoadingUsers,
            isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
            showAlertBanner: isLoadingUsersError,
            showProgressBars: isFetchingUsers,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: User) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newUserInfo: User) => {
            queryClient.setQueryData(
                ['users'],
                (prevUsers: any) =>
                    [
                        ...prevUsers,
                        {
                            ...newUserInfo,
                            id: (Math.random() + 1).toString(36).substring(7),
                        },
                    ] as User[],
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

//READ hook (get users from api)
function useGetUsers(data: any) {
    return useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            //send api request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve(data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put user in api)
function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: User) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newUserInfo: User) => {
            queryClient.setQueryData(['users'], (prevUsers: any) =>
                prevUsers?.map((prevUser: User) =>
                    prevUser.key === newUserInfo.key ? newUserInfo : prevUser,
                ),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (userId: string) => {
            queryClient.setQueryData(['users'], (prevUsers: any) =>
                prevUsers?.filter((user: User) => user.key !== userId),
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

function validateUser(values: User, metaData: any) {
    console.log("USER: ", values);

    return(Object.keys(values).map(key => {


        return true;
    }))
}


const queryClient = new QueryClient();

export const MUIEditableGridPanel = (props) => {
    console.log(props);
    const {defaultValues, redirectSchema, redirectQuery, metaData, componentProps} = props;
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
                />
            </QueryClientProvider>
        </LocalizationProvider>

    );
};
