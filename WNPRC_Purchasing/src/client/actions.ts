import { Query, Ajax, Utils, ActionURL, Filter, getServerContext } from '@labkey/api';

import { getWebDavFiles, uploadWebDavFile, WebDavFile } from '@labkey/components';

import {
    DocumentAttachmentModel,
    LineItemModel,
    PurchaseAdminModel, QCStateModel,
    RequestOrderModel,
    SavedFileModel,
    VendorModel,
} from './model';
import { PURCHASING_REQUEST_ATTACHMENTS_DIR } from './constants';

export async function getData(
    schemaName: string,
    queryName: string,
    colNames: string,
    sort?: string,
    filter?: Filter.IFilter[]
): Promise<any> {
    return new Promise((resolve, reject) => {
        Query.selectRows({
            schemaName,
            queryName,
            columns: colNames,
            sort,
            filterArray: filter,
            success: function (results) {
                if (results?.rows) {
                    resolve(results.rows);
                }
            },
            failure: function (error) {
                reject(error);
            },
        });
    });
}

export async function getFolderAdmins(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('WNPRC_Purchasing', 'getFolderAdmins.api'),
            method: 'POST',
            success: Utils.getCallbackWrapper(response => {
               resolve(response.results);
            }),
            failure: Utils.getCallbackWrapper(
                error => {
                    console.error('Error getting folder admins.', error);
                    reject(error);
                },
                undefined,
                true
            ),
        });
    });
}

function getQCState(purchasingAdminModel: PurchaseAdminModel, requestOrder: RequestOrderModel, lineItems: LineItemModel[], qcStates: QCStateModel[])
{
    let qcState = purchasingAdminModel?.qcState || requestOrder.qcState;

    // check for the final/complete state
    let completeState = qcStates.filter((qcState) => {
        return qcState.label === 'Order Complete';
    });

    // if 'order complete' state is set, return.
    // Note: using double equals instead of triple to perform type coercion, qcState value is with "", and rowId value is without.
    if (completeState?.[0]?.rowId == qcState) {
        return qcState;
    }

    // otherwise, identify if all the line items are received
    let receivedCount = 0;
    lineItems.forEach((lineItem: LineItemModel)=> {
        if (lineItem.quantityReceived >= lineItem.quantity) {
            ++receivedCount;
        }
    });

    // if all the line items are received, set state to 'order received'
    if (receivedCount === lineItems.length) {
        let deliveredState = qcStates.filter((qcState) => {
            return qcState.label === 'Order Received';
        });
        qcState = deliveredState?.[0]?.rowId;
    }

    return qcState;
}

export async function submitRequest(
    requestOrder: RequestOrderModel,
    lineItems: LineItemModel[],
    qcStates: QCStateModel[],
    requestRejectId: number,
    purchasingAdminModel?: PurchaseAdminModel,
    documentAttachmentModel?: DocumentAttachmentModel,
    lineItemsToDelete?: number[],
    isNewRequest?: boolean,
    isReorder?: boolean
): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('WNPRC_Purchasing', 'submitRequest.api'),
            method: 'POST',
            jsonData: {
                isNewRequest: isNewRequest,
                isReorder: isReorder,
                rowId: requestOrder.rowId,
                account: requestOrder.account !== 'Other' ? requestOrder.account : -1,
                accountOther: requestOrder.otherAcctAndInves,
                vendor: requestOrder.vendorId !== 'Other' ? requestOrder.vendorId : undefined,
                purpose: requestOrder.justification,
                shippingDestination: requestOrder.shippingInfoId,
                shippingAttentionTo: requestOrder.shippingAttentionTo,
                comments: requestOrder.comments,
                qcState: getQCState(purchasingAdminModel, requestOrder, lineItems, qcStates),
                rejectReason: requestRejectId == purchasingAdminModel?.qcState ? purchasingAdminModel?.rejectReason : '',
                assignedTo: purchasingAdminModel?.assignedTo,
                paymentOption: purchasingAdminModel?.paymentOption,
                program: purchasingAdminModel?.program ? purchasingAdminModel.program : '4',
                confirmNum: purchasingAdminModel?.confirmationNum,
                invoiceNum: purchasingAdminModel?.invoiceNum,
                orderDate: purchasingAdminModel?.orderDate,
                cardPostDate: purchasingAdminModel?.cardPostDate,
                lineItems,
                lineItemsToDelete,
                hasNewVendor: !!(
                    requestOrder.vendorId === 'Other' && VendorModel.getDisplayString(requestOrder.newVendor)
                ),
                newVendorName: requestOrder.newVendor.vendorName,
                newVendorStreetAddress: requestOrder.newVendor.streetAddress,
                newVendorCity: requestOrder.newVendor.city,
                newVendorState: requestOrder.newVendor.state,
                newVendorCountry: requestOrder.newVendor.country,
                newVendorZip: requestOrder.newVendor.zip,
                newVendorPhoneNumber: requestOrder.newVendor.phoneNumber,
                newVendorFaxNumber: requestOrder.newVendor.faxNumber,
                newVendorEmail: requestOrder.newVendor.email,
                newVendorUrl: requestOrder.newVendor.url,
                newVendorNotes: requestOrder.newVendor.notes,
            },
            success: Utils.getCallbackWrapper(response => {
                if (documentAttachmentModel?.filesToUpload?.size > 0) {
                    uploadFiles(documentAttachmentModel, getServerContext().container.name, response.requestId).then(
                        (files: string[]) => {
                            const fileNames =
                                documentAttachmentModel?.savedFiles?.length > 0
                                    ? files.concat(
                                          documentAttachmentModel.savedFiles.map(
                                              (file: SavedFileModel) => file.fileName
                                          )
                                      )
                                    : files;
                            resolve({ success: fileNames?.length > 0 });
                        }
                    );
                } else {
                    resolve(response);
                }
            }),
            failure: Utils.getCallbackWrapper(
                error => {
                    console.error('Failed to submit request.', error);
                    reject(error);
                },
                undefined,
                true
            ),
        });
    });
}

function uploadFiles(model: DocumentAttachmentModel, container: string, requestId: number): any {
    return new Promise((resolve, reject) => {
        // Nothing to do here
        if (model.filesToUpload?.size === 0) {
            resolve(model.filesToUpload);
        }

        const dir = PURCHASING_REQUEST_ATTACHMENTS_DIR + (requestId ? '/' + requestId : '');
        const uploadedFiles = [];

        model.filesToUpload.map(fileToUpload => {
            if (fileToUpload) {
                uploadWebDavFile(fileToUpload, ActionURL.getContainer(), dir, true)
                    .then((name: string) => {
                        uploadedFiles.push(name);
                        if (uploadedFiles.length === model.filesToUpload.size) {
                            resolve(uploadedFiles);
                        }
                    })
                    .catch(reason => {
                        reject(reason);
                    });
            }
        }, this);
    });
}

export async function getSavedFiles(
    container: string,
    directory?: string,
    includeSubdirectories?: boolean
): Promise<SavedFileModel[]> {
    return new Promise((resolve, reject) => {
        getWebDavFiles(container, directory, includeSubdirectories)
            .then(response => {
                const displayFiles = response
                    .get('files')
                    .valueSeq()
                    .map((file: WebDavFile) => {
                        return { fileName: file.name, href: file.href };
                    });
                resolve(displayFiles.toArray());
            })
            .catch(response => {
                if (response) {
                    const msg = `Unable to load files in ${directory ? directory : 'root'}: ${response}`;
                    reject(msg);
                }
            });
    });
}
