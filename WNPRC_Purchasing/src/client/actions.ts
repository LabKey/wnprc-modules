import {Query, Ajax, Utils, ActionURL, Filter, getServerContext} from "@labkey/api";
import {DocumentAttachmentModel, LineItemModel, PurchaseAdminModel, RequestOrderModel, VendorModel} from "./model";
import {getWebDavFiles, uploadWebDavFile, WebDavFile} from '@labkey/components';
import {PURCHASING_REQUEST_ATTACHMENTS_DIR, FILE_ATTACHMENT_SEPARATOR, EHR_PURCHASING_SCHEMA_NAME} from "./constants";

export function getData(schemaName: string, queryName: string, colNames: string, sort?: string, filter?: Array<Filter.IFilter>) : Promise<any> {
    return new Promise((resolve, reject) => {
        Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            columns: colNames,
            sort: sort,
            filterArray: filter,
            success: function (results) {
                if (results && results.rows) {
                    resolve(results.rows);
                }
            }
        });
    })
}

export async function submitRequest (requestOrder: RequestOrderModel, lineItems: Array<LineItemModel>,
                                     purchasingAdminModel?: PurchaseAdminModel,
                                     documentAttachmentModel?: DocumentAttachmentModel,
                                     lineItemsToDelete?: Array<number>
                                     ) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('WNPRC_Purchasing', 'submitRequest.api'),
            method: 'POST',
            jsonData: {
                rowId: requestOrder.rowId,
                account: requestOrder.account !== 'Other' ? requestOrder.account : undefined,
                accountOther: requestOrder.accountOther,
                vendor: requestOrder.vendor !== 'Other' ? requestOrder.vendor : undefined,
                purpose: requestOrder.purpose,
                shippingDestination: requestOrder.shippingDestination,
                deliveryAttentionTo: requestOrder.deliveryAttentionTo,
                comments: requestOrder.comments,
                qcState: purchasingAdminModel?.qcState || requestOrder.qcState,
                assignedTo: purchasingAdminModel?.assignedTo,
                creditCardOption: purchasingAdminModel?.creditCardOption,
                program: purchasingAdminModel?.program,
                confirmNum: purchasingAdminModel?.confirmationNum,
                invoiceNum: purchasingAdminModel?.invoiceNum,
                lineItems: lineItems,
                lineItemsToDelete: lineItemsToDelete,
                hasNewVendor: (!!(requestOrder.vendor === 'Other' && VendorModel.getDisplayString(requestOrder.newVendor))),
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
                newVendorNotes: requestOrder.newVendor.notes
            },
            success: Utils.getCallbackWrapper(response => {
                if (documentAttachmentModel?.filesToUpload?.size > 0) {
                    uploadFiles(documentAttachmentModel, getServerContext().container.name, response.requestId).then((files: Array<string>) => {

                        //once the files are uploaded successfully, then update the purchasingRequest.attachments column with concatenated filenames
                        //make sure that the previously saved files are also included
                        const fileNames = documentAttachmentModel.savedFiles?.length > 0 ? files.concat(documentAttachmentModel.savedFiles) : files;
                        updateAttachmentColumn(response.requestId, fileNames.join(FILE_ATTACHMENT_SEPARATOR)).then((fileNames:string) => {resolve({fileNames: fileNames});})
                    });
                }
                //handle previously saved files - esp. if the user has removed the saved file
                else if (documentAttachmentModel?.savedFiles?.length > 0) {

                    //TODO: removal of the file from the UI does not delete the file from the file server, it only updates the purchasingRequests.attachments col -
                    // need to verify with the client if that is the intended behavior in case the files need to be kept on the server for auditing reasons
                    const fileNames = documentAttachmentModel.savedFiles.join(FILE_ATTACHMENT_SEPARATOR);
                    updateAttachmentColumn(response.requestId, fileNames).then((fileNames:string) => {resolve({fileNames: fileNames});})
                }
                else {
                    resolve(response);
                }
            }),
            failure: Utils.getCallbackWrapper(error => {
                console.error(`Failed to submit request.`, error);
                reject(error);
            }, undefined, true)
        });
    });
}

function uploadFiles(model: DocumentAttachmentModel, container: string, requestId: number): any {
    return new Promise((resolve, reject) => {

        // Nothing to do here
        if (model.filesToUpload?.size === 0) {
            resolve(model.filesToUpload);
        }

        const dir = PURCHASING_REQUEST_ATTACHMENTS_DIR + (requestId ? ('/' + requestId) : '');
        const uploadedFiles = Array<string>();

        model.filesToUpload.map((fileToUpload) => {

            if (fileToUpload) {
                uploadWebDavFile(fileToUpload, ActionURL.getContainer(), dir, true)
                    .then((name: string) => {
                        uploadedFiles.push(name);
                        if (uploadedFiles.length ===  model.filesToUpload.size) {
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

export async function updateAttachmentColumn(rowId: number, fileNames: string): Promise<any> {
    return new Promise((resolve, reject) => {
        Query.updateRows({
            containerPath: ActionURL.getContainer(),
            schemaName: EHR_PURCHASING_SCHEMA_NAME,
            queryName: "purchasingRequests",
            rows: [{rowId: rowId, attachments: fileNames}],
            success: response => {
                resolve(response.rows);
            },
            failure: error => {
                reject(error);
            },
        });
    });
}

export async function getSavedFiles(container: string, directory?: string, includeSubdirectories?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
        getWebDavFiles(container, directory, includeSubdirectories)
            .then((response) => {
                const displayFiles = response.get('files').valueSeq().map((file: WebDavFile) => {
                    return file.name;
                });
                resolve(displayFiles.toArray());
            })
            .catch(response => {
                if (response) {
                    const msg = 'Unable to load files in ' + (directory ? directory : 'root') + ': ' + response;
                    reject(msg);
                }
            });
    });
}
