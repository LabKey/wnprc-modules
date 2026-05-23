/*
 *
 *  * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
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
import '../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { FullObjectHistoryData, PrevRoom, Room, UnitLocations } from '../../types/typings';
import { LayoutEditorContextProvider } from '../../context/LayoutEditorContextManager';
import Editor from '../../components/layoutEditor/Editor';
import { labkeyGetUserPermissions } from '../../api/labkeyActions';
import { RoomSizeSelector, SelectorOptions } from '../../components/layoutEditor/RoomSizeSelector';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';
import { isRoomCreator, isRoomModifier, isTemplateCreator } from '../../utils/helpers';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';
import { roomSizeOptions } from '../../utils/constants';
import { buildNewLocalRoom, fetchRoomData } from '../../utils/helpers';

export const LayoutEditor: FC<any> = () => {
    const roomName: string = ActionURL.getParameter('room');
    const [prevRoomData, setPrevRoomData] = useState<PrevRoom>({
        name: null,
        cagingData: [],
        layoutData: null,
        isDefault: true
    });
    const [prevRoom, setPrevRoom] = useState<{
        room: Room,
        locs: UnitLocations,
        data: FullObjectHistoryData[],
        isTemplate: boolean
    }>(null);
    const [selectedSize, setSelectedSize] = useState<SelectorOptions>(null);
    const [showSelectionPopup, setShowSelectionPopup] = useState<boolean>(true);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<GetUserPermissionsResponse>(null);
    const [access, setAccess] = useState<boolean>(false);


    useEffect(() => {
        const userProfile = labkeyGetUserPermissions();
        userProfile.then((profile: GetUserPermissionsResponse) => {
            if (profile.user) {
                setUserProfile(profile);
                // if the user is a template creator grant access
                if (isTemplateCreator(profile) || (isRoomCreator(profile))) {
                    setAccess(true);
                }else if(isRoomModifier(profile) && roomName && !roomName.includes("template")){ // ensure room modifiers are editing a real room
                    setAccess(true);
                }
                else{
                    setAccess(false);
                }
            }
        }).catch((e) => {
            console.error(e);
        });
    }, []);

    // Loads prev room into memory if it exists
    useEffect(() => {
        if (!roomName) {
            setIsLoading(false);
        } else {
            fetchRoomData(roomName).then(prevRoomData => {
                setPrevRoomData(prevRoomData.prevRoomData);
                setErrorPopup(prevRoomData?.error);
                setShowSelectionPopup(prevRoomData.showSelectionPopup);
                setSelectedSize(prevRoomData?.selectedSize);
            });
        }
    }, []);

    // Converts data from ehr into layout editor objects for use seen in typings
    useEffect(() => {
        if (prevRoomData.name !== null) {
            let newLocalRoom: Room;
            let isTemplate: boolean; // this template is a real template room, not a room saved with defaults
            let newUnitLocs: UnitLocations;

            if (prevRoomData.cagingData.length !== 0) {
                buildNewLocalRoom(prevRoomData).then((d) => {
                    let newLocalRoom = d[0];
                    newUnitLocs = d[1];
                    if (newLocalRoom) {
                        isTemplate = newLocalRoom.name.includes('template');
                        newLocalRoom = {
                            ...newLocalRoom,
                            name: isTemplate ? 'new-layout' : newLocalRoom.name
                        };

                        newLocalRoom = {
                            ...newLocalRoom,
                            layoutData: {
                                scale: prevRoomData.layoutData.scale,
                                borderWidth: prevRoomData.layoutData.borderWidth,
                                borderHeight: prevRoomData.layoutData.borderHeight,
                            }
                        };
                        setPrevRoom({
                            room: newLocalRoom,
                            locs: newUnitLocs,
                            data: prevRoomData.cagingData,
                            isTemplate: isTemplate
                        });
                        setIsLoading(false);
                    }
                });
            } else {
                isTemplate = prevRoomData.name.includes('template');
                // Don't use template name instead treat the template as an empty room with objects already placed
                newLocalRoom = {
                    name: isTemplate ? 'new-layout' : prevRoomData.name,
                    rackGroups: [],
                    valid: false,
                    objects: [],
                    layoutData: null
                };
                //Always set layoutData if a prev room exists, its been set before and will go to the current border in rooms
                newLocalRoom = {
                    ...newLocalRoom,
                    layoutData: {
                        scale: prevRoomData.layoutData.scale,
                        borderWidth: prevRoomData.layoutData.borderWidth,
                        borderHeight: prevRoomData.layoutData.borderHeight,
                    }
                };
                setPrevRoom({room: newLocalRoom, locs: null, data: [], isTemplate: isTemplate});
                setIsLoading(false);
            }
        }
    }, [prevRoomData]);

    return (isLoading) ?
        <div>
            <h3>Page is loading, please wait.</h3>
        </div> : (!isLoading && userProfile && access) ? (
        <LayoutEditorContextProvider
            prevRoom={prevRoom}
            user={userProfile}
            children={
                <div id={'layout-editor-container'} className={'room-container'}>
                    <RoomHeader
                        name={roomName}
                    />
                    <div className={'divider'}/>
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
    ) : (!isLoading && !access) ?
    (
        <div>
            <h3>Error loading page. You do not have sufficient permissions. Please open a ticket if you believe this is a mistake.</h3>
        </div>
    ) : (
        <div>
            <h3>Error loading page. Please submit a ticket.</h3>
        </div>
    );
};