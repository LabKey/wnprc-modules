import {LineItemModel, RequestOrderModel} from "../model";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import { Panel, Col, Row, Button } from 'react-bootstrap';
import {Draft, produce} from "immer";
import {getDropdownOptions} from "../action";
import {createOptions} from "./Utils";

interface Props {
    lineItems: Array<LineItemModel>;
    onChange: (lineItems: Array<LineItemModel>) => void;
    rowIndex: number;
}

export const LineItemsPanel : FC<Props> = (props) => {

    const { lineItems, onChange, rowIndex } = props;

    const lineItemRowChange = useCallback((lineItem) => {

        const updatedLineItems = produce(lineItems, (draft: Draft<Props>) => {
            draft.lineItems[lineItem.rowIndex] = lineItem;
        });

        onChange(updatedLineItems);
    },[]);

    const onButtonClick = () => {
        const updatedLineItems = produce(lineItems, (draft: Draft<Array<LineItemModel>>) => {
            draft.push(LineItemModel.create({rowIndex: rowIndex}))
        });
        onChange(updatedLineItems);
    }

    return(
        <Panel
            className='domain-form-panel panel panel-default'
            expanded={true}
            onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <Panel.Heading>Specify Items</Panel.Heading>
            <div>
                <Row style={{marginTop:'15px', marginBottom:'15px', marginLeft:'15px'}}>
                    <Col xs={4}>Part no./Item description *</Col>
                    <Col xs={1}>Unit *</Col>
                    <Col lg={1}>Unit price *</Col>
                    <Col lg={1}>Quantity *</Col>
                    <Col lg={1}>Subtotal</Col>
                    <Col lg={2}>Controlled substance</Col>
                </Row>
            </div>
            <div>
                {
                    lineItems.map(lineItem => {
                        return <LineItemRow model={lineItem} onInputChange={lineItemRowChange}/>
                    })
                }
            </div>
            <div>
                <Button
                    size="sm"
                    style={{marginLeft:'15px', marginBottom:'15px'}}
                    onClick={onButtonClick}
                >
                    Add another item
                </Button>
            </div>
        </Panel>
    );
}

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
                    <UnitQuantityInput value={model.unitPrice} onChange={onValueChange}></UnitQuantityInput>
                    <SubtotalInput value={model.unitPrice} onChange={onValueChange}></SubtotalInput>
                    <ControlledSubstance value={model.controlledSubstance} onChange={onValueChange}></ControlledSubstance>
                </Col>
            </Row>
        </>
    )
}

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
}

const DescriptionInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('item', evt.target.value);
    },[]);

    return (
        <textarea
            style={{resize:'none', width: '575px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="item-description-id"
        />
    );
}

const UnitInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    //TODO: only want getDropdownOptions to be called once, and not at each Item Row rendering
    useEffect(() => {
        getDropdownOptions('ehr_purchasing', 'itemUnits', 'itemUnit').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'itemUnit', false), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('unit', evt.target.value);
    },[]);

    return (
        <select style={{resize: 'none', position:'absolute', marginLeft:'45px', width: '100px', height: '30px'}} value={value}
                onChange={onValueChange}>
            <option hidden value="">Select</option>
            {options}
        </select>
    );
}

const UnitPriceInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('unitPrice', evt.target.value);
    },[]);

    return (
        <textarea
            style={{resize: 'none', position:'absolute', marginLeft:'200px', width: '120px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="unit-price-id"
        />
    );
}

const UnitQuantityInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('quantity', evt.target.value);
    },[]);

    return (
        <textarea
            style={{resize: 'none', position:'absolute', marginLeft:'355px', width: '120px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="unit-quantity-id"
        />
    );
}

const SubtotalInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('subTotal', evt.target.value);
    },[]);

    return (
        <textarea
            style={{resize: 'none', position:'absolute', marginLeft:'510px', width: '120px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="item-subtotal-id"
        />
    );
}

const ControlledSubstance: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onInputChange = useCallback((evt) => {
        onChange('controlledSubstance', evt.target.value);
    },[]);

    return (
        <input
            style={{marginLeft: '725px', position:'absolute', marginTop:'10px'}}
            type="checkbox"
            checked={value}
            onChange={onInputChange}
            id="control-substance-id"
        />
    );
}