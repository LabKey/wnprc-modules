import React, {FC, memo, useCallback, useEffect, useState} from 'react';
import { Form, Panel, Row, Col } from 'react-bootstrap';

import produce, { Draft } from 'immer';

import { RequestOrderModel, VendorModel } from '../model';

import {
    AccountInput,
    AccountOtherInput,
    VendorInput,
    BusinessPurposeInput,
    SpecialInstructionInput,
    ShippingDestinationInput,
    DeliveryAttentionInput,
} from './RequestOrderPanelInputs';

interface Props {
    model: RequestOrderModel;
    onInputChange: (model: RequestOrderModel) => void;
    isAdmin: boolean;
    isRequester: boolean;
    isReceiver: boolean;
    hasRequestId?: boolean;
    isReorder?: boolean;
}

export const RequestOrderPanel: FC<Props> = memo(props => {
    const { model, onInputChange, isAdmin, isRequester, isReceiver, hasRequestId, isReorder } = props;

    const [showOtherAcct, setShowOtherAcct] = useState<boolean>(false);

    const onModelChange = useCallback(
        (changedModel: RequestOrderModel) => {
            onInputChange(changedModel);
        },
        [model]
    );

    const onValueChange = useCallback(
        (colName, value) => {
            const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
                draft[colName] = value;
                if (model.errors?.length > 0) {
                    const updatedErrors = model.errors.filter(field => field.fieldName !== colName);
                    draft['errors'] = updatedErrors;
                }
                if (draft['errors']?.length === 0) {
                    draft['errorMsg'] = undefined;
                }
                // if 'Other' was selected before, during which user added a New vendor from the popup, and then user decided to select a different vendor - then do cleanup on newVendor obj
                if (colName === 'vendorName' && value !== 'Other') {
                    draft['newVendor'] = VendorModel.create();
                }
            });
            if (updatedModel.account === 'Other') {
                setShowOtherAcct(true);
            } else {
                setShowOtherAcct(false);
            }

            onInputChange(updatedModel);
        },
        [model, onInputChange]
    );

    return (
        <>
            {/* Read only - for the Requesters and Receivers */}
            { (hasRequestId && (isReceiver || (!isReorder && isRequester))) && (
                <Panel
                    className="panel panel-default"
                    expanded={true}
                    onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
                >
                    <div className="bg-primary">
                        <Panel.Heading>
                            <div className="panel-title">Request Info</div>
                        </Panel.Heading>
                    </div>
                    <Form className="form-margin">
                        <Row>
                            { isRequester && (
                                <Col xs={11} lg={6}>
                                    <AccountInput
                                        value={model.account}
                                        isReadOnly={true}
                                    />
                                    {(showOtherAcct || model.account === 'Other') && (
                                        <AccountOtherInput
                                            value={model.otherAcctAndInves}
                                            isReadOnly={true}
                                        />
                                    )}
                                </Col>
                            )}
                            <Col xs={11} lg={6}>
                                <ShippingDestinationInput
                                    value={model.shippingInfoId}
                                    isReadOnly={true}
                                />
                            </Col>
                            <Col xs={11} lg={6}>
                                <VendorInput
                                    model={model}
                                    isReadOnly={true}
                                />
                            </Col>
                            <Col xs={11} lg={6}>
                                <DeliveryAttentionInput
                                    value={model.shippingAttentionTo}
                                    isReadOnly={true}
                                />
                            </Col>
                            { isRequester && (
                                <Col xs={11} lg={6}>
                                    <BusinessPurposeInput
                                        value={model.justification}
                                        isReadOnly={true}
                                    />
                                </Col>
                            )}
                            <Col xs={11} lg={6}>
                                <SpecialInstructionInput
                                    value={model.comments}
                                    isReadOnly={true}
                                />
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            )
            }

            {/* For the Admins for new and old requests; and for the Requesters for new requests */}
            { (isAdmin || (!hasRequestId && isRequester) || (hasRequestId && isReorder && isRequester)) && (
                <Panel
                    className="panel panel-default"
                    expanded={true}
                    onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
                >
                    <div className="bg-primary">
                        <Panel.Heading>
                            <div className="panel-title">Request Info</div>
                        </Panel.Heading>
                    </div>
                    <Form className="form-margin">
                        <Row>
                            <Col xs={11} lg={6}>
                                <AccountInput
                                    value={model.account}
                                    hasError={model.errors?.find(field => field.fieldName === 'account')}
                                    onChange={onValueChange}
                                />
                                {(showOtherAcct || model.account === 'Other') && (
                                    <AccountOtherInput
                                        value={model.otherAcctAndInves}
                                        hasError={model.errors?.find(field => field.fieldName === 'otherAcctAndInves')}
                                        hasOtherAcctWarning={!!model.otherAcctAndInvesWarning}
                                        onChange={onValueChange}
                                    />
                                )}
                            </Col>
                            <Col xs={11} lg={6}>
                                <ShippingDestinationInput
                                    value={model.shippingInfoId}
                                    hasError={model.errors?.find(field => field.fieldName === 'shippingInfoId')}
                                    onChange={onValueChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={11} lg={6}>
                                <VendorInput
                                    hasError={model.errors?.find(field => field.fieldName === 'vendorId')}
                                    onChange={onValueChange}
                                    model={model}
                                    onModelChange={onModelChange}
                                />
                            </Col>
                            <Col xs={11} lg={6}>
                                <DeliveryAttentionInput
                                    value={model.shippingAttentionTo}
                                    hasError={model.errors?.find(field => field.fieldName === 'shippingAttentionTo')}
                                    onChange={onValueChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={11} lg={6}>
                                <BusinessPurposeInput
                                    value={model.justification}
                                    hasError={model.errors?.find(field => field.fieldName === 'justification')}
                                    onChange={onValueChange}
                                />
                            </Col>
                            <Col xs={11} lg={6}>
                                <SpecialInstructionInput value={model.comments} onChange={onValueChange} />
                            </Col>
                        </Row>
                    </Form>
                    {model.errorMsg && <div className="alert alert-danger">{model.errorMsg}</div>}
                </Panel>
            )
            }
        </>
    );
});