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
import {LineItemModel, RequestOrderModel, PurchaseAdminModel, DocumentAttachmentModel, SavedFileModel} from "../model";
import {LineItemsPanel} from "../components/LineItemsPanel";
import '../RequestEntry/RequestEntry.scss';
import {ActionURL, Filter, getServerContext, PermissionTypes, Security} from "@labkey/api";
import produce, {Draft} from "immer";
import {getData, getSavedFiles, submitRequest} from "../actions";
import {PurchaseAdminPanel} from "../components/PurchaseAdminPanel";
import {DocumentAttachmentPanel} from "../components/DocumentAttachmentPanel";
import {PURCHASING_REQUEST_ATTACHMENTS_DIR} from "../constants";
import {Alert} from "@labkey/components";

export const App : FC = memo(() => {

    const [requestOrderModel, setRequestOrderModel] = useState<RequestOrderModel>(RequestOrderModel.create());
    const [purchaseAdminModel, setPurchaseAdminModel] = useState<PurchaseAdminModel>(PurchaseAdminModel.create());
    const [lineItems, setLineItems] = useState<Array<LineItemModel>>([LineItemModel.create()]);
    const [lineItemRowsToDelete, setLineItemRowsToDelete] = useState<Array<number>>([]);
    const [documentAttachmentModel, setDocumentAttachmentModel] = useState<DocumentAttachmentModel>(DocumentAttachmentModel.create());
    const [lineItemErrorMsg, setLineItemErrorMsg] = useState<string>();
    const [globalErrorMsg, setGlobalErrorMsg] = useState<string>();
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [requestId, setRequestId] = useState<string>();
    const [hasPurchasingAdminPermission, setHasPurchasingAdminPermission] = useState<boolean>(false);
    const [permissionError, setPermissionError] = useState<string>();

    //equivalent to componentDidMount and componentDidUpdate (if with dependencies, then equivalent to componentDidUpdate)
    useEffect(() => {

        // is fired on component mount
        const reqRowId = ActionURL.getParameter('requestRowId');
        setRequestId(reqRowId);
        Security.getUserPermissions({
            containerPath: getServerContext().container.path,
            success: (data) => {
                const hasPerm = data.container.effectivePermissions.indexOf(PermissionTypes.Admin) > -1
                setHasPurchasingAdminPermission(hasPerm);
            },
            failure: (error) => {
                setPermissionError(error.exception);
                setHasPurchasingAdminPermission(false);
            }
        });
        if (reqRowId)
        {
            //get ehr_purchasing.purchasingRequests data
            const filter = [Filter.create('rowId', reqRowId)];
            getData('ehr_purchasing', 'purchasingRequests', '*', undefined, filter).then(vals => {
                setRequestOrderModel(RequestOrderModel.create({
                    rowId: vals[0].rowId,
                    account: !!vals[0].otherAcctAndInves ? "Other" : vals[0].account,
                    otherAcctAndInves: !!vals[0].otherAcctAndInves ? vals[0].otherAcctAndInves : undefined,
                    vendorId: vals[0].vendorId,
                    justification: vals[0].justification,
                    shippingInfoId: vals[0].shippingInfoId,
                    shippingAttentionTo: vals[0].shippingAttentionTo,
                    comments: vals[0].comments,
                    otherAcctAndInvesWarning: vals[0].otherAcctAndInves ? "Warning: Please add 'Account & Principal Investigator' value '" + vals[0].otherAcctAndInves + "' into the system." : undefined
                }));
                setPurchaseAdminModel(PurchaseAdminModel.create({
                    assignedTo: vals[0].assignedTo,
                    creditCardOption: vals[0].creditCardOptionId,
                    qcState: vals[0].qcState,
                    program: vals[0].program,
                    confirmationNum: vals[0].confirmationNum,
                    invoiceNum: vals[0].invoiceNum,
                    orderDate: new Date(vals[0].orderDate),
                    cardPostDate: new Date(vals[0].cardPostDate)
                }));
            });

            //get ehr_purchasing.lineItems data
            const requestRowIdFilter = [Filter.create('requestRowId', reqRowId)];
            getData('ehr_purchasing', 'lineItems', 'rowId, requestRowId, item, itemUnitId, controlledSubstance, quantity, unitCost, itemStatusId', undefined, requestRowIdFilter).then(vals => {
                let lineItems = vals.map(val => {
                   return LineItemModel.create({
                        rowId: val.rowId,
                        requestRowId: reqRowId,
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

            //get saved files
            const dir = PURCHASING_REQUEST_ATTACHMENTS_DIR + "/" + reqRowId;
            getSavedFiles(ActionURL.getContainer(), dir, false).then((files:Array<SavedFileModel>) => {
                if (files?.length > 0) {
                    const updatedModel = produce(documentAttachmentModel, (draft: Draft<DocumentAttachmentModel>) => {
                        draft['savedFiles'] = files;
                    });
                    setDocumentAttachmentModel(updatedModel);
                }
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

    const purchaseAdminModelChange = useCallback((model:PurchaseAdminModel)=> {
        setPurchaseAdminModel(model);
        setIsDirty(true);
    }, [purchaseAdminModel]);

    const documentAttachmentChange = useCallback((model:DocumentAttachmentModel)=> {
        setDocumentAttachmentModel(model);
        setIsDirty(true);
    }, [documentAttachmentModel]);

    const lineItemsChange = useCallback((lineItemArray : Array<LineItemModel>, rowIdToDelete?: number)=> {

        const numOfErrors = lineItemArray.reduce(((count, item) => (item.errors?.length > 0) ? (count + 1) : count), 0);

        if (numOfErrors == 0) {
            setLineItemErrorMsg(undefined);
        }
        setLineItems(lineItemArray);
        setIsDirty(true);

        if (rowIdToDelete) {
            const updatedRowsToDelete = produce(lineItemRowsToDelete, (draft: Draft<Array<number>>) => {
                draft.push(rowIdToDelete);
            });
            setLineItemRowsToDelete(updatedRowsToDelete);
        }
    }, [lineItems, lineItemRowsToDelete]);

    const onCancelBtnHandler = useCallback((event) => {
        setIsDirty(false);
        event.preventDefault();
        const returnUrl = ActionURL.getParameter('returnUrl');
        window.location.href = returnUrl || ActionURL.buildURL('project', 'begin', getServerContext().container.path);
    }, [isDirty]);

    const onSaveBtnHandler = useCallback((event) => {

        setIsDirty(false);
        setIsSaving(true);
        event.preventDefault();

        submitRequest(requestOrderModel,
            lineItems,
            !!requestId ? purchaseAdminModel : undefined,
            (documentAttachmentModel.filesToUpload?.size > 0 || documentAttachmentModel.savedFiles?.length > 0) ? documentAttachmentModel : undefined,
            lineItemRowsToDelete)
            .then(r => {
                if (r.success || r.fileNames?.length > 0)
                {
                    //navigate to purchasing overview grid/main page
                    window.location.href = ActionURL.buildURL('project', 'begin', getServerContext().container.path)
                }
            })
            .catch(reject => {

                setIsSaving(false);

                //handle errors from the server
                if (reject?.errors?.length > 0) {
                    let msg = "Unable to submit request, missing required field";
                    let hasLineItemError = false;
                    let lineItemsErrorCount = 0;
                    let errorOnIndex = -1;

                    const requestOrderErrors = [];
                    reject.errors.map((error) => {
                        if (error.errors?.length > 0) {
                            const lineItemErrors = [];
                            error.errors.map((error) => {

                                // Errors for Request Order panel
                                if (error.field === "account") {
                                    requestOrderErrors.push({fieldName: 'account', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "otherAcctAndInves") {
                                    requestOrderErrors.push({
                                        fieldName: 'otherAcctAndInves',
                                        errorMessage: error.msg || error.message
                                    });
                                }
                                else if (error.field === "vendorId") {
                                    requestOrderErrors.push({fieldName: 'vendorId', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "justification") {
                                    requestOrderErrors.push({
                                        fieldName: 'justification',
                                        errorMessage: error.msg || error.message
                                    });
                                }
                                else if (error.field === "shippingInfoId") {
                                    requestOrderErrors.push({
                                        fieldName: 'shippingInfoId',
                                        errorMessage: error.msg || error.message
                                    });
                                }
                                else if (error.field === "shippingAttentionTo") {
                                    requestOrderErrors.push({
                                        fieldName: 'shippingAttentionTo',
                                        errorMessage: error.msg || error.message
                                    });
                                }

                                // Errors for Line Items panel
                                // Note: server throws error on the first sign on error, so will only see errors on the one
                                // line item that error actually occurred on, and will not show all the other line items that might have errors
                                if (error.field === "item") {
                                    lineItemErrors.push({fieldName: 'item', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "itemUnit") {
                                    lineItemErrors.push({fieldName: 'itemUnit', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "unitCost") {
                                    lineItemErrors.push({fieldName: 'unitCost', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "quantity") {
                                    lineItemErrors.push({fieldName: 'quantity', errorMessage: error.msg || error.message});
                                }
                                else if (error.field === "rowIndex") {
                                    const txt = error.msg || error.message;//this is just the row index set on server side to identify error on specific line item index
                                    errorOnIndex = parseInt(txt, 10);
                                }
                            });
                            if (lineItemErrors.length > 0 && errorOnIndex >= 0) {
                                lineItemsErrorCount += lineItemErrors.length;
                                const updatedLineItem = produce(lineItems[errorOnIndex], (draft: Draft<LineItemModel>) => {
                                    draft['errors'] = lineItemErrors;
                                });
                                const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
                                    draft[errorOnIndex] = updatedLineItem;
                                });
                                setLineItems(updatedLineItems);
                                hasLineItemError = true;
                            }
                        }
                    });
                    if (requestOrderErrors.length > 0) {
                        const updatedRequestOrderObj = produce(requestOrderModel, (draft: Draft<RequestOrderModel>) => {
                            draft['errorMsg'] = requestOrderErrors?.length > 1 ? (msg + 's.') : (msg + '.');
                            draft['errors'] = requestOrderErrors;
                        });
                        setRequestOrderModel(updatedRequestOrderObj);
                    }

                    if (hasLineItemError) {
                        setLineItemErrorMsg(lineItemsErrorCount > 1 ? (msg + 's.') : (msg + '.'));
                    }
                }
                else if (reject?.exception) {
                    setGlobalErrorMsg(reject.exception);
                }
            });
    }, [requestOrderModel, lineItems, lineItemRowsToDelete, purchaseAdminModel, documentAttachmentModel, isSaving]);

    return (
        <>
            {
                //has to be a purchasing admin to update the existing request
                ((!!requestId && !hasPurchasingAdminPermission) || !!permissionError) &&
                <Alert>You do not have sufficient permissions to update this request.</Alert>
            }
            {
                //display ui for purchasing admins to update existing request or requesters to enter new request
                ((!!requestId && hasPurchasingAdminPermission) || (requestId === undefined)) &&
                <>
                    <RequestOrderPanel onInputChange={requestOrderModelChange} model={requestOrderModel}/>
                    {
                        !!requestId &&
                        <PurchaseAdminPanel onInputChange={purchaseAdminModelChange} model={purchaseAdminModel} />
                    }
                    <DocumentAttachmentPanel onInputChange={documentAttachmentChange} model={documentAttachmentModel}/>
                    <LineItemsPanel onChange={lineItemsChange} lineItems={lineItems} errorMsg={lineItemErrorMsg} hasRequestId={!!requestId}/>
                    <button disabled={isSaving} className='btn btn-default' id='cancel' name='cancel' onClick={onCancelBtnHandler}>Cancel</button>
                    {
                        !isSaving &&
                        <>
                            <button
                                    className='btn btn-primary pull-right'
                                    id={requestId ? 'save' : 'submitForReview'}
                                    name={requestId ? 'save' : 'submitForReview'}
                                    onClick={onSaveBtnHandler}>{requestId ? 'Submit' : 'Submit for Review'}
                            </button>
                        </>
                    }
                    {
                        isSaving &&
                        <button disabled className='btn btn-primary pull-right'>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                            Saving...
                        </button>
                    }
                    {
                        requestOrderModel.otherAcctAndInvesWarning &&
                        <div className='other-account-warning alert alert-warning'>
                            {requestOrderModel.otherAcctAndInvesWarning}
                        </div>
                    }
                    {
                        (!!requestOrderModel.errorMsg) &&
                        requestOrderModel?.errors?.map((error) => {
                            return <div className='alert alert-danger'> {error.errorMessage} </div>
                        })
                    }
                    {
                        (!!lineItemErrorMsg) &&
                        lineItems?.map((lineItem) => {
                            return lineItem?.errors?.map((error) => {
                                return <div className='alert alert-danger'> {error.errorMessage} </div>
                            })
                        })
                    }
                    {
                        (!!globalErrorMsg) && <div className='alert alert-danger'> {globalErrorMsg} </div>
                    }
                </>
            }
        </>
    )
})