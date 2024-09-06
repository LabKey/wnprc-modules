import * as React from 'react';
import { FC, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import '../cageui.scss';
import { Cage, Rack } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import {LayoutContextProvider } from '../components/ContextManager';
import DragAndDropGrid from '../components/Editor';
import { ActionURL } from '@labkey/api';
import Editor from '../components/Editor';

interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
    }
}

export const LayoutEditor: FC<RoomProps> = (props) => {
    const {room} = props;
    const roomName = ActionURL.getParameter("room");

    console.log(roomName)

    return (
        <LayoutContextProvider>
            <div className={"room-container"}>
                <RoomHeader
                    name={roomName}
                />
                <div className={"divider"}/>
                <Editor />
            </div>
        </LayoutContextProvider>
    );
}