import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import '../cageui.scss';
import {Filter} from '@labkey/api';
import { Cage, PrevRoom, Rack } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import {LayoutContextProvider } from '../components/ContextManager';
import DragAndDropGrid from '../components/Editor';
import { ActionURL } from '@labkey/api';
import Editor from '../components/Editor';
import { testRoom } from './testData';
import { labkeyActionSelectWithPromise } from '../components/helpers';

interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
    }
}

export const LayoutEditor: FC<RoomProps> = (props) => {
    //const {room} = props;
    const roomName = ActionURL.getParameter("room");
    const [prevRoom, setPrevRoom] = useState<PrevRoom>({name: null, data: []});

    useEffect(() => {
        if(!roomName) return;
        const prevRoomConfig: SelectRowsOptions = {
            schemaName: 'wnprc',
            queryName: 'layout_history',
            columns: ['room_object', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'scale', 'rowid'],
            filterArray: [
                Filter.create('room', roomName, Filter.Types.EQUALS),
                Filter.create('end_date', null, Filter.Types.ISBLANK)
            ]
        }

        labkeyActionSelectWithPromise(prevRoomConfig).then(result => {
            if(result.rows.length !== 0){
                setPrevRoom({name: roomName, data: result.rows});
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    return (
        <LayoutContextProvider
            prevRoom={prevRoom}
            children={
                <div className={"room-container"}>
                    <RoomHeader
                        name={roomName}
                    />
                    <div className={"divider"}/>
                    <Editor/>
                </div>
            }
        />
    );
}