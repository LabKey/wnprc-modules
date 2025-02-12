import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Query } from '@labkey/api';
import { Command, QueryRequestOptions, SaveRowsOptions, SaveRowsResponse } from '@labkey/api/dist/labkey/query/Rows';

export function labkeyActionSelectWithPromise(
    options: SelectRowsOptions
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {resolve(data)};
        options.failure = (data) => {reject(data)};
        Query.selectRows(options);
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
