import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button} from 'react-bootstrap';
import {getDropdownOptions} from "../action";
import {createOptions, formatCurrency} from "./Utils";
import {PurchasingFormInput} from "./PurchasingFormInput";
import {VendorModel} from "../model";
import {VendorPopupModal} from "./VendorInputModal";

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
        getDropdownOptions('ehr_billingLinked', 'aliases', 'alias').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'alias', true), [dropDownVals]);

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

export const VendorInput: FC<InputProps> = (props) => {

    const {onChange, value, hasError} = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getDropdownOptions('ehr_purchasing', 'vendor', 'vendorName').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'vendorName', true), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('vendorName', evt.target.value);
    }, [onChange]);

    return (
        <div>
            <PurchasingFormInput
                label="Vendor"
                required={true}
            >
                <select className={'vendor-input form-control ' + (hasError ? 'field-validation-error' : '')}
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
        getDropdownOptions('ehr_purchasing', 'shippingInfo', 'streetAddress, shippingAlias').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'streetAddress', false, 'shippingAlias'), [dropDownVals]);

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
    displayValue: string;
}
export const NewVendorDisplay: FC<VendorDisplayProps> = (props) => {

    const {displayValue} = props;

    // const onVendorEdit = useCallback(() => {
    //
    // }, []);
    //
    // const onClickEditNewVendor = useCallback(() => {
    //     return <VendorPopupModal showPopup={true} vendorModel={vendorModel} onVendorChange={onVendorEdit}/>
    // }, []);

    return (
            // hasValues &&
            <>
                <div>
                    <PurchasingFormInput
                            label="Other/New Vendor"
                            required={false}
                    >
                    <textarea
                            className='new-vendor-display form-control'
                            value={displayValue}
                            id="new-vendor-display"
                            disabled={true}
                    />
                    </PurchasingFormInput>
                    {/*<Button style={{marginLeft: '16.5%'}} variant="primary" onClick={onClickEditNewVendor}>*/}
                    {/*    Edit new vendor*/}
                    {/*</Button>*/}
                </div>
            </>
    )
}