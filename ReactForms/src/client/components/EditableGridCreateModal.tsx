import * as React from 'react'
import { FC, useEffect, useState } from 'react';
import { Input, TextField } from '@mui/material';
import { MRT_Cell, MRT_Row, MRT_TableInstance } from 'material-react-table';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import { EditableGridCell } from './EditableGridCell';
import "../theme/css/editable-grid.css";
import TextInput from './TextInput';


interface CreateModalProps {
    table: MRT_TableInstance<any>;
    row: MRT_Row<any>;
    cell?: MRT_Cell<any>;
    schema: string;
    query: string;
}
export const EditableGridCreateModal: FC<CreateModalProps> = (props) => {
    const {table,
        row,
        schema,
        query,
        cell
    } = props;
    console.log("Table: ", table.getAllColumns());
    console.log("Table row: ", row);
    console.log("CELL##: ", cell);

    return(
        <div className={"page-wrapper"}>
        {table.getAllColumns().map((column) => {
            if (column.id === "mrt-row-actions") return;
            return (
                <div className={'standard-input'} key={column.id}>
                    <input
                        className={""}
                        key={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                        defaultValue={row.original[column.id]}
                        name={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                        type={(column.columnDef.meta as QueryColumn).type}
                        required={(column.columnDef.meta as QueryColumn).required}
                    />
                    <label>
                        {column.id}
                    </label>
                    <span className={'underline'}></span>
                </div>

        )
            ;
        })
        }.
        </div>
    );

    /*return(
        <div className={"page-wrapper"}>
            {table.getAllColumns().map((column) => {
                    if(column.id === "mrt-row-actions") return;
                console.log(`COLNAME: ${schema}-${query}.${table.getCenterRows().length}.${(column.columnDef.meta as QueryColumn).name}` );
                return(
                            <EditableGridCell
                                className={""}
                                prevForm={null}
                                type={(column.columnDef.meta as QueryColumn).type}
                                name={`${schema}-${query}.${(row.id)}.${(column.columnDef.meta as QueryColumn).name}`}
                                required={(column.columnDef.meta as QueryColumn).required}
                                id={`${(column.columnDef.meta as QueryColumn).name}`}
                            />
                    );
            })}
        </div>
    );*/
};

export const showEditableGridCreateModal = (isCreatingUser, table) => {
    isCreatingUser = true;
    console.log(isCreatingUser);

    return(
        <>
            {isCreatingUser && <div>Hello</div>}
        </>);
}

