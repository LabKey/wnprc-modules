import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Query, Security } from '@labkey/api';
import { Command, QueryRequestOptions, SaveRowsOptions, SaveRowsResponse } from '@labkey/api/dist/labkey/query/Rows';
import { GetUserPermissionsOptions } from '@labkey/api/dist/labkey/security/Permission';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';

export function labkeyActionSelectWithPromise(
    options: SelectRowsOptions,
    signal?: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {resolve(data)};
        options.failure = (data) => {reject(data)};
        Query.selectRows(options);
        if(signal){
            if (signal.aborted) {
                reject(new DOMException('Aborted', 'AbortError'));
            }

            // Listen for the abort event
            signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
            });
        }
    });
}

export function labkeyActionSelectDistinctWithPromise(
    options: SelectDistinctOptions,
    signal?: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {resolve(data)};
        options.failure = (data) => {reject(data)};
        Query.selectDistinctRows(options);
        if(signal){
            if (signal.aborted) {
                reject(new DOMException('Aborted', 'AbortError'));
            }

            // Listen for the abort event
            signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
            });
        }
    });
}

export function labkeyActionInsertWithPromise(
    options: QueryRequestOptions
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {resolve(data)};
        options.failure = (data) => {reject(data)};
        Query.insertRows(options);
    });
}

export function labkeyActionUpdateWithPromise(
    options: QueryRequestOptions
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {resolve(data)};
        options.failure = (data) => {reject(data)};
        Query.updateRows(options);
    });
}

export const labkeySaveRows = (commands: Command[]):Promise<SaveRowsResponse> => {

    return new Promise((resolve, reject) => {
        let options: SaveRowsOptions = {
            commands: commands,
            containerPath: ActionURL.getContainer(),
            success: (data) => {resolve(data)},
            failure: (data) => {reject(data)},
        };
        Query.saveRows(options);
    });
};

export const labkeyGetUserPermissions = (config?: GetUserPermissionsOptions) => {
    return new Promise((resolve, reject) => {
        const options: GetUserPermissionsOptions = {
            ...config,
            success: (data) => {resolve(data)},
            failure: (data) => {reject(data)},
        }
        const req = Security.getUserPermissions(options);
        req.onload = () => {
            if (req.status >= 200 && req.status < 300) {
                resolve(JSON.parse(req.responseText)); // Parse JSON response
            }else{
                reject(new Error(`${req.status}`));
            }
        };
    })
}
