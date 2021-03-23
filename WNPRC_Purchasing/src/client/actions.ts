import { Query, Ajax, Utils, ActionURL, Filter, getServerContext } from '@labkey/api';

import { getWebDavFiles, uploadWebDavFile, WebDavFile } from '@labkey/components';

import {
    DocumentAttachmentModel,
    LineItemModel,
    PurchaseAdminModel,
    RequestOrderModel,
    SavedFileModel,
    VendorModel,
} from './model';
import { PURCHASING_REQUEST_ATTACHMENTS_DIR } from './constants';

export function getData(
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

export async function submitRequest(
    requestOrder: RequestOrderModel,
    lineItems: LineItemModel[],
    purchasingAdminModel?: PurchaseAdminModel,
    documentAttachmentModel?: DocumentAttachmentModel,
    lineItemsToDelete?: number[]
): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('WNPRC_Purchasing', 'submitRequest.api'),
            method: 'POST',
            jsonData: {
                rowId: requestOrder.rowId,
                account: requestOrder.account !== 'Other' ? requestOrder.account : -1,
                accountOther: requestOrder.otherAcctAndInves,
                vendor: requestOrder.vendorId !== 'Other' ? requestOrder.vendorId : undefined,
                purpose: requestOrder.justification,
                shippingDestination: requestOrder.shippingInfoId,
                shippingAttentionTo: requestOrder.shippingAttentionTo,
                comments: requestOrder.comments,
                qcState: purchasingAdminModel?.qcState || requestOrder.qcState,
                assignedTo: purchasingAdminModel?.assignedTo,
                creditCardOption: purchasingAdminModel?.creditCardOption,
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
