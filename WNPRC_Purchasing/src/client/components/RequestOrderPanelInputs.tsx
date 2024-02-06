import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Filter } from '@labkey/api';

import { produce, Draft } from 'immer';

import { getData } from '../actions';

import { RequestOrderModel, VendorModel } from '../model';

import { createOptions } from './Utils';
import { PurchasingFormInput } from './PurchasingFormInput';
import { VendorPopupModal } from './VendorInputModal';

interface InputProps {
    value: any;
    onChange?: (colName, value) => void;
    hasError?: boolean;
    hasOtherAcctWarning?: boolean;
    isReadOnly?: boolean;
}

export const AccountInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReadOnly } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getData('ehr_purchasing', 'userAccountsAssocFiltered', 'account, rowid', 'account').then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowid', 'account', true), [dropDownVals]);

    const onValueChange = useCallback(
        evt => {
            onChange('account', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Account to charge *">
                <select
                    className={'account-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onValueChange}
                    placeholder="Please provide the purpose for this purchasing request (Required)"
                    disabled={isReadOnly}
                >
                    <option hidden value="">
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
});

export const AccountOtherInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, hasOtherAcctWarning, isReadOnly } = props;

    const onTextChange = useCallback(
        evt => {
            onChange('otherAcctAndInves', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Account & PI *">
                <textarea
                    className={
                        'account-input other-account-input form-control ' +
                        (hasError ? 'field-validation-error' : hasOtherAcctWarning ? 'other-account-warning-box' : '')
                    }
                    value={value}
                    onChange={onTextChange}
                    id="account-and-pi-id"
                    placeholder="You selected 'Other' for 'Account to charge', please provide an account and principal investigator (Required)"
                    readOnly={isReadOnly}
                />
            </PurchasingFormInput>
        </div>
    );
});

interface VendorInputProps {
    onChange?: (colName, value) => void;
    hasError?: boolean;
    model: RequestOrderModel;
    onModelChange?: (model: RequestOrderModel) => void;
    isReadOnly?: boolean;
}

export const VendorInput: FC<VendorInputProps> = memo(props => {
    const { onChange, hasError, model, onModelChange, isReadOnly } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();
    const [showPopup, setShowPopup] = useState<boolean>(false);

    useEffect(() => {
        const filterArray = [Filter.create('isValidVendor', true)];
        getData('ehr_purchasing', 'vendor', 'vendorName, rowId, isValid', 'vendorName', filterArray).then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'vendorName', true), [dropDownVals]);

    const onChangeShowPopup = useCallback(show => {
        setShowPopup(show);
    }, []);

    const onClickEditNewVendor = useCallback(() => {
        setShowPopup(true);
    }, []);

    const onValueChange = useCallback(
        evt => {
            const val = evt.target.value;
            if (val === 'Other') {
                setShowPopup(true);
            } else {
                setShowPopup(false);
            }
            onChange('vendorId', val);
        },
        [onChange, hasError, model, onModelChange]
    );

    const onVendorCancel = useCallback(
        (newVendor: VendorModel) => {
            const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
                if (!VendorModel.getDisplayString(model.newVendor)) {
                    draft['vendorId'] = ''; // Reset Vendor input when user hits Cancel and doesn't enter a new vendor
                }
            });
            onModelChange?.(updatedModel);
        },
        [onChange, hasError, model, onModelChange]
    );

    const onVendorAdd = useCallback(
        (newVendor: VendorModel) => {
            const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
                draft['newVendor'] = newVendor;
            });
            if (!newVendor.errors) {
                onModelChange?.(updatedModel);
            }
        },
        [onChange, hasError, model, onModelChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Vendor *">
                <select
                    className={'vendor-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={model.vendorId}
                    onChange={onValueChange}
                    disabled={isReadOnly}
                >
                    <option hidden value="">
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
            {showPopup && (
                <VendorPopupModal
                    vendorList={dropDownVals}
                    showPopup={showPopup}
                    vendorModel={model.newVendor}
                    onVendorChange={onVendorAdd}
                    onVendorCancel={onVendorCancel}
                    onChangeShowPopup={onChangeShowPopup}
                />
            )}
            {model.vendorId === 'Other' && model.newVendor && VendorModel.getDisplayString(model.newVendor).length > 0 && (
                <>
                    <NewVendorDisplay vendorModel={model.newVendor} onVendorChange={onVendorAdd} />
                    <Button
                        className="edit-other-vendor-button btn btn-default"
                        variant="primary"
                        onClick={onClickEditNewVendor}
                    >
                        Edit other vendor
                    </Button>
                </>
            )}
        </div>
    );
});

export const BusinessPurposeInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReadOnly } = props;

    const onTextChange = useCallback(
        evt => {
            onChange('justification', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Business purpose *">
                <textarea
                    className={'business-purpose-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onTextChange}
                    id="business-purpose-id"
                    placeholder="Please provide the purpose for this purchasing request (Required)"
                    readOnly={isReadOnly}
                />
            </PurchasingFormInput>
        </div>
    );
});

export const SpecialInstructionInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReadOnly } = props;
    const onTextChange = useCallback(
        evt => {
            onChange('comments', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Comments/Special instructions">
                <textarea
                    className="special-instr-input form-control"
                    value={value}
                    onChange={onTextChange}
                    id="special-instructions-id"
                    placeholder="Please add any special instructions or comments (Optional)"
                    readOnly={isReadOnly}
                />
            </PurchasingFormInput>
        </div>
    );
});

export const ShippingDestinationInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReadOnly } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getData('ehr_purchasing', 'shippingInfo', 'streetAddress, shippingAlias, rowId', 'streetAddress').then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'streetAddress', false, 'shippingAlias'), [
        dropDownVals,
    ]);

    const onValueChange = useCallback(
        evt => {
            onChange('shippingInfoId', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Shipping destination *">
                <select
                    className={'shipping-dest-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onValueChange}
                    disabled={isReadOnly}
                >
                    <option hidden value="" disabled={isReadOnly}>
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
});

export const DeliveryAttentionInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReadOnly } = props;
    const onTextChange = useCallback(
        evt => {
            onChange('shippingAttentionTo', evt.target.value);
        },
        [onChange]
    );
    return (
        <div>
            <PurchasingFormInput label="Delivery attention to *">
                <textarea
                    className={'delivery-attn-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onTextChange}
                    id="delivery-attn-id"
                    placeholder="Name of the person package delivery should be addressed to (Required)"
                    readOnly={isReadOnly}
                />
            </PurchasingFormInput>
        </div>
    );
});

interface VendorDisplayProps {
    vendorModel: VendorModel;
    onVendorChange: (vendorModel: VendorModel) => void;
}
export const NewVendorDisplay: FC<VendorDisplayProps> = memo(props => {
    const { vendorModel } = props;

    return (
        <div>
            <PurchasingFormInput label="Other vendor">
                <textarea
                    className="new-vendor-display form-control"
                    value={VendorModel.getDisplayString(vendorModel)}
                    id="new-vendor-display"
                    disabled={true}
                />
            </PurchasingFormInput>
        </div>
    );
});
