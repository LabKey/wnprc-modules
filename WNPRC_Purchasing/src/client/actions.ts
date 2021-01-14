import {Query, Ajax, Utils, ActionURL, Filter} from "@labkey/api";
import {LineItemModel, RequestOrderModel, VendorModel} from "./model";

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

export async function submitRequest (requestOrder: RequestOrderModel, lineItems: Array<LineItemModel>) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('WNPRC_Purchasing', 'submitNewRequest.api'),
            method: 'POST',
            jsonData: {
                account: requestOrder.account !== 'Other' ? requestOrder.account : undefined,
                accountOther: requestOrder.accountOther,
                vendor: requestOrder.vendor !== 'Other' ? requestOrder.vendor : undefined,
                purpose: requestOrder.purpose,
                shippingDestination: requestOrder.shippingDestination,
                deliveryAttentionTo: requestOrder.deliveryAttentionTo,
                comments: requestOrder.comments,
                qcState: requestOrder.qcState,
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
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper(error => {
                console.error(`Failed to submit request.`, error);
                reject(error);
            }, undefined, true),
        });
    });
}