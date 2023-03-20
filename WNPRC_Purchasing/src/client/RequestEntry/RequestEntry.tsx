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
import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import produce, { Draft } from 'immer';
import { ActionURL, Filter, getServerContext } from '@labkey/api';
import { Alert, LoadingSpinner } from '@labkey/components';

import { RequestOrderPanel } from '../components/RequestOrderPanel';
import {
    LineItemModel,
    RequestOrderModel,
    PurchaseAdminModel,
    DocumentAttachmentModel,
    QCStateModel,
} from '../model';
import { LineItemsPanel } from '../components/LineItemsPanel';
import { getData, getSavedFiles, submitRequest } from '../actions';
import { PurchaseAdminPanel } from '../components/PurchaseAdminPanel';
import { DocumentAttachmentPanel } from '../components/DocumentAttachmentPanel';
import { PURCHASING_REQUEST_ATTACHMENTS_DIR, PROGRAM_DEFAULT_VAL } from '../constants';
import './RequestEntry.scss';

export const App: FC = memo(() => {
    const [requestOrderModel, setRequestOrderModel] = useState<RequestOrderModel>(RequestOrderModel.create());
    const [purchaseAdminModel, setPurchaseAdminModel] = useState<PurchaseAdminModel>(PurchaseAdminModel.create());
    const [lineItems, setLineItems] = useState<LineItemModel[]>([LineItemModel.create()]);
    const [qcStates, setQCStates] = useState<QCStateModel[]>([QCStateModel.create()]);
    const [lineItemRowsToDelete, setLineItemRowsToDelete] = useState<number[]>([]);
    const [documentAttachmentModel, setDocumentAttachmentModel] = useState<DocumentAttachmentModel>(
        DocumentAttachmentModel.create()
    );
    const [lineItemErrorMsg, setLineItemErrorMsg] = useState<string>();
    const [globalErrorMsg, setGlobalErrorMsg] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [requestId, setRequestId] = useState<string>();
    const [requester, setRequester] = useState<number>();
    const [rejectQCStateId, setRejectQCStateId] = useState<number>();
    const [isReorder, setIsReorder] = useState<boolean>(ActionURL.getParameter('isReorder') || false);
    const { isAdmin: hasPurchasingAdminPermission, canUpdate: hasPurchasingUpdatePermission, canInsert: hasPurchasingInsertPermission } = getServerContext().user;
    const [isRequester, setIsRequester] = useState<boolean>();
    const [isReceiver, setIsReceiver] = useState<boolean>();
    const [isPurchaseAdmin, setIsPurchaseAdmin] = useState<boolean>();

    // equivalent to componentDidMount and componentDidUpdate (if with dependencies, then equivalent to componentDidUpdate)
    useEffect(() => {
        // is fired on component mount
        const reqRowId = ActionURL.getParameter('requestRowId');
        setRequestId(reqRowId);

        setIsRequester(hasPurchasingInsertPermission && !hasPurchasingAdminPermission && !hasPurchasingUpdatePermission);
        setIsReceiver(hasPurchasingUpdatePermission && !hasPurchasingAdminPermission);
        setIsPurchaseAdmin(hasPurchasingAdminPermission);

        (async () => {
            //get QCStates
            const qcStateVals = await getData('core', 'qcState', 'RowId, Label');
            const states = qcStateVals.map(val => {
                if (val)
                {
                    return QCStateModel.create({
                        rowId: val.RowId,
                        label: val.Label
                    });
                }
            });
            setQCStates(states);
            const rejectQCState = qcStateVals.filter((qcState) => {
                return qcState.Label === 'Request Rejected';
            })[0]?.RowId;

            setRejectQCStateId(rejectQCState);

            if (reqRowId)
            {
                // get ehr_purchasing.purchasingRequests data
                const filter = [Filter.create('rowId', reqRowId)];
                const requestOrderVals = await getData('ehr_purchasing', 'purchasingRequests', '*', undefined, filter);
                requestOrderVals.map(val => {
                    if (val) {
                        let acctVal = requestOrderVals[0].otherAcctAndInves ? 'Other' : requestOrderVals[0].account;
                        if (isReorder) {
                            acctVal = "";
                        }

                        let otherAcctVal = requestOrderVals[0].otherAcctAndInves || undefined;
                        if (isReorder) {
                            otherAcctVal = undefined;
                        }

                        let pendingState = undefined;
                        if (isReorder) {
                            pendingState = states.filter((qcState) => {
                                return qcState.label === 'Review Pending';
                            })[0].rowId;
                        }

                        setRequestOrderModel(
                            RequestOrderModel.create({
                                rowId: requestOrderVals[0].rowId,
                                account: acctVal,
                                otherAcctAndInves: otherAcctVal,
                                vendorId: requestOrderVals[0].vendorId,
                                justification: requestOrderVals[0].justification,
                                shippingInfoId: requestOrderVals[0].shippingInfoId,
                                shippingAttentionTo: requestOrderVals[0].shippingAttentionTo,
                                comments: requestOrderVals[0].comments,
                                otherAcctAndInvesWarning: requestOrderVals[0].otherAcctAndInves
                                    ? "Warning: Please add 'Account & Principal Investigator' value '" +
                                    requestOrderVals[0].otherAcctAndInves +
                                    "' into the system."
                                    : undefined,
                            })
                        );

                        setPurchaseAdminModel(
                            PurchaseAdminModel.create({
                                assignedTo: isReorder ? "" : requestOrderVals[0].assignedTo,
                                paymentOption: isReorder ? "" : requestOrderVals[0].paymentOptionId,
                                qcState: isReorder ? pendingState : requestOrderVals[0].qcState,
                                rejectReason: isReorder ? "" : requestOrderVals[0].rejectReason,
                                program: isReorder ? PROGRAM_DEFAULT_VAL : requestOrderVals[0].program,
                                confirmationNum: isReorder ? "" : requestOrderVals[0].confirmationNum,
                                invoiceNum: isReorder ? "" : requestOrderVals[0].invoiceNum,
                                orderDate: isReorder ? "" : (requestOrderVals[0].orderDate ? new Date(requestOrderVals[0].orderDate) : null),
                                cardPostDate: isReorder ? "" : (requestOrderVals[0].cardPostDate ? new Date(requestOrderVals[0].cardPostDate) : null),
                            })
                        );
                    }
                    setRequester(requestOrderVals[0].createdBy);
                })

                // get ehr_purchasing.lineItems data
                const requestRowIdFilter = [Filter.create('requestRowId', reqRowId)];
                const lineItemVals = await getData(
                    'ehr_purchasing',
                    'lineItems',
                    'rowId, requestRowId, lineItemNumber, item, itemUnitId, controlledSubstance, quantity, quantityReceived, unitCost, itemStatusId',
                    'lineItemNumber',
                    requestRowIdFilter
                );

                const li = lineItemVals.map(val => {
                    if (val)
                    {
                        return LineItemModel.create({
                            rowId: val.rowId,
                            requestRowId: reqRowId,
                            lineItemNumber: val.lineItemNumber,
                            item: val.item,
                            controlledSubstance: val.controlledSubstance,
                            itemUnit: val.itemUnitId,
                            quantity: val.quantity,
                            quantityReceived: isReorder ? 0 : val.quantityReceived,
                            unitCost: val.unitCost,
                            status: val.itemStatusId,
                        });
                    }
                });
                setLineItems(li);
                setIsLoading(false);

                // get saved files
                const dir = PURCHASING_REQUEST_ATTACHMENTS_DIR + '/' + reqRowId;
                const files = await getSavedFiles(ActionURL.getContainer(), dir, false);
                if (files?.length > 0)
                {
                    const updatedModel = produce(documentAttachmentModel, (draft: Draft<DocumentAttachmentModel>) => {
                        draft['savedFiles'] = files;
                    });
                    setDocumentAttachmentModel(updatedModel);
                }
            }
            else
            {
                const qcStateVals = await getData('core', 'qcState', 'RowId, Label');
                const idx = qcStateVals.findIndex(qcstate => qcstate['Label'] === 'Review Pending');
                setRequestOrderModel(RequestOrderModel.create({qcState: qcStateVals[idx].RowId}));
                setLineItems([LineItemModel.create({qcState: qcStateVals[idx].RowId, lineItemNumber: 1})]);
                setIsLoading(false);
            }
        })();
    }, [setIsReorder, isReorder]);

    const handleWindowBeforeUnload = useCallback(
        event => {
            if (isDirty) {
                event.returnValue = 'Changes you made may not be saved.';
            }
        },
        [isDirty]
    );

    useEffect(() => {
        // is fired on component mount
        window.addEventListener('beforeunload', handleWindowBeforeUnload);

        // is fired on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleWindowBeforeUnload);
        };
    }, [isDirty]);

    const requestOrderModelChange = useCallback(
        (model: RequestOrderModel) => {
            setRequestOrderModel(model);
            setIsDirty(true);
        },
        [requestOrderModel]
    );

    const purchaseAdminModelChange = useCallback(
        (model: PurchaseAdminModel) => {
            setPurchaseAdminModel(model);
            setIsDirty(true);
        },
        [purchaseAdminModel]
    );

    const documentAttachmentChange = useCallback(
        (model: DocumentAttachmentModel) => {
            setDocumentAttachmentModel(model);
            setIsDirty(true);
        },
        [documentAttachmentModel]
    );

    const lineItemsChange = useCallback(
        (lineItemArray: LineItemModel[], rowIdToDelete?: number) => {
            const numOfErrors = lineItemArray.reduce((count, item) => (item.errors?.length > 0 ? count + 1 : count), 0);

            if (numOfErrors === 0) {
                setLineItemErrorMsg(undefined);
            }
            setLineItems(lineItemArray);
            setIsDirty(true);

            if (rowIdToDelete && !isReorder) {
                const updatedRowsToDelete = produce(lineItemRowsToDelete, (draft: Draft<number[]>) => {
                    draft.push(rowIdToDelete);
                });
                setLineItemRowsToDelete(updatedRowsToDelete);
            }
        },
        [lineItems, lineItemRowsToDelete]
    );

    const onCancelBtnHandler = useCallback(
        event => {
            setIsDirty(false);
            event.preventDefault();
            const returnUrl = ActionURL.getParameter('returnUrl');
            window.location.href = returnUrl || ActionURL.buildURL('project', 'begin', getServerContext().container.path);

        },
        [isDirty, requestId]
    );

    const onReorderBtnHandler = useCallback(
        event => {
            setIsReorder(true);
        },
        [isReorder]
    );

    const onSaveBtnHandler = useCallback(
        event => {
            setIsDirty(false);
            setIsSaving(true);
            event.preventDefault();

            submitRequest(
                requestOrderModel,
                lineItems,
                qcStates,
                rejectQCStateId,
                requestId ? purchaseAdminModel : undefined,
                documentAttachmentModel.filesToUpload?.size > 0 || documentAttachmentModel.savedFiles?.length > 0
                    ? documentAttachmentModel
                    : undefined,
                lineItemRowsToDelete,
                ActionURL.getParameter('isNewRequest'),
                isReorder,
            )
                .then(r => {
                    if (r.success) {
                        const returnUrl = ActionURL.getParameter('returnUrl');
                        window.location.href = returnUrl || ActionURL.buildURL('project', 'begin', getServerContext().container.path);
                    }
                })
                .catch(reject => {
                    setIsSaving(false);

                    // handle errors from the server
                    if (reject?.errors?.length > 0) {
                        const msg = 'Unable to submit request, missing required field';
                        let hasLineItemError = false;
                        let lineItemsErrorCount = 0;
                        let errorOnIndex = -1;

                        const requestOrderErrors = [];
                        reject.errors.map(error => {
                            if (error.errors?.length > 0) {
                                const lineItemErrors = [];
                                error.errors.map(err => {
                                    const errMsg = err.msg || err.message;

                                    // Errors for Request Order panel
                                    switch (err.field) {
                                        case 'account':
                                            requestOrderErrors.push({ fieldName: 'account', errorMessage: errMsg });
                                            break;
                                        case 'otherAcctAndInves':
                                            requestOrderErrors.push({
                                                fieldName: 'otherAcctAndInves',
                                                errorMessage: errMsg,
                                            });
                                            break;
                                        case 'vendorId':
                                            requestOrderErrors.push({ fieldName: 'vendorId', errorMessage: errMsg });
                                            break;
                                        case 'justification':
                                            requestOrderErrors.push({
                                                fieldName: 'justification',
                                                errorMessage: errMsg,
                                            });
                                            break;
                                        case 'shippingInfoId':
                                            requestOrderErrors.push({
                                                fieldName: 'shippingInfoId',
                                                errorMessage: errMsg,
                                            });
                                            break;
                                        case 'shippingAttentionTo':
                                            requestOrderErrors.push({
                                                fieldName: 'shippingAttentionTo',
                                                errorMessage: errMsg,
                                            });
                                            break;

                                        // Errors for Line Items panel
                                        // Note: server throws error on the first sign on error, so will only see errors on the one
                                        // line item that error actually occurred on, and will not show all the other line items that might have errors
                                        case 'item':
                                            lineItemErrors.push({ fieldName: 'item', errorMessage: errMsg });
                                            break;
                                        case 'itemUnit':
                                            lineItemErrors.push({ fieldName: 'itemUnit', errorMessage: errMsg });
                                            break;
                                        case 'unitCost':
                                            lineItemErrors.push({ fieldName: 'unitCost', errorMessage: errMsg });
                                            break;
                                        case 'quantity':
                                            lineItemErrors.push({ fieldName: 'quantity', errorMessage: errMsg });
                                            break;
                                        case 'quantityReceived':
                                            lineItemErrors.push({ fieldName: 'quantityReceived', errorMessage: errMsg });
                                            break;
                                        case 'rowIndex':
                                            const txt = errMsg; // this is just the row index set on server side to identify error on specific line item index
                                            errorOnIndex = parseInt(txt, 10);
                                            break;
                                    }
                                });
                                if (lineItemErrors.length > 0 && errorOnIndex >= 0) {
                                    lineItemsErrorCount += lineItemErrors.length;
                                    const updatedLineItem = produce(
                                        lineItems[errorOnIndex],
                                        (draft: Draft<LineItemModel>) => {
                                            draft['errors'] = lineItemErrors;
                                        }
                                    );
                                    const updatedLineItems = produce(lineItems, (draft: Draft<LineItemModel>) => {
                                        draft[errorOnIndex] = updatedLineItem;
                                    });
                                    setLineItems(updatedLineItems);
                                    hasLineItemError = true;
                                }
                            }
                        });
                        if (requestOrderErrors.length > 0) {
                            const updatedRequestOrderObj = produce(
                                requestOrderModel,
                                (draft: Draft<RequestOrderModel>) => {
                                    draft['errorMsg'] = requestOrderErrors?.length > 1 ? msg + 's.' : msg + '.';
                                    draft['errors'] = requestOrderErrors;
                                }
                            );
                            setRequestOrderModel(updatedRequestOrderObj);
                        }

                        if (hasLineItemError) {
                            let lineItemErrMsg = "Unable to submit request, ";
                            let negQuantityErrMsg = "";

                            lineItems?.forEach((lineItem) => {
                                if (lineItem.quantity < 0 || lineItem.quantityReceived < 0)
                                    negQuantityErrMsg += "invalid quantity"
                            });

                            let missingReqFieldCount = 0;
                            let missingReqFieldMsg = "missing required field";

                            if (lineItems?.length > 0) {
                                if (!lineItems[errorOnIndex].item)
                                    ++missingReqFieldCount;
                                if (!lineItems[errorOnIndex].itemUnit)
                                    ++missingReqFieldCount;
                                if (!lineItems[errorOnIndex].quantity)
                                    ++missingReqFieldCount;
                                if (!lineItems[errorOnIndex].unitCost)
                                    ++missingReqFieldCount;
                            }

                            if (missingReqFieldCount > 0) {
                                lineItemErrMsg = missingReqFieldCount > 1 ? (lineItemErrMsg + missingReqFieldMsg + 's') : (lineItemErrMsg + missingReqFieldMsg)
                            }
                            if (missingReqFieldCount > 0 && negQuantityErrMsg.length > 0) {
                                lineItemErrMsg += " & ";
                            }
                            if (negQuantityErrMsg.length > 0) {
                                lineItemErrMsg += negQuantityErrMsg;
                            }
                            setLineItemErrorMsg(lineItemErrMsg + ".");
                        }
                    } else if (reject?.exception) {
                        setGlobalErrorMsg(reject.exception);
                    }
                });
        },
        [requestOrderModel, lineItems, lineItemRowsToDelete, purchaseAdminModel, documentAttachmentModel, isSaving]
    );

    function getLayout()
    {
        if (isLoading || !getServerContext()) {
            return <LoadingSpinner/>
        }
        else if (!isLoading && requestId && (!hasPurchasingUpdatePermission && hasPurchasingInsertPermission && !hasPurchasingAdminPermission && getServerContext().user.id !== requester))
            return <Alert>You do not have sufficient permissions to update this request.</Alert>

        // display ui for purchasing editors to update existing request or requesters to enter new request or requesters to see a read only view of the existing request
        else if (!isLoading && (requestId && hasPurchasingUpdatePermission) || requestId === undefined || (requestId && hasPurchasingInsertPermission && getServerContext().user.id === requester))
        {
            return (
                <>
                <RequestOrderPanel
                    onInputChange={requestOrderModelChange}
                    model={requestOrderModel}
                    hasRequestId={!!requestId}
                    isRequester={isRequester}
                    isAdmin={isPurchaseAdmin}
                    isReceiver={isReceiver}
                    isReorder={isReorder}
                />
                {
                    requestId && hasPurchasingAdminPermission && (
                        <PurchaseAdminPanel
                            onInputChange={purchaseAdminModelChange}
                            model={purchaseAdminModel}
                            requestRejected={rejectQCStateId == purchaseAdminModel.qcState}
                        />
                    )
                }
                <DocumentAttachmentPanel
                    onInputChange={documentAttachmentChange}
                    model={documentAttachmentModel}
                    isReorder={isReorder}
                />
                <LineItemsPanel
                    onChange={lineItemsChange}
                    lineItems={lineItems}
                    errorMsg={lineItemErrorMsg}
                    hasRequestId={!!requestId}
                    isRequester={isRequester}
                    isAdmin={isPurchaseAdmin}
                    isReceiver={isReceiver}
                    isReorder={isReorder}
                />
                <button
                    disabled={isSaving}
                    className="btn btn-default"
                    id="cancel"
                    name="cancel"
                    onClick={onCancelBtnHandler}
                >
                    Cancel
                </button>
                    {
                        !isSaving && (
                            <>
                                <button
                                    disabled={requestId && !isReorder && !hasPurchasingUpdatePermission}
                                    className="btn btn-primary pull-right"
                                    id={requestId && !isReorder ? 'save' : 'submitForReview'}
                                    name={requestId && !isReorder ? 'save' : 'submitForReview'}
                                    onClick={onSaveBtnHandler}
                                >
                                    {requestId && !isReorder ? 'Submit' : 'Submit for Review'}
                                </button>
                                {
                                    (requestId && !isReorder && !isReceiver) && (
                                    <button
                                        className="btn btn-primary pull-right"
                                        style={{marginRight:'10px'}}
                                        id={'Reorder'}
                                        name={'Reorder'}
                                        onClick={onReorderBtnHandler}
                                    >
                                        {'Reorder'}
                                    </button>
                                    )
                                }
                            </>
                        )
                    }
                {
                    isSaving && (
                        <>
                            <button disabled className="btn btn-primary pull-right">
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                                Saving...
                            </button>
                            {
                                (requestId && !isReorder) &&
                                <button
                                        className="btn btn-primary pull-right"
                                        style={{marginRight: '10px'}}
                                        disabled={true}
                                >
                                    {'Reorder'}
                                </button>
                            }
                        </>


                    )
                }
                {
                    requestOrderModel.otherAcctAndInvesWarning && (
                        <div className="other-account-warning alert alert-warning">
                            {requestOrderModel.otherAcctAndInvesWarning}
                        </div>
                    )
                }
                {
                    !!requestOrderModel.errorMsg &&
                    requestOrderModel?.errors?.map(error => {
                        return <div className="alert alert-danger"> {error.errorMessage} </div>;
                    })
                }
                {
                    !!lineItemErrorMsg &&
                    lineItems?.map(lineItem => {
                        return lineItem?.errors?.map(error => {
                            return <div className="alert alert-danger"> {error.errorMessage} </div>;
                        });
                    })
                }
                {
                    !!globalErrorMsg && <div className="alert alert-danger"> {globalErrorMsg} </div>
                }
            </>)
        }
    }

    return (
        getLayout()
    );
});
