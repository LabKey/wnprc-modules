import React from 'react';
import { Form, Panel } from 'react-bootstrap';
import {RequestOrderModel} from '../model';
import {PurchasingFormInput} from "./PurchasingFormInput";

interface Props {
    model: RequestOrderModel;
}

export class RequestOrderPanel extends React.PureComponent<Props> {

    constructor(props) {
        super(props);
    }

    onInputChange = evt => {
        const id = evt.target.id;
        let value = evt.target.value;
    };

    render() {

        const { model } = this.props;
        const title = "Request Order"

        return (
            <Panel
                className='domain-form-panel panel panel-default'
                expanded={true}
                onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
            >
                <Panel.Heading>{title}</Panel.Heading>
                <Form>
                    <AccountInput model={model} onChange={this.onInputChange}/>
                    <VendorInput model={model} onChange={this.onInputChange}/>
                    <BusinessPurposeInput model={model} onChange={this.onInputChange}/>
                    <SpecialInstructionInput model={model} onChange={this.onInputChange}/>
                    <ShippingDestinationInput model={model} onChange={this.onInputChange}/>
                    <DeliveryAttentionInput model={model} onChange={this.onInputChange}/>
                </Form>
            </Panel>
        );
    }
}

interface InputProps {
    model: RequestOrderModel;
    onChange: (evt) => void;
}

function AccountInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Account to charge"
                required={true}
            >

            {/*    TODO: change textarea to a lookup dropdown*/}
            <textarea
                style={{resize:'none', width: '400px', height: '30px'}}
                value={props.model.account || ''}
                onChange={props.onChange}
            />
            </PurchasingFormInput>
        </div>
    );
}

function VendorInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Vendor"
                required={true}
            >

                {/*    TODO: change textarea to a lookup dropdown*/}
                <textarea
                    style={{resize:'none', width: '400px', height: '30px'}}
                    value={props.model.vendor || ''}
                    onChange={props.onChange}
                />
            </PurchasingFormInput>
        </div>
    );
}

function BusinessPurposeInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Business Purpose"
                required={true}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '90px'}}
                    value={props.model.purpose || ''}
                    onChange={props.onChange}
                />
            </PurchasingFormInput>
        </div>
    );
}

function SpecialInstructionInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Special Instructions"
                required={false}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '90px'}}
                    value={props.model.comments || ''}
                    onChange={props.onChange}
                />
            </PurchasingFormInput>
        </div>
    );
}

function ShippingDestinationInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Shipping Destination"
                required={true}
            >

                {/*    TODO: change textarea to a lookup dropdown*/}
                <textarea
                    style={{resize:'none', width: '400px', height: '30px'}}
                    value={props.model.shippingDestination || ''}
                    onChange={props.onChange}
                />
            </PurchasingFormInput>
        </div>
    );
}

function DeliveryAttentionInput(props: InputProps) {
    return (
        <div>
            <PurchasingFormInput
                label="Delivery Attention To"
                required={false}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '30px'}}
                    value={props.model.deliveryAttentionTo || ''}
                    onChange={props.onChange}
                />
            </PurchasingFormInput>
        </div>
    );
}