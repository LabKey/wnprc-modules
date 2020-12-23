import {LineItemModel} from "../model";
import React, {FC, useCallback} from "react";
import {Col, Row} from 'react-bootstrap';
import {Draft, produce} from "immer";
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {
    ControlledSubstance,
    DescriptionInput,
    SubtotalInput,
    UnitInput,
    UnitPriceInput,
    UnitQuantityInput
} from "./LineItemsPanelInputs";

interface LineItemProps
{
    model: LineItemModel;
    onInputChange: (model: LineItemModel) => void;
    onDelete: (rowIndex: number) => void;
    rowIndex: number;
}

export const LineItemRow: FC<LineItemProps> = (props) => {

    const {model, onInputChange, onDelete, rowIndex} = props;

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<LineItemModel>) => {
            draft[colName] = value;
        });
        onInputChange(updatedModel);
    }, [model, onInputChange]);

    const onDeleteRow = useCallback((): any => {
        onDelete(rowIndex);
    }, [onDelete, rowIndex]);

    return (
        <>
            <Row className='line-item-row' key={'line-item-row-' + rowIndex}>
                <Col xs={4}><DescriptionInput value={model.item} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitInput value={model.itemUnit} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitPriceInput value={model.unitPrice} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitQuantityInput value={model.quantity} onChange={onValueChange}/></Col>
                <Col xs={1}><SubtotalInput unitPrice={model.unitPrice} quantity={model.quantity} onChange={onValueChange}/></Col>
                <Col xs={2}><ControlledSubstance value={model.controlledSubstance} onChange={onValueChange}/></Col>
                <Col xs={2}>
                    <span
                      id={'delete-line-item-row-' + rowIndex} title={'Delete item'} className="delete-item-icon"
                      onClick={onDeleteRow}
                    >
                        <FontAwesomeIcon className='fa-faTimesCircle' icon={faTimesCircle} color={'gray'}/>
                    </span>
                </Col>
            </Row>
        </>
    )
}