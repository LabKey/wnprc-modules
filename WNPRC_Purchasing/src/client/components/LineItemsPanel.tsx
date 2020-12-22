import { LineItemModel } from "../model";
import React, { FC, useCallback } from "react";
import { Panel, Col, Row, Button } from 'react-bootstrap';
import { Draft, produce } from "immer";
import { LineItemRow } from "./LineItemRow";

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