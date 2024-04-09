import { Query, Ajax, Utils, ActionURL, Filter, getServerContext } from '@labkey/api';

export async function submitRequest<T>(
    jsonData: T,
    requestRejectId: number,// might not be needed
    actionEndpoint: string,
    isNewRequest?: boolean
): Promise<any> {
    console.log("FormData", {
        ...jsonData,
        isNewRequest: isNewRequest
    });
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('ReactForms', actionEndpoint),
            method: 'POST',
            jsonData: {
                ...jsonData,
                isNewRequest: isNewRequest
            },
            success: Utils.getCallbackWrapper(response => {
                resolve(response);
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
