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
import React, {FC, memo, useCallback, useEffect, useState} from 'react'
import {RequestOrderPanel} from "../components/RequestOrderPanel";
import {LineItemModel, RequestOrderModel, VendorModel} from "../model";
import {LineItemsPanel} from "../components/LineItemsPanel";
import '../RequestEntry/RequestEntry.scss';
import {ActionURL, Filter, getServerContext} from "@labkey/api";
import produce, {Draft} from "immer";
import {getData, submitRequest} from "../actions";

export const App : FC = memo(() => {

    const [requestOrderModel, setRequestOrderModel] = useState<RequestOrderModel>(RequestOrderModel.create());
    const [lineItems, setLineItems] = useState<Array<LineItemModel>>([LineItemModel.create()]);
    const [lineItemErrorMsg, setLineItemErrorMsg] = useState<string>();
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [requestId, setRequestId] = useState<string>();

    //equivalent to componentDidMount and componentDidUpdate (if with dependencies, then equivalent to componentDidUpdate)
    useEffect(() => {

        // is fired on component mount
        const reqId = ActionURL.getParameter('requestId');
        setRequestId(reqId);
        if (reqId)
        {
            //get ehr_purchasing.purchasingRequests data
            const filter = [Filter.create('requestId', reqId)];
            getData('ehr_purchasing', 'purchasingRequests', 'rowId, requestId, vendorId, account, otherAcctAndInves, shippingInfoId, shippingAttentionTo, justification, comments', undefined, filter).then(vals => {
                setRequestOrderModel(RequestOrderModel.create({
                    rowId: vals[0].rowId,
                    account: vals[0].account,
                    accountOther: vals[0].otherAcctAndInves,
                    vendor: vals[0].vendorId,
                    // newVendor?: VendorModel = VendorModel.create();
                    purpose: vals[0].justification,
                    shippingDestination: vals[0].shippingInfoId, //rowId of ehr_purchasing.shippingInfo
                    deliveryAttentionTo: vals[0].shippingAttentionTo,
                    comments: vals[0].comments
                }));
            });
            //get ehr_purchasing.lineItems data
            getData('ehr_purchasing', 'lineItems', 'rowId, item, itemUnitId, controlledSubstance, quantity, unitCost, itemStatusId', undefined, filter).then(vals => {
                let lineItems = vals.map(val => {
                   return LineItemModel.create({
                        rowId: val.rowId,
                        item: val.item,
                        controlledSubstance: val.controlledSubstance,
                        itemUnit: val.itemUnitId,
                        quantity: val.quantity,
                        unitCost: val.unitCost,
                        status: val.itemStatusId
                    });
                });
                setLineItems(lineItems);
            });
        }
        else {
            getData('core', 'qcState', 'RowId, Label').then(vals => {
                const idx = vals.findIndex(qcstate => qcstate['Label'] === 'Review Pending');
                setRequestOrderModel(RequestOrderModel.create({qcState: vals[idx].RowId}));
                setLineItems([LineItemModel.create({qcState: vals[idx].RowId})]);
            });
        }
    }, []);

    useEffect(() => {
        // is fired on component mount
        window.addEventListener('beforeunload', handleWindowBeforeUnload);

        // is fired on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleWindowBeforeUnload);
        }
    }, [isDirty]);

    const handleWindowBeforeUnload = useCallback((event) => {
        if (isDirty) {
            event.returnValue = 'Changes you made may not be saved.';
        }
    }, [isDirty]);

    const requestOrderModelChange = useCallback((model:RequestOrderModel)=> {
        setRequestOrderModel(model);
        setIsDirty(true);
    }, [requestOrderModel]);

    const lineItemsChange = useCallback((lineItemArray : Array<LineItemModel>)=> {

        const numOfErrors = lineItemArray.reduce(((count, item) => (item.errors?.length > 0) ? (count + 1) : count), 0);

        if (numOfErrors == 0) {
            setLineItemErrorMsg(undefined);
        }
        setLineItems(lineItemArray);
        setIsDirty(true);

    }, [lineItems]);

    const onCancelBtnHandler = useCallback((event) => {
        setIsDirty(false);
        event.preventDefault();
        const returnUrl = ActionURL.getParameter('returnUrl');
        window.location.href = returnUrl || ActionURL.buildURL('project', 'begin', getServerContext().container.path);
    }, [isDirty]);

    const onSaveBtnHandler = useCallback((event) => {

        //if required values are not provided, then set errorMessage for the panel and errors on each field to highlight boxes in red
        let msg = "Unable to submit request, missing required field";

        //catch errors for Request Order panel
        const requestOrderErrors = [];
        if (!requestOrderModel.account) {
            requestOrderErrors.push({fieldName: 'account'});
        }
        if (requestOrderModel.account === 'Other' && !requestOrderModel.accountOther) {
            requestOrderErrors.push({fieldName: 'accountOther'});
        }
        if (!requestOrderModel.vendor) {
            requestOrderErrors.push({fieldName: 'vendor'});
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
                draft['errorMsg'] = requestOrderErrors?.length > 1 ? (msg + 's.') : (msg + '.');
                draft['errors'] = requestOrderErrors;
            });
            setRequestOrderModel(updatedRequestOrderObj);
        }

        // catch errors for Line Items panel
        let hasLineItemError = false;
        let lineItemsErrorCount = 0;
        for (let i = 0; i < lineItems.length; i++) {
            const lineItemErrors = [];

            if (!lineItems[i].item) {
                lineItemErrors.push({fieldName: 'item'});
            }
            if (!lineItems[i].itemUnit) {
                lineItemErrors.push({fieldName: 'itemUnit'});
            }
            if (!lineItems[i].unitCost) {
                lineItemErrors.push({fieldName: 'unitCost'});
            }
            if (!lineItems[i].quantity) {
                lineItemErrors.push({fieldName: 'quantity'});
            }

            if (lineItemErrors.length > 0) {
                lineItemsErrorCount += lineItemErrors.length;
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
            setLineItemErrorMsg(lineItemsErrorCount > 1 ? (msg + 's.') : (msg + '.'));
        }

        //if no errors then save
        if (requestOrderErrors.length == 0 && !hasLineItemError) {
            setIsDirty(false);
            setIsSaving(true);
            event.preventDefault();

            submitRequest(requestOrderModel, lineItems, requestId).then(r => {
                if (r.success) {
                    //navigate to purchasing overview grid/main page
                    window.location.href = ActionURL.buildURL('project', 'begin', getServerContext().container.path)
                }
            });
        }

    }, [requestOrderModel, lineItems, isSaving]);

    return (
        <>
            <RequestOrderPanel onInputChange={requestOrderModelChange} model={requestOrderModel}/>
            <LineItemsPanel onChange={lineItemsChange} lineItems={lineItems} errorMsg={lineItemErrorMsg} hasRequestId={!!requestId}/>
            <button disabled={isSaving} className='btn btn-default' id='cancel' name='cancel' onClick={onCancelBtnHandler}>Cancel</button>
            {
                !isSaving &&
                <button
                        className='btn btn-primary pull-right'
                        id='submitForReview'
                        name='submitForReview'
                        onClick={onSaveBtnHandler}>Submit for Review
                </button>
            }
            {
                isSaving &&
                <button disabled className='btn btn-primary pull-right'>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                    Saving...
                </button>
            }
        </>
    )
})