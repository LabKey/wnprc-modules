import { Query, Ajax, Utils, ActionURL, Filter, getServerContext } from '@labkey/api';

export async function submitRequest(
    commands: any,
): Promise<any> {
    console.log("FormData", {
        commands: commands,
    });
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('query', 'saveRows', ActionURL.getContainer()),
            method: 'POST',
            jsonData: {
                apiVersion: 13.2,
                transacted: true,
                containerPath: ActionURL.getContainer(),
                commands: commands,
                extraContext: {
                    isValidateOnly: true
                }
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
            headers : {
                'Content-Type' : 'application/json'
            }
        });
    });
}


export const parseErrors = (result: any) => {
    const errors = [];
    result.forEach((res) => {
        if(res.errors){
            errors.push(res.errors);
        }
    })
    return errors;
}
