/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import { Filter, Query } from '@labkey/api';
import { labkeyActionSelectWithPromise } from './labkeyActions';
import { EHRCageMods } from '../types/homeTypes';
import { AnimalInCage, CageData, CageHistoryData, CageNumber, GhostCageData, RackData } from '../types/typings';
import { parseRoomItemNum, zeroPadName } from '../utils/helpers';
import { Option } from '@labkey/components';

export const cageModLookup = async (columns: string[], filterArray: Filter.IFilter[]): Promise<EHRCageMods[]> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cage_modifications',
        columns: columns,
        filterArray: filterArray
    };
    const res = await labkeyActionSelectWithPromise(config);

    if (res.rows.length !== 0) {
        return res.rows as EHRCageMods[];
    } else {
        console.error('Error cageui modifications', res);
    }
};

export const fetchCageHistory = async (historyid: string, cage: string): Promise<CageHistoryData> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cage_history',
        filterArray: [
            Filter.create('historyid', historyid, Filter.Types.EQUAL),
            Filter.create('cage', cage, Filter.Types.EQUAL)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
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
    const config: Query.SelectRowsOptions = {
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

export const fetchGhostCage = async (objectId: string): Promise<GhostCageData> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'ghost_cages',
        filterArray: [Filter.create('cage_objectid', objectId, Filter.Types.EQUAL)]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        if (res.rows.length === 1) {
            return {
                rowid: res.rows[0].rowid,
                cageObjId: res.rows[0].cage_objectid,
                positionId: res.rows[0].positionid,
                rackGroup: res.rows[0].rack_group,
                rack: 0,
                rackObjId: res.rows[0].rack_objectid,
                groupRotation: res.rows[0].group_rotation,
                cage: res.rows[0].cage,
            };
        } else {
            throw new Error('Error fetching ghost cage data');
        }
    }
    catch (e) {
        throw new Error('Error fetching ghost cage data: ' + (e as Error).message);
    }
};

export const fetchRack = async (objectId: string): Promise<RackData> => {
    const config: Query.SelectRowsOptions = {
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
                condition: res.rows[0].condition,
            };
        } else {
            throw new Error('Error fetching cage history data');
        }
    }
    catch (e) {
        throw new Error('Error fetching cage history data: ' + (e as Error).message);
    }
};

// TODO update this query with cageNew
export const findAnimalsInCage = async (cage: string): Promise<AnimalInCage[]> => {
    const config: SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'demographicsCurLocationNew',
        filterArray: [
            Filter.create('cage', cage, Filter.Types.EQUAL)]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        const animalsInCage: AnimalInCage[] = [];
        if (res.rows.length > 0) {
            res.rows.forEach(r => {
                animalsInCage.push({
                    id: r.id,
                })
            });
        }
        return animalsInCage;
    }
    catch (e) {
        throw new Error('Error fetching animals in cage: ' + (e as Error).message);
    }
}

export const fetchConditionCodes = async (): Promise<Option<string>[]> => {
    const config: SelectRowsOptions = {
        schemaName: 'ehr_lookups',
        queryName: 'housing_condition_codes',
        filterArray: [
            Filter.create('date_disabled', null, Filter.Types.ISBLANK)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        return res.rows.map(row => ({
            label: `${row.value} - ${row.category}`,
            value: row.value.toString()
        }));
    } catch (e) {
        console.error('Error fetching condition codes:', e);
        return [];
    }
};

export const fetchCurrentCageMods = async (cageId: string): Promise<string[]> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'currentCageMods',
        filterArray: [
            Filter.create('cage', cageId, Filter.Types.EQUALS)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        return res.rows.map(row => (row.modification));
    } catch (e) {
        console.error('Error fetching condition codes:', e);
        return [];
    }
};