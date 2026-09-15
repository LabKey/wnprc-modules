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
import {
    labkeyGetUserPermissions,
} from '../../api/labkeyActions';
import { ActionURL, Security } from '@labkey/api';
import { HousingForm } from '../../components/housingTransfer/HousingForm';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { findAnimalsInCage } from '../../api/popularQueries';
import { HousingTransferData } from '../../types/housingFormTypes';
import { createPrevHousingForm } from '../../utils/housingTransferHelpers';
import { LayoutErrors } from '../../components/LayoutErrors';
import { LoadingScreen } from '../../components/LoadingScreen';


export const HousingTransfer: FC = () => {
    const [user, setUser] = useState<Security.GetUserPermissionsResponse>(null);
    const [firstRoom, setFirstRoom] = useState<string>();
    const [prevForm, setPrevForm] = useState<Record<string, HousingTransferData[]>>(null);
    const [selectedAnimals, setSelectedAnimals] = useState<string[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);


    useEffect(() => {
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: Security.GetUserPermissionsResponse) => {
            if (profile.user) {
                setUser(profile);
            }
        }).catch((e) => {
            console.error(e);
        });
    }, []);



    useEffect(() => {
        const firstRoom: string = ActionURL.getParameter('room');
        const firstCages: string[] = ActionURL.getParameterArray('cages');
        const prevFormId: string = ActionURL.getParameter('lsid');
        const layoutChangeId: string = ActionURL.getParameter('historyId'); // did the housing transfer come from a layout change?
        if (prevFormId) {
            setIsLoading(true);
            createPrevHousingForm(prevFormId)
                .then(r => {
                    setPrevForm(r);
                })
                .catch(e => {
                    setErrors([e?.message || 'Error loading previous housing form.']);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
        else if (firstRoom && firstCages) {
            setIsLoading(true);
            const allInitialAnimals: string[] = [];
            const newErrors: string[] = [];
            const promises = firstCages.map(cage => findAnimalsInCage(cage));
            
            Promise.allSettled(promises).then(res => {
                res.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        allInitialAnimals.push(...result.value.flatMap(animal => animal.id));
                    } else {
                        const errMsg = result.reason?.message || `Error fetching animal data in cage ${firstCages[idx]}`;
                        newErrors.push(errMsg);
                    }
                });

                if (newErrors.length > 0) {
                    setErrors(newErrors);
                } else {
                    setSelectedAnimals(allInitialAnimals);
                    setFirstRoom(firstRoom);
                }
                setIsLoading(false);
            });
        }
    }, []);

    useEffect(() => {
        console.log("Selected Animals: ", selectedAnimals);
    }, [selectedAnimals]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="housing-transfer-page" id={"housing-transfer-root"}>
                <LoadingScreen
                    isVisible={isLoading}
                    message="Loading..."
                    targetElement={document.getElementById("housing-transfer-root")}
                />

                {errors.length > 0 && (
                    <LayoutErrors errors={errors} />
                )}

                {user && errors.length === 0 &&
                    <>
                        <HousingForm
                            user={user}
                            prevForm={prevForm}
                            currRoom={firstRoom}
                            selectedAnimals={selectedAnimals}
                        />
                    </>
                }
            </div>
        </LocalizationProvider>
    );
};