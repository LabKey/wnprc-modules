import { LineItemModel, RequestOrderModel } from "../model";
import React, { FC, useCallback } from "react";
import { Col, Row } from 'react-bootstrap';
import { Draft, produce } from "immer";
import {
    ControlledSubstance,
    DescriptionInput,
    SubtotalInput,
    UnitInput,
    UnitPriceInput,
    UnitQuantityInput
} from "./LineItemsPanelInputs";

interface LineItemProps {
    model: LineItemModel;
    onInputChange: (model: LineItemModel) => void;
}

export const LineItemRow: FC<LineItemProps> = (props) => {

    const { model, onInputChange } = props;

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft[colName] = value;
        });
        onInputChange(updatedModel);
    },[]);

    return(
        <>
            <Row style={{marginTop:'20px', marginBottom:'15px', marginLeft:'15px', border:'solid 1px', borderColor:'#d3d3d3', marginRight:'30px', padding:'10px'}}>
                <Col>
                    <DescriptionInput value={model.item} onChange={onValueChange}></DescriptionInput>
                    <UnitInput value={model.itemUnit} onChange={onValueChange}></UnitInput>
                    <UnitPriceInput value={model.unitPrice} onChange={onValueChange}></UnitPriceInput>
                    <UnitQuantityInput value={model.quantity} onChange={onValueChange}></UnitQuantityInput>
                    <SubtotalInput unitPrice={model.unitPrice} quantity={model.quantity} onChange={onValueChange}></SubtotalInput>
                    <ControlledSubstance value={model.controlledSubstance} onChange={onValueChange}></ControlledSubstance>
                </Col>
            </Row>
        </>
    )
}