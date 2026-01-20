import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { RoomList } from '../../components/home/RoomList';
import { RoomNavbar } from '../../components/home/RoomNavbar';
import { RoomContent } from '../../components/home/RoomContent';
import { HomeNavigationContextProvider } from '../../context/HomeNavigationContextManager';
import { RoomContextProvider } from '../../context/RoomContextManager';


export const RoomHome: FC = () => {
    return (
        <HomeNavigationContextProvider>
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