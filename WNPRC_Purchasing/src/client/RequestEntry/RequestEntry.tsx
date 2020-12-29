/*
 * Copyright (c) 2020 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {FC, useCallback, useEffect, useState} from 'react'
import {RequestOrderPanel} from "../components/RequestOrderPanel";
import {LineItemModel, RequestOrderModel, VendorModel} from "../model";
import {LineItemsPanel} from "../components/LineItemsPanel";
import '../RequestEntry/RequestEntry.scss';
import {ActionURL, getServerContext} from "@labkey/api";
import produce, {Draft} from "immer";

export const App : FC = () => {

    const [requestOrderModel, setRequestOrderModel] = useState<RequestOrderModel>(RequestOrderModel.create({}));
    const [newVendorModel, setNewVendorModel] = useState<VendorModel>(VendorModel.create({}));
    const [lineItems, setLineItems] = useState<Array<LineItemModel>>([LineItemModel.create({})]);
    const [lineItemErrorMsg, setLineItemErrorMsg] = useState<string>();
    const [lineItemRowIndex, setLineItemRowIndex] = useState<number>(0);
    const [hasRequestEntryPermission, setHasRequestEntryPermission] = useState<boolean>();
    const [isLoadingModel, setLoadingModel] = useState<boolean>(true);
    const [message, setMessage] = useState<string>();
    const [onChange, setOnChange] = useState<any>();

    //equivalent to componentDidMount and componentDidUpdate (if with dependencies, then equivalent to componentDidUpdate)
    useEffect(() => {
        setRequestOrderModel(requestOrderModel);
        setLineItems(lineItems);
    }, []);

    const requestOrderModelChange = useCallback((model:RequestOrderModel)=> {
        setRequestOrderModel(model);
    }, [requestOrderModel]);

    const lineItemsChange = useCallback((lineItemArray : Array<LineItemModel>)=> {
        let numOfErrors = 0;
        for (let i = 0; i < lineItemArray.length; i++) {
            if (lineItemArray[i].errors && lineItemArray[i].errors.length > 0) {
                numOfErrors++;
            }
        }
        if (numOfErrors == 0) {
            setLineItemErrorMsg(undefined);
        }
        setLineItems(lineItemArray);

    }, [lineItems]);

    const onCancelBtnHandler = useCallback((event: any) => {

        // event.returnValue = 'Changes you made may not be saved.'
        const returnUrl = ActionURL.getParameter('returnUrl');
        setLineItems([LineItemModel.create({})]);
        setRequestOrderModel(RequestOrderModel.create({}));
        // window.location.assign(ActionURL.buildURL('project', 'begin'));
        window.location.href = returnUrl || ActionURL.buildURL('project', 'begin', getServerContext().container.path);
    }, []);

    const onSaveBtnHandler = useCallback(() => {

        //if required values are not provided, then set errorMessage for the panel and errors on each field to highlight boxes in red
        let msg = "Unable to submit request, missing required field(s).";
        //catch errors for Request Order panel
        const requestOrderErrors = [];
        if (!requestOrderModel.account) {
            requestOrderErrors.push({fieldName: 'account'});
        }
        if (requestOrderModel.account === 'Other' && !requestOrderModel.accountOther) {
            requestOrderErrors.push({fieldName: 'accountOther'});
        }
        if (!requestOrderModel.vendorName) {
            requestOrderErrors.push({fieldName: 'vendorName'});
        }
        if (!requestOrderModel.purpose) {
            requestOrderErrors.push({fieldName: 'purpose'});
        }
        if (!requestOrderModel.shippingDestination) {
            requestOrderErrors.push({fieldName: 'shippingDestination'});
        }
        if (!requestOrderModel.deliveryAttentionTo) {
            requestOrderErrors.push({fieldName: 'deliveryAttentionTo'});
        }
        if (requestOrderErrors.length > 0) {
            const updatedRequestOrderObj = produce(requestOrderModel, (draft: Draft<RequestOrderModel>) => {
                draft['errorMsg'] = msg;
                draft['errors'] = requestOrderErrors;
            });
            setRequestOrderModel(updatedRequestOrderObj);
        }

        // catch errors for Line Items panel
        let hasLineItemError = false;
        for (let i = 0; i < lineItems.length; i++) {
            const lineItemErrors = [];

            if (!lineItems[i].item) {
                lineItemErrors.push({fieldName: 'item'});
            }
            if (!lineItems[i].itemUnit) {
                lineItemErrors.push({fieldName: 'itemUnit'});
            }
            if (!lineItems[i].unitPrice) {
                lineItemErrors.push({fieldName: 'unitPrice'});
            }
            if (!lineItems[i].quantity) {
                lineItemErrors.push({fieldName: 'quantity'});
            }

            if (lineItemErrors.length > 0) {
                const updatedLineItem = produce(lineItems[i], (draft: Draft<LineItemModel>) => {
                    draft['errors'] = lineItemErrors;
                });
                const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
                    draft[i] = updatedLineItem;
                });
                setLineItems(updatedLineItems);
                hasLineItemError = true;
            }
        }

        if (hasLineItemError) {
            setLineItemErrorMsg(msg);
        }

        //if no errors then save
    }, [requestOrderModel, lineItems]);

    return (
        <>
            <RequestOrderPanel onInputChange={requestOrderModelChange} model={requestOrderModel} errorMsg={requestOrderModel.errorMsg}/>
            <LineItemsPanel onChange={lineItemsChange} lineItems={lineItems} errorMsg={lineItemErrorMsg}/>
            <button className='btn btn-default' id='cancel' name='cancel' onClick={onCancelBtnHandler}>Cancel</button>
            <button className='btn btn-primary' style={{float:'right'}} id='submitForReview' name='submitForReview' onClick={onSaveBtnHandler}>Submit for Review</button>
        </>
    )
}