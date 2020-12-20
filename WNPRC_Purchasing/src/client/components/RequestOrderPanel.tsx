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
                {/*<VendorInput model={model} onChange={this.onInputChange}/>*/}
                {/*<BusinessPurposeInput model={model} onChange={this.onInputChange}/>*/}
                {/*<SpecialInstructionInput model={model} onChange={this.onInputChange}/>*/}
                {/*<ShippingDestinationInput model={model} onChange={this.onInputChange}/>*/}
                {/*<DeliveryAttentionInput model={model} onChange={this.onInputChange}/>*/}
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
        let value = evt.target.value;
        onChange('account', value);
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

// function VendorInput(props: InputProps) {
//     return (
//         <div>
//             <PurchasingFormInput
//                 label="Vendor"
//                 required={true}
//             >
//
//                 {/*    TODO: change textarea to a lookup dropdown*/}
//                 <textarea
//                     style={{resize:'none', width: '400px', height: '30px'}}
//                     value={props.model.vendor || ''}
//                     onChange={props.onChange}
//                 />
//             </PurchasingFormInput>
//         </div>
//     );
// }
//
// function BusinessPurposeInput(props: InputProps) {
//     return (
//         <div>
//             <PurchasingFormInput
//                 label="Business purpose"
//                 required={true}
//             >
//                 <textarea
//                     style={{resize:'none', width: '400px', height: '90px'}}
//                     value={props.model.purpose || ''}
//                     onChange={props.onChange}
//                 />
//             </PurchasingFormInput>
//         </div>
//     );
// }
//
// function SpecialInstructionInput(props: InputProps) {
//     return (
//         <div>
//             <PurchasingFormInput
//                 label="Special instructions"
//                 required={false}
//             >
//                 <textarea
//                     style={{resize:'none', width: '400px', height: '90px'}}
//                     value={props.model.comments || ''}
//                     onChange={props.onChange}
//                 />
//             </PurchasingFormInput>
//         </div>
//     );
// }
//
// function ShippingDestinationInput(props: InputProps) {
//     return (
//         <div>
//             <PurchasingFormInput
//                 label="Shipping destination"
//                 required={true}
//             >
//
//                 {/*    TODO: change textarea to a lookup dropdown*/}
//                 <textarea
//                     style={{resize:'none', width: '400px', height: '30px'}}
//                     value={props.model.shippingDestination || ''}
//                     onChange={props.onChange}
//                 />
//             </PurchasingFormInput>
//         </div>
//     );
// }
//
// function DeliveryAttentionInput(props: InputProps) {
//     return (
//         <div>
//             <PurchasingFormInput
//                 label="Delivery attention to"
//                 required={false}
//             >
//                 <textarea
//                     style={{resize:'none', width: '400px', height: '30px'}}
//                     value={props.model.deliveryAttentionTo || ''}
//                     onChange={props.onChange}
//                 />
//             </PurchasingFormInput>
//         </div>
//     );
// }