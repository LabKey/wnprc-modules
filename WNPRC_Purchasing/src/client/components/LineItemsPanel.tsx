import {LineItemModel} from "../model";
import React, {FC, useCallback} from "react";
import {Panel, Col, Row} from 'react-bootstrap';
import {Draft, produce} from "immer";
import {LineItemRow} from "./LineItemRow";
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

interface Props
{
    lineItems: Array<LineItemModel>;
    onChange: (lineItems: Array<LineItemModel>) => void;
}

export const LineItemsPanel: FC<Props> = (props) => {

    const {lineItems, onChange} = props;

    const lineItemRowChange = useCallback((lineItem) => {

        const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
            draft[lineItem.rowIndex] = lineItem;
        });

        onChange(updatedLineItems);
    }, [lineItems, onChange]);

    const onDeleteRow = useCallback((indexToDelete) => {

        const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
            delete draft[indexToDelete];
        });
        onChange(updatedLineItems);

    }, [lineItems, onChange]);

    const onClickAddRow = () => {
        const updatedLineItems = produce(lineItems, (draft: Draft<Array<LineItemModel>>) => {
            draft.push(LineItemModel.create({rowIndex: lineItems.length}))
        });
        onChange(updatedLineItems);
    }

    return (
        <Panel
            className='panel panel-default'
            expanded={true}
            onToggle={function () {
            }} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <Panel.Heading>Specify Items</Panel.Heading>
            <div>
                <Row className="line-item-row-header">
                    <Col xs={4}>Part no./Item description *</Col>
                    <Col xs={1}>Unit *</Col>
                    <Col xs={1}>Unit price *</Col>
                    <Col xs={1}>Quantity *</Col>
                    <Col xs={1}>Subtotal</Col>
                    <Col xs={2}>Controlled substance</Col>
                </Row>
            </div>
            <div>
                {
                    lineItems.map((lineItem, idx) => {
                        return <LineItemRow rowIndex={idx} key={"line-item-" + idx} model={lineItem}
                                            onInputChange={lineItemRowChange} onDelete={onDeleteRow}/>
                    })
                }
            </div>
            <div>
                <Row>
                    <Col xs={4}></Col>
                    <Col xs={1}></Col>
                    <Col xs={1}></Col>
                    <Col className='calc-total' xs={1}>Total:</Col>
                    <Col className='calc-total-val' xs={1}>
                        {
                            lineItems.reduce( function(accumulatedVal,lineItem){
                                return (lineItem.unitPrice && lineItem.quantity) ? (accumulatedVal + (lineItem.unitPrice * lineItem.quantity)) : accumulatedVal }, 0)
                        }
                    </Col>
                    <Col xs={1}></Col>
                </Row>
            </div>
            <div className="add-item">
               <span id='add-line-item-row' title={'Add item'}
                     className="add-item-icon" onClick={onClickAddRow}>
                    <FontAwesomeIcon className='fa-faPlusCircle' icon={faPlusCircle} color={'green'}/> Add item
                </span>
            </div>
        </Panel>
    );
}