import React from 'react';
import {Col, Row} from 'react-bootstrap';

interface PurchasingFormInputProps
{
    label: string;
    required?: boolean;
    colSize?: number;
}

export class PurchasingFormInput extends React.PureComponent<PurchasingFormInputProps, any>
{
    render()
    {
        const {label, required, children} = this.props;

        return (
            <Row>
                <Col xs={12} md={7} className='request-order-form-row'>
                    <Col xs={4} lg={3}>
                        <label>{label}</label>
                        {required ? ' *' : ''}
                    </Col>
                    <Col xs={9} lg={8}>
                        {children}
                    </Col>
                </Col>
            </Row>
        );
    }
}

export class VendorFormInput extends React.PureComponent<PurchasingFormInputProps, any>
{
    render()
    {
        const {label, required, children} = this.props;

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
    }
}

