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

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { AdoptionForm } from '../../components/adoptionDataEntry/AdoptionForm';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ActionURL, Filter, Query } from '@labkey/api';
import { AdoptionData, AdoptionResult, AdoptionStatus } from '../../types/adoptionFormTypes';
import dayjs from 'dayjs';


export const AdoptionDataEntry: FC = () => {
    const prevFormLsid = ActionURL.getParameter('lsid');
    const [prevFormData, setPrevFormData] = useState<AdoptionData>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const config: Query.SelectRowsOptions = {
            schemaName: 'study',
            queryName: 'adoptions',
            columns: ['id', 'objectid', 'date', 'dam', 'result/value', 'result/title', 'type/value', 'type/title'],
            filterArray: [Filter.create('lsid', prevFormLsid, Filter.Types.EQUAL)]
        };

        labkeyActionSelectWithPromise(config).then(result => {
            if (result.rowCount === 1) {
                const res = result.rows[0];
                const adoptionData: AdoptionData = {
                    dam: res.dam,
                    date: dayjs(res.date),
                    id: res.Id,
                    objectid: res.objectid,
                    result: {
                        label: res['result/title'] as keyof typeof AdoptionResult,
                        value: parseInt(res['result/value'])
                    },
                    type: {
                        label: res['type/title'] as keyof typeof AdoptionStatus,
                        value: parseInt(res['type/value'])
                    }
                };
                setPrevFormData(adoptionData);
                setIsLoading(false);
            }else{
                setIsLoading(false);
            }
        }).catch(err => {
            console.error('Error fetching alive at center animals', err);
            setIsLoading(false);
        });
    }, []);

    /*const [user, setUser] = useState<GetUserPermissionsResponse>(null);

    useEffect(() => {
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: GetUserPermissionsResponse) => {
            if (profile.user) {
                setUser(profile);
            }
        }).catch((e) => {
            console.error(e);
        });
    }, []);*/

    return(
        !isLoading &&
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div id={"adoption-form-root"}>
                <AdoptionForm prevForm={prevFormData}/>
            </div>
        </LocalizationProvider>
    )
};