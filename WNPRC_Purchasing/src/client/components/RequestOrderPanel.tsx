import React, {FC, useCallback, useState} from 'react';
import {Form, Panel} from 'react-bootstrap';
import {RequestOrderModel, VendorModel} from '../model';
import {Draft, produce} from 'immer';
import {
    AccountInput, AccountOtherInput, VendorInput, BusinessPurposeInput,
    SpecialInstructionInput, ShippingDestinationInput, DeliveryAttentionInput, NewVendorDisplay
} from "./RequestOrderPanelInputs";
import {VendorPopupModal} from "./VendorInputModal";

interface Props
{
    model: RequestOrderModel;
    onInputChange: (model: RequestOrderModel) => void;
    errorMsg?: string
}

export const RequestOrderPanel: FC<Props> = (props) => {

    const {model, onInputChange, errorMsg} = props;

    const [showOtherAcct, setShowOtherAcct] = useState<boolean>(false);

    const onVendorAdd = useCallback((newVendor : VendorModel) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft['newVendor'] = newVendor;
        })
        onInputChange(updatedModel);
    }, [model]);

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft[colName] = value;
            if (model.errors && model.errors.length > 0) {
                let updatedErrors = model.errors.filter((field) => field.fieldName !== colName);
                draft['errors'] = updatedErrors;
            }
            if (draft['errors'] && draft['errors'].length === 0) {
                draft['errorMsg'] = undefined;
            }
            // if 'Other' was selected before, during which user added a New vendor from the popup, and then user decided to select a different vendor - then do cleanup on newVendor obj
            if (colName === 'vendorName' && value !== 'Other') {
                draft['newVendor'] = VendorModel.create({});
            }
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
            <div className='bg-primary'>
            <Panel.Heading>
                <div className='panel-title'>Request Order</div>
            </Panel.Heading>
            </div>
            <Form>
                <AccountInput
                    value={model.account}
                    hasError={model.errors && model.errors.find((field) => field.fieldName === 'account')}
                    onChange={onValueChange}
                />
                {
                    (showOtherAcct || model.account === "Other") &&
                    <AccountOtherInput
                            value={model.accountOther}
                            hasError={model.errors && model.errors.find((field) => field.fieldName === 'accountOther')}
                            onChange={onValueChange}
                    />
                }
                <VendorInput
                    value={model.vendorName}
                    hasError={model.errors && model.errors.find((field) => field.fieldName === 'vendorName')}
                    onChange={onValueChange}
                />
                {
                    model.vendorName === "Other" &&
                    <>
                        <VendorPopupModal showPopup={true} vendorModel={model.newVendor} onVendorChange={onVendorAdd}/>
                        {
                            model.newVendor && VendorModel.getDisplayVersion(model.newVendor).length > 0 &&
                                <NewVendorDisplay vendorModel={model.newVendor} onVendorChange={onVendorAdd} />
                        }
                    </>
                }
                <BusinessPurposeInput
                    value={model.purpose}
                    hasError={model.errors && model.errors.find((field) => field.fieldName === 'purpose')}
                    onChange={onValueChange}
                />
                <SpecialInstructionInput
                    value={model.comments}
                    onChange={onValueChange}
                />
                <ShippingDestinationInput
                    value={model.shippingDestination}
                    hasError={model.errors && model.errors.find((field) => field.fieldName === 'shippingDestination')}
                    onChange={onValueChange}
                />
                <DeliveryAttentionInput
                    value={model.deliveryAttentionTo}
                    hasError={model.errors && model.errors.find((field) => field.fieldName === 'deliveryAttentionTo')}
                    onChange={onValueChange}
                />
            </Form>
            {errorMsg &&
            <div className='alert alert-danger'>
                {errorMsg}
            </div>
            }
        </Panel>
    );
}