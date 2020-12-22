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

    const deleteRow = useCallback((index) => {
        const updatedLineItems = produce(lineItems, (draft: Draft<Array<LineItemModel>>) => {
            const x = index;
        });
        onChange(updatedLineItems);

    }, [lineItems, onChange]);

    const onButtonClick = () => {
        const updatedLineItems = produce(lineItems, (draft: Draft<Array<LineItemModel>>) => {
            draft.push(LineItemModel.create({rowIndex: lineItems.length}))
        });
        onChange(updatedLineItems);
    }

    return (
        <Panel
            className='domain-form-panel panel panel-default'
            expanded={true}
            onToggle={function () {
            }} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <Panel.Heading>Specify Items</Panel.Heading>
            <div>
                <Row style={{marginTop: '15px', marginBottom: '15px', marginLeft: '15px'}}>
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
                        return <LineItemRow key={"line-item-" + lineItem.rowIndex} model={lineItem}
                                            onInputChange={lineItemRowChange} onDelete={deleteRow}/>
                    })
                }
            </div>
            <div style={{height: '30px'}}>
               <span style={{marginLeft: '20px', marginBottom: '15px'}} id='add-line-item-row' title={'Add row'}
                     className="field-icon" onClick={onButtonClick}>
                    <FontAwesomeIcon icon={faPlusCircle} color={'green'}/>
                </span>
            </div>
        </Panel>
    );
}