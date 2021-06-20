import React, {FC, memo, useCallback, useMemo} from 'react';
import { Panel, Col, Row } from 'react-bootstrap';
import produce, { Draft } from 'immer';

import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LineItemModel } from '../model';

import { LineItemRow } from './LineItemRow';
import { formatCurrency } from './Utils';

interface Props {
    lineItems: LineItemModel[];
    onChange: (lineItems: LineItemModel[], rowIdToDelete?: number) => void;
    errorMsg?: string;
    hasRequestId?: boolean;
    isAdmin: boolean;
    isRequester: boolean;
    isReceiver: boolean;
    isReorder?: boolean;
}

export const LineItemsPanel: FC<Props> = memo(props => {
    const { lineItems, onChange, errorMsg, hasRequestId, isAdmin, isRequester, isReceiver, isReorder } = props;

    const lineItemRowChange = useCallback(
        (lineItem, updatedRowIndex) => {
            const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
                draft[updatedRowIndex] = lineItem;
            });

            onChange(updatedLineItems);
        },
        [lineItems, onChange]
    );

    const onDeleteRow = useCallback(
        indexToDelete => {
            const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel[]>) => {
                draft.splice(indexToDelete, 1);
            });

            onChange(updatedLineItems, lineItems[indexToDelete].rowId);
        },
        [lineItems, onChange]
    );

    const onClickAddRow = useCallback(()=> {
        const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel[]>) => {
            draft.push(LineItemModel.create());
        });
        onChange(updatedLineItems);
    }, [lineItems]);

    const getTotal = useMemo(() => {
        return formatCurrency(
            lineItems.reduce(function (accumulatedVal, lineItem) {
                return lineItem.unitCost && lineItem.quantity
                    ? accumulatedVal + lineItem.unitCost * lineItem.quantity
                    : accumulatedVal;
            }, 0)
        )
    }, [lineItems]);

    return (
        <>
            <Panel
                className="panel panel-default"
                expanded={true}
                onToggle={function () {
                }} // this is added to suppress JS warning about providing an expanded prop without onToggle
            >
                <div className="bg-primary">
                    <Panel.Heading>
                        <div className="panel-title">
                            {(!hasRequestId && 'Specify Items') || (hasRequestId && 'Requested Items')}
                        </div>
                    </Panel.Heading>
                </div>
                <div>
                        <Row className="line-item-row-header">
                            <Col xs={4}>Part no./Item description *</Col>
                            <Col xs={1}>Controlled substance</Col>
                            <Col xs={1}>Unit *</Col>
                            { (isAdmin || isRequester) &&
                                <Col xs={1}>Unit Cost ($) *</Col>
                            }
                            <Col xs={1}>Quantity *</Col>
                            { (hasRequestId && !isReorder) &&
                                <Col xs={1}>Quantity received</Col>
                            }
                            { (isAdmin || isRequester) &&
                                <Col xs={1}>Subtotal ($)</Col>
                            }
                        </Row>
                </div>
                <div>
                    {lineItems.map((lineItem, idx) => {
                        return (
                            <LineItemRow
                                rowIndex={idx}
                                key={'line-item-' + idx}
                                model={lineItem}
                                onInputChange={lineItemRowChange}
                                onDelete={onDeleteRow}
                                isAdmin={isAdmin}
                                isRequester={isRequester}
                                isReceiver={isReceiver}
                                hasRequestId={hasRequestId}
                                isReorder={isReorder}
                            />
                        );
                    })}
                </div>
                <div>
                    { (isAdmin || isRequester) && (
                            <>
                                <div>
                                    <Row>
                                        <Col xs={6}></Col>
                                        {(hasRequestId && !isReorder) &&
                                            <Col xs={1}></Col>
                                        }
                                        <Col xs={1}></Col>
                                        <Col className="calc-total" xs={1}>
                                            Total ($):
                                        </Col>
                                        <Col className="calc-total-val" xs={1}>{getTotal}
                                        </Col>
                                    </Row>
                                </div>
                                {/* Allow adding line items for Admins or new requests for Requesters */}
                                {(isAdmin || (!hasRequestId && isRequester) || (hasRequestId && isRequester && isReorder)) && (
                                    <>
                                    <div className="add-item">
                                        <span id="add-line-item-row" title="Add item" className="add-item-icon"
                                              onClick={onClickAddRow}>
                                        <FontAwesomeIcon className="fa-faPlusCircle" icon={faPlusCircle} color="green"/> Add item
                                        </span>
                                    </div>
                                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                                    </>
                                )}
                            </>
                        )
                    }
                </div>
            </Panel>
        </>
    );
});
