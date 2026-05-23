/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { FC, memo, useCallback, useState } from 'react';
import { Form, Panel, Row, Col } from 'react-bootstrap';

import { produce, Draft } from 'immer';

import { PurchaseAdminModel } from '../model';

import {
    AssignedToInput,
    PaymentOptionInput,
    ConfirmationInput,
    InvoiceInput,
    ProgramInput,
    StatusInput,
    OrderDateInput,
    CardPostDateInput,
    RejectReasonInput,
} from './PurchaseAdminPanelInputs';

interface Props {
    model: PurchaseAdminModel;
    onInputChange: (model: PurchaseAdminModel) => void;
    requestRejected?: boolean;
}

export const PurchaseAdminPanel: FC<Props> = memo(props => {
    const { model, onInputChange, requestRejected } = props;

    const onValueChange = useCallback(
        (colName, value) => {
            const updatedModel = produce(model, (draft: Draft<PurchaseAdminModel>) => {
                draft[colName] = value;
            });
            onInputChange(updatedModel);
        },
        [model, onInputChange]
    );

    return (
        <Panel
            className={'panel panel-default domain-form-panel'}
            expanded={true}
            onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <div className="bg-primary">
                <Panel.Heading>
                    <div className="panel-title">Purchasing Details (for internal use)</div>
                </Panel.Heading>
            </div>
            <Form className="form-margin">
                <Row>
                    <Col xs={11} lg={6}>
                        <AssignedToInput value={model.assignedTo} onChange={onValueChange} />
                    </Col>
                    <Col xs={11} lg={6}>
                        <ProgramInput value={model.program} onChange={onValueChange} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <PaymentOptionInput value={model.paymentOption} onChange={onValueChange} />
                    </Col>
                    <Col xs={11} lg={6}>
                        <ConfirmationInput value={model.confirmationNum} onChange={onValueChange} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <StatusInput value={model.qcState} onChange={onValueChange} />
                        {requestRejected && (
                            <RejectReasonInput value={model.rejectReason} onChange={onValueChange} />
                        )}
                    </Col>
                    <Col xs={11} lg={6}>
                        <InvoiceInput value={model.invoiceNum} onChange={onValueChange} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <OrderDateInput value={model.orderDate} onChange={onValueChange} />
                    </Col>
                    <Col xs={11} lg={6}>
                        <CardPostDateInput value={model.cardPostDate} onChange={onValueChange} />
                    </Col>
                </Row>
            </Form>
            {model.errorMsg && <div className="alert alert-danger">{model.errorMsg}</div>}
        </Panel>
    );
});
