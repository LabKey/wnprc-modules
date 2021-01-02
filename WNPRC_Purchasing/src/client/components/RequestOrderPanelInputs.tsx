import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button} from 'react-bootstrap';
import {getData} from "../actions";
import {createOptions} from "./Utils";
import {PurchasingFormInput} from "./PurchasingFormInput";
import {RequestOrderModel, VendorModel} from "../model";
import {VendorPopupModal} from "./VendorInputModal";
import produce, {Draft} from "immer";

interface InputProps
{
    value: any;
    onChange: (colName, value) => void;
    hasError?: boolean;
}

export const AccountInput: FC<InputProps> = (props) => {

    const {onChange, value, hasError} = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getData('ehr_billingLinked', 'aliases', 'alias, rowid').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowid', 'alias', true), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('account', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Account to charge"
                required={true}
            >
                <select
                    className={'account-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onValueChange}
                    placeholder="Please provide the purpose for this purchasing request (Required)"
                >
                    <option hidden value="">Select</option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
}

export const AccountOtherInput: FC<InputProps> = (props) => {

    const {onChange, value, hasError} = props;

    const onTextChange = useCallback((evt) => {
        onChange('accountOther', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Account & Principal Investigator"
                required={true}
            >
                <textarea
                    className={'account-input other-account-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onTextChange}
                    id="account-and-pi-id"
                    placeholder="You selected 'Other' account, please provide account and principal investigator (Required)"
                >
                </textarea>
            </PurchasingFormInput>
        </div>
    );
}

interface VendorInputProps
{
    onChange: (colName, value) => void;
    hasError?: boolean;
    model: RequestOrderModel
    onModelChange: (model: RequestOrderModel) => void;
}

export const VendorInput: FC<VendorInputProps> = (props) => {

    const {onChange, hasError, model, onModelChange} = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();
    const [showPopup, setShowPopup] = useState<boolean>(false);

    useEffect(() => {
        getData('ehr_purchasing', 'vendor', 'vendorName, rowId').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'vendorName', true), [dropDownVals]);

    const onChangeShowPopup = useCallback((show) => {
        setShowPopup(show);
    },[]);

    const onClickEditNewVendor = useCallback(() => {
        setShowPopup(true);
    },[]);

    const onValueChange = useCallback((evt) => {
        const val = evt.target.value;
        if (val === 'Other') {
            setShowPopup(true);
        }
        else {
            setShowPopup(false);
        }
        onChange('vendor', val);
    }, [onChange, hasError, model, onModelChange]);

    const onVendorAdd = useCallback((newVendor : VendorModel) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft['newVendor'] = newVendor;
        });
        if (!newVendor.errors) {
            onModelChange(updatedModel);
        }
    }, [onChange, hasError, model, onModelChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Vendor"
                required={true}
            >
                <select className={'vendor-input form-control ' + (hasError ? 'field-validation-error' : '')}
                        value={model.vendor}
                        onChange={onValueChange}
                >
                    <option hidden value="">Select</option>
                    {options}
                </select>
            </PurchasingFormInput>
            {
                showPopup &&
                <VendorPopupModal vendorList={dropDownVals} showPopup={showPopup} vendorModel={model.newVendor} onVendorChange={onVendorAdd} onChangeShowPopup={onChangeShowPopup}/>
            }
            {
                model.vendor === 'Other' && model.newVendor && VendorModel.getDisplayVersion(model.newVendor).length > 0 &&
               <>
                <NewVendorDisplay vendorModel={model.newVendor} onVendorChange={onVendorAdd} />
                   <Button className='edit-other-vendor-button btn btn-default' variant="primary" onClick={onClickEditNewVendor}>
                   Edit other vendor
                   </Button>
               </>
            }

        </div>
    );
}

export const BusinessPurposeInput: FC<InputProps> = (props) => {

    const {onChange, value, hasError} = props;

    const onTextChange = useCallback((evt) => {
        onChange('purpose', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Business purpose"
                required={true}
            >
                <textarea
                    className={'business-purpose-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onTextChange}
                    id="business-purpose-id"
                    placeholder="Please provide the purpose for this purchasing request (Required)"
                />
            </PurchasingFormInput>
        </div>
    );
}

export const SpecialInstructionInput: FC<InputProps> = (props) => {

    const {onChange, value} = props;
    const onTextChange = useCallback((evt) => {
        onChange('comments', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Special instructions"
                required={false}
            >
                <textarea
                    className='special-instr-input form-control'
                    value={value}
                    onChange={onTextChange}
                    id="special-instructions-id"
                    placeholder="Please add any special instructions or comments (Optional)"
                />
            </PurchasingFormInput>
        </div>
    );
}

export const ShippingDestinationInput: FC<InputProps> = (props) => {

    const {onChange, value, hasError} = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getData('ehr_purchasing', 'shippingInfo', 'streetAddress, shippingAlias, rowId').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'streetAddress', false, 'shippingAlias'), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('shippingDestination', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Shipping destination"
                required={true}
            >
                <select
                    className={'shipping-dest-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onValueChange}
                >
                    <option hidden value="">Select</option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
}

export const DeliveryAttentionInput: FC<InputProps> = (props) => {
    const {onChange, value, hasError} = props;
    const onTextChange = useCallback((evt) => {
        onChange('deliveryAttentionTo', evt.target.value);
    }, [onChange]);
    return (
        <div>
            <PurchasingFormInput
                label="Delivery attention to"
                required={true}
            >
                <textarea
                    className={'delivery-attn-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onTextChange}
                    id="delivery-attn-id"
                    placeholder="Name of the person package delivery should be addressed to (Required)"
                />
            </PurchasingFormInput>
        </div>
    );
}

interface VendorDisplayProps {
    vendorModel: VendorModel;
    onVendorChange: (vendorModel: VendorModel) => void;
}
export const NewVendorDisplay: FC<VendorDisplayProps> = (props) => {

    const {vendorModel} = props;

    return (
        <div>
            <PurchasingFormInput
                label="Other Vendor"
                required={false}
            >
                <textarea
                    className='new-vendor-display form-control'
                    value={VendorModel.getDisplayVersion(vendorModel)}
                    id="new-vendor-display"
                    disabled={true}
                />
            </PurchasingFormInput>
        </div>
    )
}