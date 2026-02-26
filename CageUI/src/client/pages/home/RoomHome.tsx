import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../cageui.scss';
import { RoomList } from '../../components/home/RoomList';
import { RoomNavbar } from '../../components/home/RoomNavbar';
import { RoomContent } from '../../components/home/RoomContent';
import { HomeNavigationContextProvider } from '../../context/HomeNavigationContextManager';
import { RoomContextProvider } from '../../context/RoomContextManager';
import { ActionURL } from '@labkey/api';


export const RoomHome: FC = () => {
    const roomName = ActionURL.getParameter('room');
    const rackObjId = ActionURL.getParameter('rack');
    const cageObjId = ActionURL.getParameter('cage');

    useEffect(() => {
        console.log('roomName: ', roomName);
    }, []);

    return (
        <HomeNavigationContextProvider room={roomName} rack={rackObjId} cage={cageObjId}>
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