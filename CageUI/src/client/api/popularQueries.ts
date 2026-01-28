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
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from './labkeyActions';
import { EHRCageMods } from '../types/homeTypes';
import { CageData, CageHistoryData, RackData } from '../types/typings';

export const cageModLookup = async (columns: string[], filterArray: Filter.IFilter[]): Promise<EHRCageMods[]> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cage_modifications',
        columns: columns,
        filterArray: filterArray
    };
    const res = await labkeyActionSelectWithPromise(config);

    if (res.rows.length !== 0) {
        return res.rows as EHRCageMods[];
    } else {
        console.log('Error cageui modifications', res);
    }
};

export const fetchCageHistory = async (historyid: string, cage: string): Promise<CageHistoryData> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cage_history',
        filterArray: [
            Filter.create('historyid', historyid, Filter.Types.EQUAL),
            Filter.create('cage', cage, Filter.Types.EQUAL)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        console.log(res, historyid, cage);
        if (res.rows.length === 1) {
            return {
                rowid: res.rows[0].rowid,
                historyId: res.rows[0].historyid,
                cage: res.rows[0].cage,
                rackGroup: res.rows[0].rack_group,
                groupRotation: res.rows[0].group_rotation,
                cageNum: res.rows[0].cage_number,
                height: res.rows[0].height,
                length: res.rows[0].length,
                width: res.rows[0].width,
                sqft: res.rows[0].sqft,
            };
        } else {
            throw new Error('Error fetching cage history data');
        }
    }
    catch (e) {
        throw new Error('Error fetching cage history data: ' + (e as Error).message);
    }
};

export const fetchCage = async (objectId: string): Promise<CageData> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cages',
        filterArray: [Filter.create('objectid', objectId, Filter.Types.EQUAL)]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        if (res.rows.length === 1) {
            return {
                rowid: res.rows[0].rowid,
                positionId: res.rows[0].positionid,
                objectId: res.rows[0].objectid,
                rack: res.rows[0].rack,
                cageNum: res.rows[0].cage_number,
                width: res.rows[0].width,
                height: res.rows[0].height,
                length: res.rows[0].length,
                sqft: res.rows[0].sqft,
            };
        } else {
            throw new Error('Error fetching cage history data');
        }
    }
    catch (e) {
        throw new Error('Error fetching cage history data: ' + (e as Error).message);
    }
};

export const fetchRack = async (objectId: string): Promise<RackData> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'racks',
        filterArray: [Filter.create('objectid', objectId, Filter.Types.EQUAL)]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);

        if (res.rows.length === 1) {
            return {
                rowid: res.rows[0].rowid,
                objectId: res.rows[0].objectid,
                rackId: res.rows[0].rackid,
                room: res.rows[0].room,
                rackType: res.rows[0].rack_type,
            };
        } else {
            throw new Error('Error fetching cage history data');
        }
    }
    catch (e) {
        throw new Error('Error fetching cage history data: ' + (e as Error).message);
    }
};