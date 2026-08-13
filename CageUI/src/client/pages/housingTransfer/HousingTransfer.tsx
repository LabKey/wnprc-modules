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


export const HousingTransfer: FC = () => {
    const [user, setUser] = useState<Security.GetUserPermissionsResponse>(null);
    const [firstRoom, setFirstRoom] = useState<string>();
    const [prevForm, setPrevForm] = useState<Record<string, HousingTransferData[]>>(null);
    const [selectedAnimals, setSelectedAnimals] = useState<string[]>();


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
        const firstCage: string = ActionURL.getParameter('cage');
        const prevFormId: string = ActionURL.getParameter('lsid');
        if(prevFormId){
            createPrevHousingForm(prevFormId).then(r => {
                setPrevForm(r);
            })
        }
        else if (firstRoom && firstCage) {
            findAnimalsInCage(firstCage).then((r) => {
                setSelectedAnimals(r.flatMap(animal => animal.id));
            })
            setFirstRoom(firstRoom);
        }
    }, []);

    useEffect(() => {
        console.log("Selected Animals: ", selectedAnimals);
    }, [selectedAnimals]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="housing-transfer-page" id={"housing-transfer-root"}>
                {user &&
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