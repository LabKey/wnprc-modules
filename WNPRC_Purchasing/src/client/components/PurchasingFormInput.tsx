import React, {FC, memo} from 'react';
import {Col, Row} from 'react-bootstrap';

interface PurchasingFormInputProps
{
    label: string;
    required?: boolean;
    colSize?: number;
}
export const PurchasingFormInput: FC<PurchasingFormInputProps> = memo((props) => {

    const {label, required, children} = props;

    return (
        <Row>
            <Col xs={11} md={9} className='request-order-form-row'>
                <Col sm={3} md={4}>
                    <label>{label}</label>
                </Col>
                <Col xs={9} lg={8}>
                    {children}
                </Col>
            </Col>
        </Row>
    );
})

export const VendorFormInput: FC<PurchasingFormInputProps> = memo((props) => {

    const {label, required, children} = props;

    return (
        <Row>
            <Col xs={12} className='request-order-form-row'>
                <Col xs={4}>
                    <label>{label}</label>
                    {required ? ' *' : ''}
                </Col>
                <Col xs={8}>
                    {children}
                </Col>
            </Col>
        </Row>
    );
})

