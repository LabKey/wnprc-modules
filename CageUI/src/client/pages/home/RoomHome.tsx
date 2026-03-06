import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { RoomList } from '../../components/home/RoomList';
import { RoomNavbar } from '../../components/home/RoomNavbar';
import { RoomContent } from '../../components/home/RoomContent';
import { HomeNavigationContextProvider } from '../../context/HomeNavigationContextManager';
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
                <div className={'home-container'}>
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