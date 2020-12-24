import {VendorModel} from "../model";
import React, {FC, useCallback, useState} from "react";
import {Button, Modal, Form} from 'react-bootstrap';
import {PurchasingFormInput, VendorFormInput} from "./PurchasingFormInput";

interface VendorInputProps {
    vendorModel: VendorModel;
    onChange: (vendorInfo: VendorModel) => void;
    showPopup: boolean
}

export const VendorPopupModal: FC<VendorInputProps> = (props) => {
    const { vendorModel, showPopup } = props;

    const [show, setShow] = useState(showPopup);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const inputHandler = useCallback((colName, value) => {

    }, []);

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
                            onChange={inputHandler}
                        />
                        <NewVendorTextArea
                            required={true}
                            column={'streetAddress'}
                            columnTitle={'Street Address'}
                            value={vendorModel.streetAddress}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={true}
                            column={'city'}
                            columnTitle={'City'}
                            value={vendorModel.city}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={true}
                            column={'state'}
                            columnTitle={'State'}
                            value={vendorModel.state}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={true}
                            column={'country'}
                            columnTitle={'Country'}
                            value={vendorModel.country}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={true}
                            column={'zip'}
                            columnTitle={'Zip Code'}
                            value={vendorModel.zip}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={false}
                            column={'phoneNumber'}
                            columnTitle={'Phone'}
                            value={vendorModel.phoneNumber}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={false}
                            column={'faxNumber'}
                            columnTitle={'Fax'}
                            value={vendorModel.faxNumber}
                            onChange={inputHandler}
                        />
                        <NewVendorInput
                            required={false}
                            column={'email'}
                            columnTitle={'Email'}
                            value={vendorModel.email}
                            onChange={inputHandler}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'url'}
                            columnTitle={'Company website'}
                            value={vendorModel.zip}
                            onChange={inputHandler}
                        />
                        <NewVendorTextArea
                            required={false}
                            column={'notes'}
                            columnTitle={'Notes'}
                            value={vendorModel.notes}
                            onChange={inputHandler}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Apply
                    </Button>
                </Modal.Footer>
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
}

const NewVendorInput: FC<VendorProps> = (props) => {

    const {required, column, columnTitle, value, onChange} = props;

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
                    className='form-control vendor-new-input'
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

    const {required, column, columnTitle, value, onChange} = props;

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
                    className='form-control vendor-new-text-area-input'
                    // style={{width:'80%', height:'50px'}}
                    value={value}
                    onChange={onValueChange}
                    id={'vendor-input-' + column}
                    placeholder={required ? 'Required' : 'Optional'}
                />
            </VendorFormInput>
        </div>
    );
}