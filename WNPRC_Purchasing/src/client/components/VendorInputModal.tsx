import {VendorModel} from "../model";
import React, {FC, useCallback, useState} from "react";
import {Button, Modal, Form} from 'react-bootstrap';
import {VendorFormInput} from "./PurchasingFormInput";
import produce, {Draft} from "immer";

interface VendorInputProps {
    vendorModel: VendorModel;
    onVendorChange: (vendorModel: VendorModel) => void;
    showPopup: boolean
}

export const VendorPopupModal: FC<VendorInputProps> = (props) => {
    const { vendorModel, onVendorChange, showPopup } = props;

    const [show, setShow] = useState(showPopup);

    const onAddingNewVendor = useCallback(() => {
        const errors = [];
        setShow(false);
        if (!vendorModel.vendorName) {
            errors.push({fieldName: 'vendorName'})
        }
        if (!vendorModel.streetAddress) {
            errors.push({fieldName: 'streetAddress'})
        }
        if (!vendorModel.city) {
            errors.push({fieldName: 'city'})
        }
        if (!vendorModel.state) {
            errors.push({fieldName: 'state'})
        }
        if (!vendorModel.country) {
            errors.push({fieldName: 'country'})
        }
        if (!vendorModel.country) {
            errors.push({fieldName: 'zip'})
        }
        const updatedModel = produce(vendorModel, (draft: Draft<VendorModel>) => {
            if (errors.length > 0) {
                draft.errors = errors;
                draft.errorMsg = "Unable to save, missing required field(s).";
            }
            setShow(true);
        });
        onVendorChange(updatedModel);

    }, [vendorModel, onVendorChange]);

    const handleClose = useCallback((vendorModel: VendorModel) => {
        onVendorChange(VendorModel.create({}));
        setShow(false);

    }, [vendorModel, onVendorChange]);

    const handleShow = () => setShow(true);
    const onInputChange = useCallback((colName, value) => {
        const updatedVendorModel = produce(vendorModel, (draft: Draft<VendorModel>) => {
            if (vendorModel.errors && vendorModel.errors.length > 0) {
                let updatedErrors = vendorModel.errors.filter((field) => field.fieldName !== colName);
                draft['errors'] = updatedErrors;
            }
            if (draft['errors'] && draft['errors'].length === 0) {
                draft['errorMsg'] = undefined;
            }
            draft[colName] = value;
        });

        onVendorChange(updatedVendorModel);
    }, [vendorModel, onVendorChange]);

    return (
        <>
            <Modal show={show} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Add new vendor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <NewVendorInput
                            required={true}
                            column={'vendorName'}
                            columnTitle={'Vendor Name'}
                            value={vendorModel.vendorName}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'vendorName')}
                        />
                        <NewVendorTextArea
                            required={true}
                            column={'streetAddress'}
                            columnTitle={'Street Address'}
                            value={vendorModel.streetAddress}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'streetAddress')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'city'}
                            columnTitle={'City'}
                            value={vendorModel.city}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'city')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'state'}
                            columnTitle={'State'}
                            value={vendorModel.state}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'state')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'country'}
                            columnTitle={'Country'}
                            value={vendorModel.country}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'country')}
                        />
                        <NewVendorInput
                            required={true}
                            column={'zip'}
                            columnTitle={'Zip Code'}
                            value={vendorModel.zip}
                            onChange={onInputChange}
                            hasError={vendorModel.errors && vendorModel.errors.find((field) => field.fieldName === 'zip')}
                        />
                        <NewVendorInput
                            required={false}
                            column={'phoneNumber'}
                            columnTitle={'Phone'}
                            value={vendorModel.phoneNumber}
                            onChange={onInputChange}
                        />
                        <NewVendorInput
                            required={false}
                            column={'faxNumber'}
                            columnTitle={'Fax'}
                            value={vendorModel.faxNumber}
                            onChange={onInputChange}
                        />
                        <NewVendorInput
                            required={false}
                            column={'email'}
                            columnTitle={'Email'}
                            value={vendorModel.email}
                            onChange={onInputChange}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'url'}
                            columnTitle={'Company website'}
                            value={vendorModel.url}
                            onChange={onInputChange}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'notes'}
                            columnTitle={'Notes'}
                            value={vendorModel.notes}
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
                    vendorModel.errorMsg &&
                    <div className='alert alert-danger'>
                        {vendorModel.errorMsg}
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