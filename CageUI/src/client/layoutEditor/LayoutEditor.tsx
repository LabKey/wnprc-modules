import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { RoomHeader } from '../components/RoomHeader';
import { RoomLegend } from '../components/RoomLegend';
import { RoomDisplay } from '../components/RoomDisplay';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import '../cageui.scss';
import {Filter} from '@labkey/api';
import { Cage, GroupId, LayoutData, PrevRoom, Rack, Room, UnitLocations } from '../components/typings';
import { RoomToolbar } from '../components/RoomToolbar';
import {LayoutContextProvider } from '../components/ContextManager';
import DragAndDropGrid from '../components/Editor';
import { ActionURL } from '@labkey/api';
import Editor from '../components/Editor';
import { labkeyActionSelectWithPromise } from '../components/helpers';
import { RoomSizeSelector, SelectorOptions } from '../components/RoomSizeSelector';
import { Simulate } from 'react-dom/test-utils';
import error = Simulate.error;
import { ConfirmationPopup } from '../components/ConfirmationPopup';
import { buildNewLocalRoom, buildNewLocs } from '../components/LayoutEditorHelpers';

interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
    }
}

export const LayoutEditor: FC<RoomProps> = (props) => {
    //const {room} = props;
    const roomName = ActionURL.getParameter("room");
    const [prevRoomData, setPrevRoomData] = useState<PrevRoom>({name: null, cagingData: [], layoutData: null});
    const [prevRoom, setPrevRoom] = useState<{room: Room, locs: UnitLocations, data: PrevRoom}>(null);
    const [selectedSize, setSelectedSize] = useState<SelectorOptions>(null);
    const [showSelectionPopup, setShowSelectionPopup] = useState<boolean>(true);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const roomSizeOptions = [
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
            description: "Medium room size fitting up to 12x6 cages"
        },
        {
            id: 3,
            scale: 0.4,
            title: "Large",
            description: "Large room size fitting up to 17x8 cages"
        }
    ];

    useEffect(() => {
        if(!roomName){
            setIsLoading(false);
            return;
        }
        const prevRoomConfig: SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'layout_history',
            columns: ['object_type', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'rowid'],
            filterArray: [
                Filter.create('room', roomName, Filter.Types.EQUALS),
                Filter.create('end_date', null, Filter.Types.ISBLANK)
            ]
        }

        const prevRoomBorderConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['layout_scale', 'border_width','border_height'],
            filterArray: [
                Filter.create('room', roomName, Filter.Types.EQUALS)
            ]
        }
        const prevRoomPromise = labkeyActionSelectWithPromise(prevRoomConfig);
        const prevRoomBorderPromise = labkeyActionSelectWithPromise(prevRoomBorderConfig);

        Promise.all([prevRoomPromise, prevRoomBorderPromise]).then(([prevRoomResult, borderResult]) => {
            let borderObj: LayoutData;
            if(borderResult.rowCount === 0){
                throw new Error(`No room found in EHR for ${roomName}`);
            }else{

                 borderObj = {
                    scale: borderResult.rows[0].layout_scale || 1,
                    borderHeight: borderResult.rows[0].border_height || 809,
                    borderWidth: borderResult.rows[0].border_width || 1289,
                };
                setSelectedSize(roomSizeOptions.find(opt => opt.scale === borderObj.scale));
                setShowSelectionPopup(false);
            }
            console.log("Prev ROom", prevRoomResult.rows);
            setPrevRoomData({name: roomName, cagingData: prevRoomResult.rows || [], layoutData: borderObj});
        }).catch(err => {
            setErrorPopup(err.toString());
        });
    }, []);

    useEffect(() => {
        if(prevRoomData.name !== null){
            let newLocalRoom: Room;

            let newUnitLocs: UnitLocations;

            if(prevRoomData.cagingData.length !== 0){
                newUnitLocs = buildNewLocs(prevRoomData.cagingData);
                buildNewLocalRoom(prevRoomData).then((d) => {
                    if(d){
                        newLocalRoom = d;
                        newLocalRoom = {
                            ...newLocalRoom,
                            layoutData: {
                                scale: prevRoomData.layoutData.scale,
                                borderWidth: prevRoomData.layoutData.borderWidth,
                                borderHeight: prevRoomData.layoutData.borderHeight
                            }
                        }
                        setPrevRoom({room: newLocalRoom, locs: newUnitLocs, data: prevRoomData});
                        setIsLoading(false);
                    }
                });
            }else{
                newLocalRoom = {name: prevRoomData.name.includes("template") ? 'new-layout' : prevRoomData.name, rackGroups: [], objects: [], layoutData: null}
                //Always set layoutData if a prev room exists, its been set before and will go to the current border in rooms
                newLocalRoom = {
                    ...newLocalRoom,
                    layoutData: {
                        scale: prevRoomData.layoutData.scale,
                        borderWidth: prevRoomData.layoutData.borderWidth,
                        borderHeight: prevRoomData.layoutData.borderHeight
                    }
                }
                setPrevRoom({room: newLocalRoom, locs: null, data: prevRoomData});
                setIsLoading(false);
            }
        }
    }, [prevRoomData]);

    return !isLoading ? (
            <LayoutContextProvider
                prevRoom={prevRoom}
                children={
                    <div className={"room-container"}>
                        <RoomHeader
                            name={roomName}
                        />
                        <div className={"divider"}/>
                        {selectedSize &&
                            <Editor roomSize={selectedSize}/>
                        }
                        {showSelectionPopup &&
                            <RoomSizeSelector
                                options={roomSizeOptions}
                                onClose={() => setShowSelectionPopup(false)}
                                onSelect={(selectedOption) => setSelectedSize(selectedOption)}
                            />
                        }
                        {errorPopup &&
                            <ConfirmationPopup
                                    message={errorPopup}
                                    onClose={() => setErrorPopup(null)}
                            />
                        }
                    </div>
                }
            />
    ) : null;
}