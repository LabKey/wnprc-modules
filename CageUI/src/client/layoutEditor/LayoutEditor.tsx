import * as React from 'react';
import { FC, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import '../cageui.scss';
import { Cage, Rack } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import {LayoutContextProvider } from '../components/ContextManager';
import TestSVG from '../components/TestSVG';
import DragAndDropGrid from '../components/DragTest';

interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
    }
}

export const LayoutEditor: FC<RoomProps> = (props) => {
    const {room} = props;



    return (
        <LayoutContextProvider>
            <div className={"room-container"}>
                <RoomHeader
                    name={room.name}
                />
                <div className={"divider"}/>
                <DragAndDropGrid />
            </div>
        </LayoutContextProvider>
    );
}