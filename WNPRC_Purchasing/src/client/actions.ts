import {Query, Ajax, Utils, ActionURL, Filter, getServerContext} from "@labkey/api";
import {DocumentAttachmentModel, LineItemModel, PurchaseAdminModel, RequestOrderModel, VendorModel} from "./model";
import {uploadWebDavFile} from '@labkey/components';
import {PURCHASING_REQUEST_ATTACHMENTS} from "./constants";

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
                                     documentAttachmentModel?: DocumentAttachmentModel
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
                if (documentAttachmentModel?.files?.size > 0) {
                    uploadFiles(documentAttachmentModel, getServerContext().container.name, response.requestId).then((files: Array<File>) => {
                        resolve({uploadedFiles: files});
                    });
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
        if (model.files?.size === 0) {
            resolve(model.files);
        }

        const dir = PURCHASING_REQUEST_ATTACHMENTS + (requestId ? ('/' + requestId) : '');
        const uploadedFiles = Array<string>();

        model.files.map((fileToUpload) => {

            if (fileToUpload) {
                uploadWebDavFile(fileToUpload, ActionURL.getContainer(), dir, true)
                    .then((name: string) => {
                        uploadedFiles.push(name);
                        if (uploadedFiles.length ===  model.files.size) {
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