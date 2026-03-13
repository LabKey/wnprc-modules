/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Ajax, Query, Security, Utils } from '@labkey/api';
import { Command, QueryRequestOptions, SaveRowsOptions, SaveRowsResponse } from '@labkey/api/dist/labkey/query/Rows';
import { GetUserPermissionsOptions } from '@labkey/api/dist/labkey/security/Permission';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { CageMods, Rack, RackConditionOption, Room } from '../types/typings';
import { buildURL } from '@labkey/components';
import { RackSwitchOption } from '../types/homeTypes';

export function labkeyActionSelectWithPromise(
    options: SelectRowsOptions,
    signal?: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {
            resolve(data);
        };
        options.failure = (data) => {
            reject(data);
        };
        Query.selectRows(options);
        if (signal) {
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
        options.success = (data) => {
            resolve(data);
        };
        options.failure = (data) => {
            reject(data);
        };
        Query.selectDistinctRows(options);
        if (signal) {
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
        options.success = (data) => {
            resolve(data);
        };
        options.failure = (data) => {
            reject(data);
        };
        Query.insertRows(options);
    });
}

export function labkeyActionUpdateWithPromise(
    options: QueryRequestOptions
): Promise<any> {
    return new Promise((resolve, reject) => {
        options.success = (data) => {
            resolve(data);
        };
        options.failure = (data) => {
            reject(data);
        };
        Query.updateRows(options);
    });
}

export const labkeySaveRows = (commands: Command[]): Promise<SaveRowsResponse> => {

    return new Promise((resolve, reject) => {
        let options: SaveRowsOptions = {
            commands: commands,
            containerPath: ActionURL.getContainer(),
            success: (data) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            },
        };
        Query.saveRows(options);
    });
};

export const labkeyGetUserPermissions = (config?: GetUserPermissionsOptions) => {
    return new Promise((resolve, reject) => {
        const options: GetUserPermissionsOptions = {
            ...config,
            success: (data) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            },
        };
        const req = Security.getUserPermissions(options);
        req.onload = () => {
            if (req.status >= 200 && req.status < 300) {
                resolve(JSON.parse(req.responseText)); // Parse JSON response
            } else {
                reject(new Error(`${req.status}`));
            }
        };
    });
};

export function saveRoomLayout(room: Room, mods: CageMods[], prevRoomName: string, prevRackCondition?: RackConditionOption): Promise<{
    success: boolean,
    errors: any[]
}> {
    const newPrevRoomName = prevRoomName || room.name;
    let isDefault = false;
    room.rackGroups.forEach((g) => {
        if (isDefault) {
            return;
        }
        g.racks.forEach(r => {
            if (r.type.isDefault) {
                isDefault = true;
            }
        });
    });
    return new Promise((resolve, reject) => {
        Ajax.request({
            url: buildURL('cageui', 'saveLayoutHistory.api'),
            method: 'POST',
            success: (res) => resolve(JSON.parse(res.response)),
            failure: Utils.getCallbackWrapper((error) => reject(error)),
            jsonData: {mods: mods, room: room, prevRoomName: newPrevRoomName, isDefault: isDefault, prevRackCondition: prevRackCondition},
        });
    });
}

export function createNewRoomFromRackChange(room: Room, newRackOption: RackSwitchOption, prevRack: Rack ): Promise<{
    room: Room,
    rack: string;
    errors: any[]
}> {
    return new Promise((resolve, reject) => {
        Ajax.request({
            url: buildURL('cageui', 'createNewRoomFromRackChange.api'),
            method: 'POST',
            success: (res) => resolve(JSON.parse(res.response)),
            failure: Utils.getCallbackWrapper((error) => reject(error)),
            jsonData: {room: room, rackSwitchOption: newRackOption, prevRack: prevRack},
        });
    });
}

// This function is for updating racks that don't belong to a room.
export function updateRackConditionStatus(rack: RackSwitchOption, condition: RackConditionOption ): Promise<{
    success: boolean,
    errors: any[]
}> {
    return new Promise((resolve, reject) => {
        Ajax.request({
            url: buildURL('cageui', 'updateRackConditionStatus.api'),
            method: 'POST',
            success: (res) => resolve(JSON.parse(res.response)),
            failure: Utils.getCallbackWrapper((error) => reject(error)),
            jsonData: {rack: rack.value.objectId, condition: condition.value},
        });
    });
}