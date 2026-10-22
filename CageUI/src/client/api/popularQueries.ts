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
import {
    AnimalInCage,
    AnimalWeightInfo, CageClassRecord,
    CageData,
    CageHistoryData,
    CageNumber,
    GhostCageData,
    RackData
} from '../types/typings';
import { parseRoomItemNum, zeroPadName } from '../utils/helpers';
import { Option } from '@labkey/components';
import { ConditionCode, ConditionTypes, HousingFormData, HousingTransferData } from '../types/housingFormTypes';
import dayjs, { Dayjs } from 'dayjs';

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
    const config: Query.SelectRowsOptions = {
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
    const config: Query.SelectRowsOptions = {
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

export const fetchConditionCodes = async (): Promise<ConditionCode[]> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'ehr_lookups',
        queryName: 'housing_condition_codes',
        filterArray: [
            Filter.create('date_disabled', null, Filter.Types.ISBLANK)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        const codes: ConditionCode[] = res.rows.map(row => {
            const isIT = row.value?.toString().toLowerCase() === 'it';
            return {
                label: isIT ? 'In Transit' : `${row.value} - ${row.category}`,
                value: row.value.toString(),
                type: row.category || (isIT ? ConditionTypes.special : undefined)
            };
        });
        if (!codes.some(c => c.value === 'it')) {
            codes.push({
                label: 'In Transit',
                value: 'it',
                type: ConditionTypes.special
            });
        }
        return codes;
    } catch (e) {
        console.error('Error fetching condition codes:', e);
        return [
            {
                label: 'In Transit',
                value: 'it',
                type: ConditionTypes.special
            }
        ];
    }
};

export const fetchCurrentCageMods = async (cageId: string): Promise<string[]> => {
    const config: Query.SelectRowsOptions = {
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

export const fetchHousingForm = async (lsid: string): Promise<any> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'housing_test',
        columns: ['Id', 'date', 'enddate', 'room','room/rowid', 'cage', 'cage/cage_number',
            'cond', 'cond/special_condition','cond/pair_condition','cond/cage_condition','cond/social_condition',
            'cond/special_condition/title','cond/pair_condition/title','cond/cage_condition/title','cond/social_condition/title',
            'cond/special_condition/category','cond/pair_condition/category','cond/cage_condition/category','cond/social_condition/category',
            'reason', 'project', 'remark', 'performedby', 'ejacConfirmed'],
        filterArray: [
            Filter.create('lsid', lsid, Filter.Types.EQUAL)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        console.log("Housing Res: ", res);
        if(res.rowCount === 1){
            return res.rows[0];
        }
    } catch (e) {
        console.error('Error fetching condition codes:', e);
        return null;
    }
}

/**
 * Fetches cage size requirements by weight from ehr_lookups.cageclass.
 * Columns: low (Min weight), high (Max weight), sqft (Required SQFT), height (Required height).
 *
 * @param abortSignal Optional AbortSignal for query cancellation
 */
export const fetchCageSizeReq = async (abortSignal?: AbortSignal): Promise<CageClassRecord[]> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'ehr_lookups',
        queryName: 'cageclass',
        columns: ['low', 'high', 'sqft', 'height'],
        sort: 'low'
    };

    try {
        const res = await labkeyActionSelectWithPromise(config, abortSignal);
        if (res.rows && res.rows.length > 0) {
            return res.rows.map(row => ({
                low: row.low !== null && row.low !== undefined ? parseFloat(row.low) : 0,
                high: row.high !== null && row.high !== undefined ? parseFloat(row.high) : 0,
                sqft: row.sqft !== null && row.sqft !== undefined ? parseFloat(row.sqft) : 0,
                height: row.height !== null && row.height !== undefined ? parseFloat(row.height) : 0
            }));
        }
        return [];
    } catch (e) {
        console.error('Error fetching cageclass data:', e);
        return [];
    }
};

/**
 * Fetches cage dimensions (SQFT and height) from cageui.cages table via 'rack/rack_type/sqft' and 'rack/rack_type/height'.
 * Falls back to cage sqft and height if lookup is unavailable.
 *
 * @param cageObjectId The objectId of the cage in cageui.cages
 * @param abortSignal Optional AbortSignal for query cancellation
 */
export const fetchCageDimensions = async (cageObjectId: string, abortSignal?: AbortSignal): Promise<{ sqft: number | null; height: number | null }> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cages',
        columns: ['objectid', 'cage_number', 'sqft', 'height'],
        filterArray: [
            Filter.create('objectid', cageObjectId, Filter.Types.EQUAL)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config, abortSignal);
        if (res.rows && res.rows.length > 0) {
            const row = res.rows[0];
            return {
                sqft: row.sqft ?? null,
                height: row.height ?? null
            };
        }
        return { sqft: null, height: null };
    } catch (e) {
        console.error('Error fetching cage dimensions:', e);
        return { sqft: null, height: null };
    }
};

/**
 * Fetches the IDs of animals currently in a room and cage from study.housing_test.
 *
 * @param room The room identifier/name
 * @param cageObjectId The cage objectId in housing_test (cage column)
 * @param abortSignal Optional AbortSignal for query cancellation
 */
export const fetchAnimalsInActiveHousingCage = async (room: string, cageObjectId: string, abortSignal?: AbortSignal): Promise<string[]> => {
    const config: Query.SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'housing_test',
        columns: ['Id', 'room', 'cage', 'enddate'],
        filterArray: [
            Filter.create('room', room, Filter.Types.EQUAL),
            Filter.create('cage', cageObjectId, Filter.Types.EQUAL),
            Filter.create('enddate', null, Filter.Types.ISBLANK)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config, abortSignal);
        if (res.rows && res.rows.length > 0) {
            return res.rows.map(row => row.Id || row.id).filter(Boolean);
        }
        return [];
    } catch (e) {
        console.error('Error fetching animals in ActiveHousingTest cage:', e);
        return [];
    }
};

/**
 * Fetches current weights for a list of animals from study.demographics view "Alive, at center".
 *
 * @param animalIds Array of animal IDs
 * @param abortSignal Optional AbortSignal for query cancellation
 */
export const fetchDemographicsWeights = async (animalIds: string[], abortSignal?: AbortSignal): Promise<AnimalWeightInfo[]> => {
    if (!animalIds || animalIds.length === 0) {
        return [];
    }

    const config: Query.SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'demographicsWeightChange',
        columns: ['Id', 'MostRecentWeight'],
        filterArray: [
            Filter.create('Id', animalIds, Filter.Types.IN)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config, abortSignal);
        const weightMap = new Map<string, number | null>();
        if (res.rows && res.rows.length > 0) {
            res.rows.forEach(row => {
                const id = row.Id || row.id;
                const w = row.MostRecentWeight !== null && row.MostRecentWeight !== undefined ? parseFloat(row.MostRecentWeight) : null;
                weightMap.set(id, w);
            });
        }

        return animalIds.map(id => ({
            id: id,
            weight: weightMap.has(id) ? weightMap.get(id) : null
        }));
    } catch (e) {
        console.error('Error fetching demographics weights:', e);
        return animalIds.map(id => ({ id, weight: null }));
    }
};
