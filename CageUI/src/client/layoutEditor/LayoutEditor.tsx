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
import { labkeyActionSelectWithPromise } from '../components/helpers';
import { RoomSizeSelector, SelectorOptions } from '../components/RoomSizeSelector';

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
    const [selectedSize, setSelectedSize] = useState<SelectorOptions>(null);
    const [showSelectionPopup, setShowSelectionPopup] = useState<boolean>(true);

    useEffect(() => {
        if(!roomName) return;
        const prevRoomConfig: SelectRowsOptions = {
            schemaName: 'wnprc',
            queryName: 'layout_history',
            columns: ['room_object', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'scale', 'rowid', 'default_rack'],
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
                    {(roomName || !showSelectionPopup) &&
                        <Editor roomSize={selectedSize}/>
                    }
                    {showSelectionPopup &&
                        <RoomSizeSelector
                            options={[
                                {
                                    id: 0,
                                    scale: 1.4,
                                    title: "Extra Small",
                                    description: "Extra small room size fitting up to 10x5 cages"
                                },
                                {
                                    id: 1,
                                    scale: 1.0,
                                    title: "Small",
                                    description: "Small room size fitting up to 10x5 cages"
                                },
                                {
                                    id: 2,
                                    scale: 0.8,
                                    title: "Medium",
                                    description: "Medium room size fitting up to 10x5 cages"
                                },
                                {
                                    id: 3,
                                    scale: 0.6,
                                    title: "Large",
                                    description: "Large room size fitting up to 10x5 cages"
                                }
                            ]}
                            onClose={() => setShowSelectionPopup(false)}
                            onSelect={(selectedOption) => setSelectedSize(selectedOption)}
                        />
                    }
                </div>
            }
        />
    );
}