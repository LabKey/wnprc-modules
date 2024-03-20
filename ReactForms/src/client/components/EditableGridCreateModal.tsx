import * as React from 'react'
import { FC, useEffect, } from 'react';
import { MRT_Cell, MRT_Row, MRT_TableInstance } from 'material-react-table';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import "../theme/css/editable-grid.css";
import { useFormContext } from 'react-hook-form';
import { DateInput } from './DateInput';

interface CreateModalProps {
    table: MRT_TableInstance<any>;
    row: MRT_Row<any>;
    cell?: MRT_Cell<any>;
    schema: string;
    query: string;
    action: string;
    modalForm: any;
}
export const EditableGridCreateModal: FC<CreateModalProps> = (props) => {
    const {table,
        row,
        schema,
        query,
        action,
        modalForm
    } = props;
    const {getValues} = useFormContext();
    console.log("ACT: ", action);
    const initVals = action === "create" ? row.original : getValues(`${schema}-${query}.${row.id}`);
    useEffect(() => {
        console.log("Modal Errors: ", modalForm.errors);
    }, [modalForm.errors]);
    return(
        <div className={"page-wrapper"}>
            {table.getAllColumns().map((column) => {
                if (column.id === "mrt-row-actions") return;
                if((column.columnDef.meta as QueryColumn).type === "Date and Time") {
                    return(
                        <div className={'standard-input'} key={`${action}-${column.id}`}>
                            <DateInput
                                id={column.id}
                                defaultValue={row.id === 'mrt-row-create' ? new Date() : initVals[column.id]}
                                name={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                            />
                            <label className={'date-modal-label'}>
                                {column.id}
                            </label>
                            <span className={'underline'}></span>
                            <div className={'react-error-text'}>
                                {(modalForm.formState?.errors?.[`${schema}-${query}`]?.[row.id]?.[column.id]?.message)}
                            </div>
                        </div>
                    )
                }
                return (
                    <div className={'standard-input'} key={column.id}>
                        <input
                            className={""}
                            key={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                            defaultValue={initVals[column.id]}
                            name={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                            type={(column.columnDef.meta as QueryColumn).type}
                            required={(column.columnDef.meta as QueryColumn).required}
                            style={(modalForm.formState?.errors?.[`${schema}-${query}`]?.[row.id]?.[column.id]) ? {borderColor: "red"} : undefined}
                        />
                        <label>
                            {column.id}
                        </label>
                        <span className={'underline'}></span>
                        <div className={"react-error-text"}>
                            {(modalForm.formState?.errors?.[`${schema}-${query}`]?.[row.id]?.[column.id]?.message)}
                        </div>
                    </div>
                );
            })
            }
        </div>
    );
};

