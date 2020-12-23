import {LineItemModel} from "../model";
import React, {FC, useCallback, useMemo} from "react";
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
    onDelete: (index: number) => void;
}

export const LineItemRow: FC<LineItemProps> = (props) => {

    const {model, onInputChange, onDelete} = props;

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<LineItemModel>) => {
            draft[colName] = value;
        });
        onInputChange(updatedModel);
    }, [model, onInputChange]);

    const onDeleteRow = useMemo((): any => {
        onDelete(model.rowIndex);
    }, [onDelete]);

    return (
        <>
            <Row key={'line-item-row-' + model.rowIndex} style={{
                marginTop: '20px',
                marginBottom: '15px',
                marginLeft: '15px',
                border: 'solid 1px',
                borderColor: '#d3d3d3',
                marginRight: '15px',
                padding: '10px'
            }}>
                <Col xs={4}><DescriptionInput value={model.item} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitInput value={model.itemUnit} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitPriceInput value={model.unitPrice} onChange={onValueChange}/></Col>
                <Col xs={1}><UnitQuantityInput value={model.quantity} onChange={onValueChange}/></Col>
                <Col xs={1}><SubtotalInput unitPrice={model.unitPrice} quantity={model.quantity} onChange={onValueChange}/></Col>
                <Col xs={2}><ControlledSubstance value={model.controlledSubstance} onChange={onValueChange}/></Col>
                <Col xs={2}>
                    <span
                        style={{marginLeft:'100%'}}
                      id={'delete-line-item-row-' + model.rowIndex} title={'Delete row'} className="field-icon"
                      onClick={onDeleteRow}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} color={'gray'}/>
                    </span>
                </Col>
            </Row>
        </>
    )
}