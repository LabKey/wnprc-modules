import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import { Form, Panel } from 'react-bootstrap';
import { RequestOrderModel } from '../model';
import { PurchasingFormInput } from "./PurchasingFormInput";
import { Query } from "@labkey/api";
import { Draft, produce } from 'immer';

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
                <VendorInput value={model.vendor} onChange={onInputChange}/>
                <BusinessPurposeInput value={model.purpose} onChange={onInputChange}/>
                <SpecialInstructionInput value={model.comments} onChange={onInputChange}/>
                <ShippingDestinationInput value={model.shippingDestination} onChange={onInputChange}/>
                <DeliveryAttentionInput value={model.deliveryAttentionTo} onChange={onInputChange}/>
            </Form>
        </Panel>
    );
}

interface InputRow {
    [key: string]: string
}

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
}

function getDropdownOptions(schemaName: string, queryName: string, colName: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            columns: colName,
            // filterArray: [
            //     Filter.create()
            // ]
            success: function (results) {
                if (results && results.rows)
                {
                    resolve(results.rows);
                }
            }
        })
    })
}

const createOptions = (rows: Array<InputRow>, colName: string) => {
    if (!rows)
        return undefined;

    return rows.map((row, index) => {
        return (
            <option key={index + "-" + row[colName]} value={row[colName]}>{row[colName]}</option>
        );
    });
}

export const AccountInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    useEffect(() => {
        getDropdownOptions('ehr_billingLinked', 'aliases', 'alias').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'alias'), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('account', evt.target.value);
    },[]);

    return (
        <div>
            <PurchasingFormInput
                label="Account to charge"
                required={true}
            >
                <select style={{resize: 'none', width: '400px', height: '30px'}} value={value}
                        onChange={onValueChange}>
                    {options}
                </select>
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

    const options = useMemo(() => createOptions(dropDownVals, 'vendorName'), [dropDownVals]);

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
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
}

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

    const options = useMemo(() => createOptions(dropDownVals, 'streetAddress'), [dropDownVals]);

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