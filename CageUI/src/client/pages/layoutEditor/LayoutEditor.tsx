import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { RoomHeader } from '../../components/layoutEditor/RoomHeader';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import '../../cageui.scss';
import { ActionURL, Filter, UserWithPermissions } from '@labkey/api';
import { LayoutData, LayoutHistoryData, PrevRoom, Room, UnitLocations } from '../../types/typings';
import { LayoutEditorContextProvider } from '../../context/LayoutEditorContextManager';
import Editor from '../../components/layoutEditor/Editor';
import { labkeyActionSelectWithPromise, labkeyGetUserPermissions } from '../../api/labkeyActions';
import { RoomSizeSelector, SelectorOptions } from '../../components/layoutEditor/RoomSizeSelector';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';
import { buildNewLocalRoom, buildNewLocs, isTemplateCreator } from '../../utils/LayoutEditorHelpers';
import {Security} from '@labkey/api';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';

export const LayoutEditor: FC<any> = () => {
    const roomName = ActionURL.getParameter("room");
    const [prevRoomData, setPrevRoomData] = useState<PrevRoom>({name: null, cagingData: [], layoutData: null});
    const [prevRoom, setPrevRoom] = useState<{room: Room, locs: UnitLocations, data: LayoutHistoryData[]}>(null);
    const [selectedSize, setSelectedSize] = useState<SelectorOptions>(null);
    const [showSelectionPopup, setShowSelectionPopup] = useState<boolean>(true);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<GetUserPermissionsResponse>(null);
    const [access, setAccess] = useState<boolean>(false);


    // These are the options users can choose to select a room size. Scale adjusts the zoom level of the layout
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
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: GetUserPermissionsResponse) => {
            if(profile.user){
                setUserProfile(profile);
                // if the user is a template creator grant access
               if(!(!roomName && !isTemplateCreator(profile))){
                   setAccess(true);
               }else if(roomName) {
                   setAccess(true);
               }
            }
        }).catch((e) => {
            console.error(e);
        })
    }, []);

    // Loads prev room into memory if it exists
    useEffect(() => {
        if(!roomName){
            setIsLoading(false);
            return;
        }
        const prevRoomConfig: SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'layout_history',
            columns: ['object_type', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'rowid', 'extra_context'],
            filterArray: [
                Filter.create('room', roomName, Filter.Types.EQUALS),
                Filter.create('end_date', null, Filter.Types.ISBLANK)
            ],
            sort: "-rack_group",
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
            setPrevRoomData({name: roomName, cagingData: prevRoomResult.rows || [], layoutData: borderObj});
        }).catch(err => {
            setErrorPopup(err.toString());
        });
    }, []);

    // Converts data from ehr into layout editor objects for use seen in typings
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
                            ...d,
                            name: d.name.includes("template") ? 'new-layout' : d.name
                        }

                        newLocalRoom = {
                            ...newLocalRoom,
                            layoutData: {
                                scale: prevRoomData.layoutData.scale,
                                borderWidth: prevRoomData.layoutData.borderWidth,
                                borderHeight: prevRoomData.layoutData.borderHeight
                            }
                        }
                        setPrevRoom({room: newLocalRoom, locs: newUnitLocs, data: prevRoomData.cagingData});
                        setIsLoading(false);
                    }
                });
            }else{
                // Don't use template name instead treat the template as an empty room with objects already placed
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
                setPrevRoom({room: newLocalRoom, locs: null, data: prevRoomData.cagingData});
                setIsLoading(false);
            }
        }
    }, [prevRoomData]);

    return (!isLoading && userProfile && access) ? (
            <LayoutEditorContextProvider
                prevRoom={prevRoom}
                user={userProfile}
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
    ) : <div>
        <h3>Error loading page. This could be due to a number of issues</h3>
        <ul>
            <li>Insufficient permissions</li>
            <li>Slow load times</li>
            <li>New bugs on our end. If you believe this might be the issue please submit a ticket.</li>
        </ul>
    </div>;
}