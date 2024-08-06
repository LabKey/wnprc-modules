import * as React from 'react';
import { FC, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import '../cageui.scss';
import { Cage, Rack } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import { RoomContextProvider } from '../components/ContextManager';
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
            <div className={"room-container"}>
                <RoomHeader
                    name={room.name}
                />
                <RoomToolbar/>
                <div className={"divider"}/>
                <div className={"room-sub-container"}>
                    <RoomLegend/>
                    <RoomDisplay name={room.name}/>
                </div>
            </div>
        </RoomContextProvider>
    );
}