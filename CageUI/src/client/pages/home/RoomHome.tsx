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
import { RoomList } from '../../components/home/RoomList';
import { RoomNavbar } from '../../components/home/RoomNavbar';
import { RoomContent } from '../../components/home/RoomContent';
import { HomeNavigationContextProvider, useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { RoomContextProvider } from '../../context/RoomContextManager';
import { labkeyGetUserPermissions } from '../../api/labkeyActions';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';


export const RoomHome: FC = () => {
    const [user, setUser] = useState<GetUserPermissionsResponse>(null);

    useEffect(() => {
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: GetUserPermissionsResponse) => {
            if (profile.user) {
                setUser(profile);
            }
        }).catch((e) => {
            console.error(e);
        });
    }, []);

    return (user?.container &&
        <HomeNavigationContextProvider user={user}>
            <RoomContextProvider>
                <div className={'home-container'} id={'home-container-id'}>
                    <RoomList/>
                    <div className="page-content-wrapper">
                        <RoomNavbar/>
                        <div className="page-content">
                            <RoomContent/>
                        </div>
                    </div>
                </div>
            </RoomContextProvider>
        </HomeNavigationContextProvider>
    );
};