/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { RoomHeader } from '../../components/layoutEditor/RoomHeader';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import '../../cageui.scss';
import { ActionURL, Filter } from '@labkey/api';
import {
    FullObjectHistoryData,
    LayoutData,
    LayoutHistoryData,
    LayoutObjectData,
    PrevRoom,
    Room,
    UnitLocations
} from '../../types/typings';
import { LayoutEditorContextProvider } from '../../context/LayoutEditorContextManager';
import Editor from '../../components/layoutEditor/Editor';
import { labkeyActionSelectWithPromise, labkeyGetUserPermissions } from '../../api/labkeyActions';
import { RoomSizeSelector, SelectorOptions } from '../../components/layoutEditor/RoomSizeSelector';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';
import { isTemplateCreator } from '../../utils/LayoutEditorHelpers';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';
import { SVG_HEIGHT, SVG_WIDTH } from '../../utils/constants';
import { buildNewLocalRoom, buildNewLocs } from '../../utils/helpers';

export const LayoutEditor: FC<any> = () => {
    const roomName = ActionURL.getParameter("room");
    const [prevRoomData, setPrevRoomData] = useState<PrevRoom>({name: null, cagingData: [], layoutData: null, isDefault: true});
    const [prevRoom, setPrevRoom] = useState<{room: Room, locs: UnitLocations, data: FullObjectHistoryData[], isTemplate: boolean}>(null);
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
        const fetchData = async () => {
            if (!roomName) {
                setIsLoading(false);
                return;
            }
            let historyTable: string;
            let roomHistoryId: string;
            let layoutHistoryId: string;
            let isDefaultRoom: boolean;
            // Make call to all_history for room and determine if template or not.
            const allHistoryCfg: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'all_history',
                columns: [],
                filterArray: [
                    Filter.create('room', roomName, Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK)
                ]
            }
            const allHistRes = await labkeyActionSelectWithPromise(allHistoryCfg);
            if (allHistRes.rowCount === 1) {
                console.log(allHistRes)
                const allHistObj = allHistRes.rows[0];
                if (allHistObj.history_type === "template") {
                    historyTable = "template_layout_history"
                    layoutHistoryId = allHistObj.template_historyid;
                } else {
                    historyTable = "layout_history"
                    layoutHistoryId = allHistObj.real_historyid;
                }
                roomHistoryId = allHistObj.room_historyid
                isDefaultRoom = allHistObj.history_type === "template";
            }

            const prevRoomConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: historyTable,
                columns: [],
                filterArray: [
                    Filter.create('historyid', layoutHistoryId, Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK)
                ]
            }

            const prevRoomBorderConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'room_history',
                columns: ['scale', 'border_width', 'border_height'],
                filterArray: [
                    Filter.create('historyid', roomHistoryId, Filter.Types.EQUALS)
                ]
            }
            const prevRoomPromise = labkeyActionSelectWithPromise(prevRoomConfig);
            const prevRoomBorderPromise = labkeyActionSelectWithPromise(prevRoomBorderConfig);

            Promise.all([prevRoomPromise, prevRoomBorderPromise]).then(([prevRoomResult, borderResult]) => {
                let borderObj: LayoutData;
                let cagingData: LayoutObjectData;
                if (borderResult.rowCount === 0) {
                    throw new Error(`No room found in EHR for ${roomName}`);
                } else {

                    borderObj = {
                        scale: borderResult.rows[0].scale || 1,
                        borderHeight: borderResult.rows[0].border_height || SVG_HEIGHT - 1,
                        borderWidth: borderResult.rows[0].border_width || SVG_WIDTH - 1,
                    };
                    setSelectedSize(roomSizeOptions.find(opt => opt.scale === borderObj.scale));
                    setShowSelectionPopup(false);
                }


                setPrevRoomData({name: roomName, cagingData: prevRoomResult.rows || [], layoutData: borderObj, isDefault: isDefaultRoom});
            }).catch(err => {
                setErrorPopup(err.toString());
            });
        };

        fetchData();
    }, []);

    // Converts data from ehr into layout editor objects for use seen in typings
    useEffect(() => {
        if(prevRoomData.name !== null){
            console.log("prevRoom: ", prevRoomData);
            let newLocalRoom: Room;
            let isTemplate: boolean; // this template is a real template room, not a room saved with defaults
            let newUnitLocs: UnitLocations;

            if(prevRoomData.cagingData.length !== 0){
                //newUnitLocs = buildNewLocs(prevRoomData.cagingData);
                buildNewLocalRoom(prevRoomData).then((d) => {
                    let newLocalRoom = d[0];
                    newUnitLocs = d[1];
                    if(newLocalRoom){
                        isTemplate = newLocalRoom.name.includes("template");
                        newLocalRoom = {
                            ...newLocalRoom,
                            name: isTemplate ? 'new-layout' : newLocalRoom.name
                        }

                        newLocalRoom = {
                            ...newLocalRoom,
                            layoutData: {
                                scale: prevRoomData.layoutData.scale,
                                borderWidth: prevRoomData.layoutData.borderWidth,
                                borderHeight: prevRoomData.layoutData.borderHeight,
                            }
                        }
                        setPrevRoom({room: newLocalRoom, locs: newUnitLocs, data: prevRoomData.cagingData, isTemplate: isTemplate});
                        setIsLoading(false);
                    }
                });
            }else{
                isTemplate = prevRoomData.name.includes("template");
                // Don't use template name instead treat the template as an empty room with objects already placed
                newLocalRoom = {
                    name: isTemplate ? 'new-layout' : prevRoomData.name,
                    rackGroups: [],
                    valid: false,
                    objects: [],
                    layoutData: null
                }
                //Always set layoutData if a prev room exists, its been set before and will go to the current border in rooms
                newLocalRoom = {
                    ...newLocalRoom,
                    layoutData: {
                        scale: prevRoomData.layoutData.scale,
                        borderWidth: prevRoomData.layoutData.borderWidth,
                        borderHeight: prevRoomData.layoutData.borderHeight,
                    }
                }
                setPrevRoom({room: newLocalRoom, locs: null, data: [], isTemplate: isTemplate});
                setIsLoading(false);
            }
        }
    }, [prevRoomData]);

    return (!isLoading && userProfile && access) ? (
            <LayoutEditorContextProvider
                prevRoom={prevRoom}
                user={userProfile}
                children={
                    <div id={'layout-editor-container'} className={"room-container"}>
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