import React, {FC, useCallback, useState} from 'react';
import {Form, Panel} from 'react-bootstrap';
import {RequestOrderModel} from '../model';
import {Draft, produce} from 'immer';
import {
    AccountInput, AccountOtherInput, VendorInput, BusinessPurposeInput,
    SpecialInstructionInput, ShippingDestinationInput, DeliveryAttentionInput
} from "./RequestOrderPanelInputs";

interface Props
{
    model: RequestOrderModel;
    onInputChange: (model: RequestOrderModel) => void;
}

export const RequestOrderPanel: FC<Props> = (props) => {

    const {model, onInputChange} = props;

    const [showOtherAcct, setShowOtherAcct] = useState<boolean>(false);

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft[colName] = value;
        });
        if (updatedModel.account === 'Other')
        {
            setShowOtherAcct(true);
        }
        else
        {
            setShowOtherAcct(false);
        }
        onInputChange(updatedModel);
    }, [model, onInputChange]);

    return (
        <Panel
            className='panel panel-default'
            expanded={true}
            onToggle={function () {
            }} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <Panel.Heading>Request Order</Panel.Heading>
            <Form>
                <AccountInput value={model.account} onChange={onValueChange}/>
                {
                    (showOtherAcct || model.account === "Other") &&
                    <AccountOtherInput value={model.accountOther} onChange={onValueChange}/>
                }
                <VendorInput value={model.vendorName} onChange={onValueChange}/>
                {/*{*/}
                {/*    model.vendorName === "Other" &&*/}
                {/*    <VendorPopupModal></VendorPopupModal>*/}
                {/*}*/}
                <BusinessPurposeInput value={model.purpose} onChange={onValueChange}/>
                <SpecialInstructionInput value={model.comments} onChange={onValueChange}/>
                <ShippingDestinationInput value={model.shippingDestination} onChange={onValueChange}/>
                <DeliveryAttentionInput value={model.deliveryAttentionTo} onChange={onValueChange}/>
            </Form>
        </Panel>
    );
}