import * as React from 'react';
import { FC, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import '../cageui.scss';
import { Cage, Rack } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import { RoomContextProvider } from '../components/ContextManager';
import { RoomList } from '../components/RoomList';
import { RoomNavbar } from '../components/RoomNavbar';
import { RoomContent } from '../components/RoomContent';
interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
    }
}

export const RoomHome: FC<RoomProps> = (props) => {
    const {room} = props;

    return (
        <RoomContextProvider>
            <div className={"home-container"}>
                <RoomList />
                <div className="page-content-wrapper">
                    <RoomNavbar />
                    <div className="page-content">
                        <RoomContent />
                    </div>
                </div>
            </div>
        </RoomContextProvider>
    );
}