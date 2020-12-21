import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import { Form, Panel, Modal, Button } from 'react-bootstrap';
import { RequestOrderModel, VendorModel} from '../model';
import { PurchasingFormInput } from "./PurchasingFormInput";
import { Draft, produce } from 'immer';
import { getDropdownOptions } from "../action";
import { createOptions } from "./Utils";

interface Props {
    model: RequestOrderModel;
    onInputChange: (model: RequestOrderModel) => void;
}

export const RequestOrderPanel : FC<Props> = (props) => {

    const { model, onInputChange } = props;

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft[colName] = value;
        });
        onInputChange(updatedModel);
    },[]);

    return (
        <Panel
            className='domain-form-panel panel panel-default'
            expanded={true}
            onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <Panel.Heading>Request Order</Panel.Heading>
            <Form>
                <AccountInput value={model.account} onChange={onValueChange}/>
                {
                    model.account === "Other" &&
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

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
}

export const AccountInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getDropdownOptions('ehr_billingLinked', 'aliases', 'alias').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'alias', true), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('account', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Account to charge"
                required={true}
            >
                <select
                    style={{resize: 'none', width: '400px', height: '30px'}}
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

export const AccountOtherInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('accountOther', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Account & Principal Investigator"
                required={true}
            >
                <textarea
                    style={{resize: 'none', width: '400px', height: '60px'}}
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

const VendorInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getDropdownOptions('ehr_purchasing', 'vendor', 'vendorName').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'vendorName', true), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('vendorName', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Vendor"
                required={true}
            >
                <select style={{resize: 'none', width: '400px', height: '30px'}} value={value}
                        onChange={onValueChange}>
                    <option hidden value="">Select</option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
}

// interface VendorInputProps {
//     vendorInfo: VendorModel;
//     onChange: (vendorInfo: VendorModel) => void;
// }

// const VendorPopupModal: FC<VendorInputProps> = (props) => {
//     const { vendorInfo } = props;
//
//     const [show, setShow] = useState(false);
//
//     const handleClose = () => setShow(false);
//     const handleShow = () => setShow(true);
//     const inputHandler =(evt) => {
//         evt.target.value
//     }
//
//     return (
//         <>
//             <Button
//                 style={{marginLeft: '310px'}}
//                 variant="primary" onClick={handleShow}>
//                 Add Vendor
//             </Button>
//             <Modal show={show} onHide={handleClose} backdrop="static">
//                 <Modal.Header closeButton>
//                     <Modal.Title>Add new vendor</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <input type='text' value='this.state.username' id='username' onChange='inputHandler' />
//
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={handleClose}>
//                         Cancel
//                     </Button>
//                     <Button variant="primary" onClick={handleClose}>
//                         Apply
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//         </>
//     );
// }

const BusinessPurposeInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('purpose', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Business purpose"
                required={true}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '90px'}}
                    value={value}
                    onChange={onTextChange}
                    id="business-purpose-id"
                    placeholder="Please provide the purpose for this purchasing request (Required)"
                />
            </PurchasingFormInput>
        </div>
    );
}

const SpecialInstructionInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const onTextChange = useCallback((evt) => {
        onChange('comments', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Special instructions"
                required={false}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '90px'}}
                    value={value}
                    onChange={onTextChange}
                    id="special-instructions-id"
                    placeholder="Please add any special instructions or comments (Optional)"
                />
            </PurchasingFormInput>
        </div>
    );
}

const ShippingDestinationInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getDropdownOptions('ehr_purchasing', 'shippingInfo', 'streetAddress').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'streetAddress', false), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('streetAddress', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Shipping destination"
                required={true}
            >
                <select style={{resize: 'none', width: '400px', height: '30px'}} value={value}
                        onChange={onValueChange}>
                    <option hidden value="">Select</option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
}

const DeliveryAttentionInput: FC<InputProps> = (props) => {
    const { onChange, value } = props;
    const onTextChange = useCallback((evt) => {
        onChange('comments', evt.target.value);
    },[]);
    return (
        <div>
            <PurchasingFormInput
                label="Delivery attention to"
                required={false}
            >
                <textarea
                    style={{resize:'none', width: '400px', height: '60px'}}
                    value={value}
                    onChange={onTextChange}
                    id="delivery-attn-id"
                    placeholder="Name of the person package delivery should be addressed to (Required)"
                />
            </PurchasingFormInput>
        </div>
    );
}