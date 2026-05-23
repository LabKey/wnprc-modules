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
import React, { FC, memo } from 'react';
import { Col, Row } from 'react-bootstrap';

interface PurchasingFormInputProps {
    label: string;
    required?: boolean;
    colSize?: number;
    children?: React.ReactNode;
}
export const PurchasingFormInput: FC<PurchasingFormInputProps> = memo(props => {
    const { label, children } = props;

    return (
        <Row>
            <Col xs={11} md={9} className="request-form-row">
                <Col xs={4} md={4}>
                    <label>{label}</label>
                </Col>
                <Col xs={10} md={8}>
                    {children}
                </Col>
            </Col>
        </Row>
    );
});

export const VendorFormInput: FC<PurchasingFormInputProps> = memo(props => {
    const { label, required, children } = props;

    return (
        <Row>
            <Col xs={12} className="request-order-form-row">
                <Col xs={4}>
                    <label>{label}</label>
                    {required ? ' *' : ''}
                </Col>
                <Col xs={8}>{children}</Col>
            </Col>
        </Row>
    );
});
