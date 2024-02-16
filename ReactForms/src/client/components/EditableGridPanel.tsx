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


interface EditableGridPanelProps {
    redirectSchema: string;
    redirectQuery: string;
    redirectView: string;
    componentProps: {
        prevTaskId: string;
        title: string;
        blacklist: string[];
    }
}

export const EditableGridPanel: FC<EditableGridPanelProps> = (props) => {
    const {
        componentProps,
        redirectSchema,
        redirectQuery,
        redirectView,
    } = props;

    const {blacklist} = componentProps;
    const [gridData, setGridData] = useState<string[][]>(undefined);
    const [columnDetails, setColumnDetails] = useState(undefined);
    const [columnWidth, setColumnWidth] = useState(undefined);
    const [isResizing, setIsResizing] = useState(false);
    const gridConfig = useRef([]);

    // resizing
    const els = (sel, par = document) => document.querySelectorAll(sel);
    const elNew = (tag, prop = {}) => Object.assign(document.createElement(tag), prop);

    const handleCellChange = (rowIndex: number, colIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const newData = gridData.map((row, i) => {
            if (i === rowIndex) {
                return row.map((cell, j) => (j === colIndex ? value : cell));
            }
            return row;
        });
        setGridData(newData);
    };

    const handleAddRow = () => {
        setGridData([...gridData, Array(columnDetails?.length).fill('')]);
    };

    useEffect(() => {
    },[gridData]);

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
        console.log(columnDetails);
        columnDetails.forEach((column) => {
            gridConfig.current.push({
                name: column.fieldKey,
                label: column.caption,
                type: column.fieldKey.toLowerCase().includes("date") ? "date" : column.inputType,
                required: column.required
            })
        })
        console.log(gridConfig);

        setGridData(Array(1).fill(Array(columnDetails.length).fill('')));
        setColumnWidth(new Array(columnDetails.length).fill(1/columnDetails.length))
    }, [columnDetails]);

    // Resizing effect
    useEffect(() => {
        if(!columnWidth) return;
        els(".panes").forEach((elParent, idx) => {
            resizableGrid(elParent, idx, columnWidth, setColumnWidth, elNew, isResizing, setIsResizing);
        });
    }, [columnWidth]);

    if(gridConfig.current.length === 0) {
        return(<div>Loading...</div>)
    }else {
        return (
            <>
                <EditableGridMenu onAddRow={handleAddRow}/>
                <Container key={`editableGrid-0`}>
                    <Row key={`header-0`} >
                        <div className={"grid-row header-row panes panes-h"}>
                            {columnDetails?.map((col, colIndex) => (
                                <div key={`header-${colIndex}`} className={`pane grid-cell grid-col-${colIndex} header-cell`}>
                                    {col.caption}
                                </div>
                            ))}
                        </div>
                    </Row>
                    {gridData?.map((row, rowIndex) => (
                        <Row key={`row-${rowIndex}`}>
                            <div className={`grid-row-${rowIndex} panes panes-h`}>
                                {row.map((cell, colIndex) => (
                                    <EditableGridCell
                                        key={`cell-${rowIndex}-${colIndex}`}
                                        name={`EditableGridCell-${redirectSchema}-${redirectQuery}-${gridConfig.current[colIndex].name}-${rowIndex}-${colIndex}`}
                                        id={`EditableGridCell-${redirectSchema}-${redirectQuery}-${rowIndex}-${colIndex}`}
                                        className={`pane`}
                                        value={cell}
                                        inputField={gridConfig.current[colIndex]}
                                        prevForm={null}
                                    />
                                ))}
                            </div>
                        </Row>
                    ))}
                </Container>
            </>
        );
    }
};
