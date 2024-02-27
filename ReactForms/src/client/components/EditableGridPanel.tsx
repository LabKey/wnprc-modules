import * as React from 'react';
import { FC, useEffect, useState, useRef } from 'react';
import "../theme/css/index.css";
import "../wnprc_ehr.scss";
import { EditableGridCell } from './EditableGridCell';
import {EditableGridMenu} from './EditableGridMenu';
import { getQueryDetails } from '../query/helpers';
import { resizableGrid } from './EditableGridPanelResize';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Container'
import { useFieldArray } from 'react-hook-form';


interface EditableGridPanelProps {
    redirectSchema: string;
    redirectQuery: string;
    redirectView: string;
    componentProps: {
        prevTaskId: string;
        title: string;
        blacklist: string[];
    }
    formControl?: any;
    defaultValues?: any;
}

export const EditableGridPanel: FC<EditableGridPanelProps> = (props) => {
    const {
        componentProps,
        redirectSchema,
        redirectQuery,
        redirectView,
        formControl,
        defaultValues
    } = props;
    const {fields, append} = useFieldArray({
        control: formControl,
        name: `${redirectSchema}-${redirectQuery}`}
    );

    const {blacklist} = componentProps;

    const [columnDetails, setColumnDetails] = useState(undefined);
    const [columnWidth, setColumnWidth] = useState(undefined);
    const [isResizing, setIsResizing] = useState(false);
    const gridConfig = useRef([]);

    // resizing
    const els = (sel, par = document) => document.querySelectorAll(sel);
    const elNew = (tag, prop = {}) => Object.assign(document.createElement(tag), prop);

    const handleAddRow = () => {
        append(
            defaultValues[`${redirectSchema}-${redirectQuery}`][0],
            {focusName: `${redirectSchema}-${redirectQuery}.0.Id`}
        );
    };


    // pre load data fetch effect
    useEffect(() => {
        getQueryDetails(redirectSchema, redirectQuery).then((data: any) =>{

            if(redirectView) {//TODO use this view instead of default
                setColumnDetails(data.views.filter(item => !blacklist?.includes(item.name)));
            }
            else{
                setColumnDetails(data.defaultView.columns.filter(item => !blacklist?.includes(item.name)));
            }
        }).catch((data) => {
            console.log("Error");
        });
    }, []);

    // pre load data set effect
    useEffect(() => {
        if(!columnDetails) return;
        columnDetails.forEach((column) => {
            gridConfig.current.push({
                name: column.fieldKey,
                label: column.caption,
                type: column.fieldKey.toLowerCase().includes("date") ? "date" : column.inputType,
                required: column.required
            })
        })

        setColumnWidth(new Array(columnDetails.length).fill(1/columnDetails.length))
    }, [columnDetails]);

    // Resizing effect
    useEffect(() => {
        if(!columnWidth) return;
        els(".panes").forEach((elParent, idx) => {
            resizableGrid(elParent, idx, columnWidth, setColumnWidth, elNew, isResizing, setIsResizing);
        });
    }, [columnWidth]);


    useEffect(() => {
        //console.log("GC: ", gridConfig);
    },[gridConfig]);


    if(gridConfig.current.length === 0) {
        return(<div>Loading...</div>)
    }else {
        return (
            <>
                <EditableGridMenu onAddRow={handleAddRow}/>
                <div key={`editableGrid-0`}>
                    <div className={"grid-row header-row panes panes-h"}>
                        {columnDetails?.map((col, colIndex) => (
                            <div key={`header-${colIndex}`} className={`pane grid-cell grid-col-${colIndex} header-cell`}>
                                {col.caption}
                            </div>
                        ))}
                    </div>
                    <ul>
                        {fields?.map((row, rowIndex) => (
                            <li key={row.id} className={`grid-row-${rowIndex} panes panes-h`}>
                                {Object.keys(row).map((col, colIndex) => (
                                    <EditableGridCell
                                        key={`${redirectSchema}-${redirectQuery}-${rowIndex}-${colIndex}`}
                                        name={`${redirectSchema}-${redirectQuery}.${rowIndex}.${col}`}
                                        className={`pane`}
                                        inputField={gridConfig?.current[colIndex]}
                                        prevForm={null}
                                    />
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        );
    }
};
