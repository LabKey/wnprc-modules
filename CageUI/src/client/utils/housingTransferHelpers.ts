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


import { Option } from '@labkey/components';
import { fetchCurrentCageMods } from '../api/popularQueries';
import { ModTypes } from '../types/typings';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../api/labkeyActions';

export const getCode = (code: string, options: Option<string>[]): Option<string> => {
    return options.find(opt => opt.value === code);
}

export const getCagingCodes = async (id: string): Promise<string[]> => {
    const cagingCodes: string[] = [];
    const mods = await fetchCurrentCageMods(id);

    if(mods.find(m => m === ModTypes.PCDivider)){
        cagingCodes.push("pc");
    }

    if(mods.find(m => m === ModTypes.VCDivider)){
        cagingCodes.push("vc");
    }

    return cagingCodes;
}

export const checkIsMarm = async (id: string): Promise<boolean> => {
    const config: SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'demographics',
        columns: ['species'],
        filterArray: [
            Filter.create('Id', id, Filter.Types.EQUALS)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        if(res.rows[0].species === 'Marmoset'){
            return true;
        }else{
            return false;
        }
    } catch (e) {
        console.error('Error fetching animal species:', e);
        return false;
    }

}

export const checkIsInfant = async (id: string): Promise<boolean> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'demographicsInfants',
        columns: ['isInfant'],
        filterArray: [
            Filter.create('Id', id, Filter.Types.EQUALS)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        return res.rows[0].isInfant;
    } catch (e) {
        console.error('Error fetching infant status', e);
        return false;
    }

}

export const infantInDestination = async (ids: string[]): Promise<string | null> => {

    for (const id of ids) {
        if (await checkIsInfant(id)) {
            return id;
        }
    }

    return null;
}

export const checkIsAdopted = async (parentId: string, infantId: string): Promise<boolean> => {
    const config: SelectRowsOptions = {
        schemaName: 'study',
        queryName: 'demographicsOffspring',
        columns: ['Offspring/parents/sire', 'Offspring/parents/dam'],
        filterArray: [
            Filter.create('Offspring', infantId, Filter.Types.EQUALS)
        ]
    };

    try {
        const res = await labkeyActionSelectWithPromise(config);
        if(res.rows[0]['Offspring/parents/sire'] === parentId || res.rows[0]['Offspring/parents/dam'] === parentId){
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error fetching adoption status', e);
        return false;
    }
}