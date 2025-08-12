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

export const cageModLookup = async (columns: string[], filterArray:  Filter.IFilter[]): Promise<EHRCageMods[]> => {
    const config: SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'cage_modifications',
        columns: columns,
        filterArray: filterArray
    }
    const res = await labkeyActionSelectWithPromise(config);

    if(res.rows.length !== 0){
        return res.rows as EHRCageMods[];
    }else{
        console.log("Error cageui modifications", res);
    }
}