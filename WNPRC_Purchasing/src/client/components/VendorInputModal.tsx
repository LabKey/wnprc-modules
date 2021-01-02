import {VendorModel} from "../model";
import React, {FC, useCallback, useEffect, useState} from "react";
import {Button, Modal, Form} from 'react-bootstrap';
import {VendorFormInput} from "./PurchasingFormInput";
import produce, {Draft} from "immer";
import {is} from "immer/dist/utils/common";

interface VendorInputProps {
    vendorList: any;
    vendorModel: VendorModel;
    onVendorChange: (vendorModel: VendorModel) => void;
    showPopup: boolean,
    onChangeShowPopup: (showPopup: boolean) => void;
}

export const VendorPopupModal: FC<VendorInputProps> = (props) => {
    const { vendorList, vendorModel, onVendorChange, showPopup, onChangeShowPopup } = props;

    const [show, setShow] = useState(showPopup);
    const [updatedNewVendor, setUpdatedNewVendor] = useState<VendorModel>(VendorModel.create({}));

    useEffect(() => {
        setUpdatedNewVendor(vendorModel);
    }, []);

    const onAddingNewVendor = useCallback(() => {
        const errors = [];
        setShow(false);
        const isDuplicateVendor = vendorList.findIndex(vendor => vendor.vendorName === updatedNewVendor.vendorName) >= 0;

        if (!updatedNewVendor.vendorName || isDuplicateVendor) {
            errors.push({fieldName: 'vendorName'})
        }
        if (!updatedNewVendor.streetAddress) {
            errors.push({fieldName: 'streetAddress'})
        }
        if (!updatedNewVendor.city) {
            errors.push({fieldName: 'city'})
        }
        if (!updatedNewVendor.state) {
            errors.push({fieldName: 'state'})
        }
        if (!updatedNewVendor.country) {
            errors.push({fieldName: 'country'})
        }
        if (!updatedNewVendor.zip) {
            errors.push({fieldName: 'zip'})
        }
        const updatedModel = produce(updatedNewVendor, (draft: Draft<VendorModel>) => {
            if (errors.length > 0) {
                draft.errors = errors;
                let msg = 'Please fix error(s) before saving:  ';
                if (isDuplicateVendor){
                    msg += "duplicate vendor, ";
                }
                msg += "missing required field(s).";

                draft.errorMsg = msg;
                setShow(true);
            }
        });
        onVendorChange(updatedModel);
        setUpdatedNewVendor(updatedModel);
        if (errors.length > 0) {
            onChangeShowPopup(true);
        }
        else {
            onChangeShowPopup(false);
        }
    }, [updatedNewVendor, onVendorChange]);

    const handleClose = useCallback(() => {

        // scenario when user hits Cancel without Saving and there is no new vendor data, then cleanup and create and empty new vendor
        if (VendorModel.getDisplayVersion(vendorModel).length == 0) {
            onVendorChange(VendorModel.create({}));
        }
        else {
            setUpdatedNewVendor(vendorModel);
        }
        onChangeShowPopup(false);
        setShow(false);

    }, [vendorModel, onVendorChange]);

    const onInputChange = useCallback((colName, value) => {
        const updatedVendorModel = produce(updatedNewVendor, (draft: Draft<VendorModel>) => {
            if (updatedNewVendor.errors && updatedNewVendor.errors.length > 0) {
                let updatedErrors = updatedNewVendor.errors.filter((field) => field.fieldName !== colName);
                draft['errors'] = updatedErrors;
            }
            if (draft['errors'] && draft['errors'].length === 0) {
                draft['errorMsg'] = undefined;
            }
            draft[colName] = value;
        });

        setUpdatedNewVendor(updatedVendorModel);
    }, [updatedNewVendor, onVendorChange]);

    return (
        <>
            <Modal show={show} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>New vendor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <NewVendorInput
                            required={true}
                            column={'vendorName'}
                            columnTitle={'Vendor Name'}
                            value={updatedNewVendor.vendorName}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'vendorName')}
                        />
                        <NewVendorTextArea
                            required={true}
                            column={'streetAddress'}
                            columnTitle={'Street Address'}
                            value={updatedNewVendor.streetAddress}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'streetAddress')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'city'}
                            columnTitle={'City'}
                            value={updatedNewVendor.city}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'city')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'state'}
                            columnTitle={'State'}
                            value={updatedNewVendor.state}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'state')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'country'}
                            columnTitle={'Country'}
                            value={updatedNewVendor.country}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'country')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'zip'}
                            columnTitle={'Zip Code'}
                            value={updatedNewVendor.zip}
                            onChange={onInputChange}
                            hasError={updatedNewVendor.errors && updatedNewVendor.errors.find((field) => field.fieldName === 'zip')}
                        />
                        <NewVendorInput
                            required={false}
                            column={'phoneNumber'}
                            columnTitle={'Phone'}
                            value={updatedNewVendor.phoneNumber}
                            onChange={onInputChange}
                        />
                        <NewVendorInput
                            required={false}
                            column={'faxNumber'}
                            columnTitle={'Fax'}
                            value={updatedNewVendor.faxNumber}
                            onChange={onInputChange}
                        />
                        <NewVendorInput
                            required={false}
                            column={'email'}
                            columnTitle={'Email'}
                            value={updatedNewVendor.email}
                            onChange={onInputChange}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'url'}
                            columnTitle={'Company website'}
                            value={updatedNewVendor.url}
                            onChange={onInputChange}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'notes'}
                            columnTitle={'Notes'}
                            value={updatedNewVendor.notes}
                            onChange={onInputChange}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={onAddingNewVendor}>
                        Save
                    </Button>
                </Modal.Footer>
                {
                    (updatedNewVendor.errorMsg) &&
                    <div className='alert alert-danger'>
                        {updatedNewVendor.errorMsg}
                    </div>
                }

            </Modal>
        </>
    );
}

interface VendorProps
{
    required: boolean;
    column: string;
    columnTitle: string;
    value: any;
    onChange: (column:string, value:any) => void;
    hasError?: boolean;
}

const NewVendorInput: FC<VendorProps> = (props) => {

    const {required, column, columnTitle, value, onChange, hasError} = props;

    const onValueChange = useCallback((evt) => {
        onChange(column, evt.target.value);
    }, [required, column, columnTitle, value, onChange]);

    return (
        <div style={{width:'100%'}}>
            <VendorFormInput
                label={columnTitle}
                required={required}
            >
                <input
                    className={'form-control vendor-new-input ' + (hasError ? 'field-validation-error' : '')}
                    style={{width:'80%'}}
                    value={value}
                    onChange={onValueChange}
                    id={'vendor-input-' + column}
                    placeholder={required ? 'Required' : 'Optional'}
                />
            </VendorFormInput>
        </div>
    );
}

const NewVendorTextArea: FC<VendorProps> = (props) => {

    const {required, column, columnTitle, value, onChange, hasError} = props;

    const onValueChange = useCallback((evt) => {
        onChange(column, evt.target.value);
    }, [required, column, columnTitle, value, onChange]);

    return (
        <div style={{width:'100%'}}>
            <VendorFormInput
                label={columnTitle}
                required={required}
            >
                <textarea
                    className={'form-control vendor-new-text-area-input ' + (hasError ? 'field-validation-error' : '')}
                    value={value}
                    onChange={onValueChange}
                    id={'vendor-input-' + column}
                    placeholder={required ? 'Required' : 'Optional'}
                />
            </VendorFormInput>
        </div>
    );
}