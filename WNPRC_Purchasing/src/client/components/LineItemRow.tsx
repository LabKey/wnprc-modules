import React, { FC, memo, useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import produce, { Draft } from 'immer';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LineItemModel } from '../model';

import {
    ControlledSubstance,
    DescriptionInput,
    SubtotalInput,
    UnitInput,
    UnitCostInput,
    UnitQuantityInput,
    QuantityReceivedInput,
} from './LineItemsPanelInputs';

interface LineItemProps {
    model: LineItemModel;
    onInputChange: (model: LineItemModel, index: number) => void;
    onDelete: (rowIndex: number) => void;
    rowIndex: number;
    isAdmin: boolean;
    isRequester: boolean;
    isReceiver: boolean;
    hasRequestId?: boolean;
    isReorder?: boolean;
}

export const LineItemRow: FC<LineItemProps> = memo(props => {
    const { model, onInputChange, onDelete, rowIndex, isAdmin, isRequester, isReceiver, hasRequestId, isReorder } = props;

    const onValueChange = useCallback(
        (colName, value) => {
            const updatedModel = produce(model, (draft: Draft<LineItemModel>) => {
                draft[colName] = value === "" ? null : value;
                if (model.errors?.length > 0) {
                    draft['errors'] = model.errors.filter(field => field.fieldName !== colName);
                }
                if (draft['errors']?.length === 0) {
                    draft['errors'] = undefined;
                }
            });
            onInputChange(updatedModel, rowIndex);
        },
        [model, onInputChange]
    );

    const onDeleteRow = useCallback((): any => {
        onDelete(rowIndex);
    }, [onDelete, rowIndex]);

    return (
        <>
            {
                <Row className="line-item-row" key={'line-item-row-' + rowIndex}>
                    <Col xs={4}>
                        <DescriptionInput
                            value={model.item}
                            hasError={model.errors?.find(field => field.fieldName === 'item')}
                            onChange={onValueChange}
                            isReadOnly={hasRequestId && ((isRequester && !isReorder) || isReceiver)}
                        />
                    </Col>
                    <Col xs={1}>
                        <ControlledSubstance
                            value={model.controlledSubstance}
                            onChange={onValueChange}
                            isReadOnly={hasRequestId && ((isRequester && !isReorder) || isReceiver)}
                        />
                    </Col>
                    <Col xs={1}>
                        <UnitInput
                            value={model.itemUnit}
                            hasError={model.errors?.find(field => field.fieldName === 'itemUnit')}
                            onChange={onValueChange}
                            isReadOnly={hasRequestId && ((isRequester && !isReorder) || isReceiver)}
                        />
                    </Col>
                    { (isAdmin || isRequester) &&
                        <Col xs={1}>
                            <UnitCostInput
                                    value={model.unitCost}
                                    hasError={model.errors?.find(field => field.fieldName === 'unitCost')}
                                    onChange={onValueChange}
                                    isReadOnly={hasRequestId && isRequester && !isReorder}
                            />
                        </Col>
                    }
                    <Col xs={1}>
                        <UnitQuantityInput
                            value={model.quantity}
                            hasError={model.errors?.find(field => field.fieldName === 'quantity')}
                            onChange={onValueChange}
                            isReadOnly={hasRequestId && ((isRequester && !isReorder) || isReceiver)}
                        />
                    </Col>
                    { (hasRequestId && !isReorder) &&
                    <Col xs={1}>
                        <QuantityReceivedInput
                                value={model.quantityReceived}
                                hasError={model.errors?.find(field => field.fieldName === 'quantityReceived')}
                                onChange={onValueChange}
                                isReadOnly={hasRequestId && isRequester}
                        />
                    </Col>
                    }
                    { (isAdmin || isRequester) &&
                        <Col xs={1}>
                            <SubtotalInput unitCost={model.unitCost} quantity={model.quantity} />
                        </Col>
                    }

                    <Col xs={2}/>
                    <Col xs={1}/>
                    { (!hasRequestId || isReorder) &&
                        <Col xs={2}/>
                    }
                    {(isAdmin || (!hasRequestId && isRequester) || (hasRequestId && isRequester && isReorder)) &&
                        <Col xs={1}>
                                <span
                                        id={'delete-line-item-row-' + rowIndex}
                                        title="Delete item"
                                        className="delete-item-icon"
                                        onClick={onDeleteRow}
                                >
                                    <FontAwesomeIcon className="fa-faTimesCircle" icon={faTimesCircle}/>
                                </span>
                        </Col>
                    }
                </Row>
            }
        </>
    )
});
