import * as React from 'react'
import { FC } from 'react';
import { MRT_Row, MRT_TableInstance } from 'material-react-table';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import "../theme/css/editable-grid.css";
import { FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';
import { DateInput } from './DateInput';
import DropdownSearch from './DropdownSearch';
import InputLabel from './InputLabel';
import { getConfig } from '../query/helpers';

interface CreateModalProps {
    table: MRT_TableInstance<any>;
    row: MRT_Row<any>;
    schema: string;
    query: string;
    action: string;
    modalForm: any;
    wnprcMetaData: any;
    apiData: any
}
export const EditableGridCreateModal: FC<CreateModalProps> = (props) => {
    const {table,
        row,
        schema,
        query,
        action,
        modalForm,
        wnprcMetaData,
        apiData
    } = props;
    const {getValues, watch} = useFormContext();
    // decides to create new row or load previous row
    const initVals = action === "create" ? row.original : getValues(`${schema}-${query}.${row.id}`);
    return(
        <div className={"page-wrapper"}>
            {table.getAllColumns().map((column) => {
                if (column.id === "mrt-row-actions") return;
                const colMetaData = column.columnDef.meta as QueryColumn;
                const wnprcColMetaData = wnprcMetaData?.[colMetaData.name];
                const type = wnprcColMetaData?.type ? wnprcColMetaData.type
                    : colMetaData.type.includes("Date") ? "date"
                        : colMetaData.lookup ? "dropdown"
                            : colMetaData.inputType;
                if(type === "date") {
                    return(
                        <div className={'standard-input'} key={`${action}-${column.id}`}>
                            <DateInput
                                id={column.id}
                                defaultValue={row.id === 'mrt-row-create' ? new Date() : initVals[column.id]}
                                name={`${schema}-${query}.${(row.id)}.${colMetaData.name}`}
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
                }else if (type === "dropdown") {
                    const watchVar = wnprcColMetaData?.watchVar;
                    const watchState = watchVar && {
                        name: watchVar.substring(watchVar.lastIndexOf('.') + 1),
                        field: watch(watchVar as FieldPathValue<FieldValues, any>)
                    };

                    const optConf = wnprcColMetaData?.lookup ? getConfig(wnprcColMetaData.lookup,watchState)
                        : colMetaData.lookup ? getConfig(colMetaData.lookup,watchState)
                            : wnprcColMetaData.options;
                    return(
                        <div className={'dropdown-modal-container'} key={`${action}-${column.id}`}>
                            <label className={'dropdown-modal-label'}>
                                {column.id}
                            </label>
                            <DropdownSearch
                                optConf={optConf}
                                optDep={watchState}
                                name={`${schema}-${query}.${row.id}.${colMetaData.name}`}
                                defaultOpts={wnprcColMetaData?.defaultOpts}
                                id={column.id}
                                controlled={false}
                                classname={''}
                                initialValue={initVals[column.id]}
                                required={colMetaData.required}
                                isClearable={true}
                                newDefaults={apiData[colMetaData.name]}
                            />
                        </div>
                    );
                }
                return (
                    <div className={'standard-input'} key={column.id}>
                        <input
                            className={''}
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

