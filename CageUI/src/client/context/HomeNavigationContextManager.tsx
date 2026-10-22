/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { HomeNavigationContextType } from '../types/homeNavigationContextTypes';
import { SelectedPage } from '../types/homeTypes';
import { Cage, Rack, RackGroup, Room, RoomMods } from '../types/typings';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { buildNewLocalRoom, fetchRoomData } from '../utils/helpers';
import { ActionURL, Security } from '@labkey/api';
import * as lodash from 'lodash';

interface HomeNavigationContextProps {
    user: Security.GetUserPermissionsResponse;
    children: ReactNode;
}

const HomeNavigationContext = createContext<HomeNavigationContextType>({} as HomeNavigationContextType);

export const useHomeNavigationContext = () => {
    const context = useContext(HomeNavigationContext);

    if (!context) {
        throw new Error(
            'useRoomContext has to be used within <HomeNavigationContext.Provider>'
        );
    }

    return context;
};

export const HomeNavigationContextProvider: FC<HomeNavigationContextProps> = ({user, children}) => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>({selected: 'Home'});
    const [userProfile, setUserProfile] = useState<Security.GetUserPermissionsResponse>(user);

    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedLocalRoom, setSelectedLocalRoom] = useState<Room>(null);
    const [selectedRoomMods, setSelectedRoomMods] = useState<RoomMods>({});

    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);

    const [isNavLoading, setIsNavLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedLocalRoom(selectedRoom);
    }, [selectedRoom]);

    // Load initial data based on URL parameters
    useEffect(() => {
        const roomParam = ActionURL.getParameter('room');
        const rackParam = ActionURL.getParameter('rack');
        const cageParam = ActionURL.getParameter('cage');

        if (roomParam) {
            loadRoomData(roomParam).then((room) => {
                if (rackParam) {
                    const { rack: currRack, rackGroup: currGroup } = findRackInGroup(rackParam, room.rackGroups || []);
                    setSelectedRack(currRack);
                    setSelectedRackGroup(currGroup);

                    if (cageParam) {
                        const {
                            cage: currCage,
                            rack: currRack,
                            rackGroup: currGroup
                        } = findCageInGroup(cageParam, room.rackGroups || []);
                        setSelectedRackGroup(currGroup);
                        setSelectedRack(currRack);
                        setSelectedCage(currCage);
                        setSelectedPage({selected: 'Cage', room: roomParam, rack: currRack.svgId, cage: currCage.svgId})
                    }else{
                        setSelectedPage({selected: 'Rack', room: roomParam, rack: currRack.svgId})
                    }
                }else{
                    setSelectedPage({selected: 'Room', room: roomParam})
                }
            });
        }
    }, []);

    const navigateTo = (page: SelectedPage) => {
        // Update URL using History API
        const url = new URL(window.location.href);

        // Clear all parameters first
        url.searchParams.delete('room');
        url.searchParams.delete('rack');
        url.searchParams.delete('cage');

        // Set new parameters based on page
        if (page.room) url.searchParams.set('room', page.room);
        if (page.rack) url.searchParams.set('rack', page.rack);
        if (page.cage) url.searchParams.set('cage', page.cage);

        // Update history
        window.history.pushState({}, '', url);

        // Update state
        setSelectedPage(page);

        // Handle navigation to different page types
        switch (page.selected) {
            case 'Home':
                setSelectedRoom(null);
                setSelectedRackGroup(null);
                setSelectedRack(null);
                setSelectedCage(null);
                setIsNavLoading(false);
                break;

            case 'Room':
                if (page.room) {
                    loadRoomData(page.room).then((newRoom) => {
                        setIsNavLoading(false);
                    });
                }
                break;

            case 'Rack':
                if (page.room && page.rack) {
                    // Load room if needed
                    if (!selectedRoom || selectedRoom.name !== page.room) {
                        loadRoomData(page.room).then((newRoom) => {
                            const { rack: currRack, rackGroup: currGroup } = findRackInGroup(page.rack, newRoom?.rackGroups || []);
                            setSelectedRack(currRack);
                            setSelectedRackGroup(currGroup);
                            setIsNavLoading(false);
                        });
                    } else {
                        const { rack: currRack, rackGroup: currGroup } = findRackInGroup(page.rack, selectedRoom?.rackGroups || []);
                        setSelectedRack(currRack);
                        setSelectedRackGroup(currGroup);
                        setIsNavLoading(false);
                    }
                }
                break;

            case 'Cage':
                if (page.room && page.rack && page.cage) {
                    // Load room if needed
                    if (!selectedRoom || selectedRoom.name !== page.room) {
                        loadRoomData(page.room).then((newRoom) => {
                            const {
                                cage: currCage,
                                rack: currRack,
                                rackGroup: currGroup
                            } = findCageInGroup(page.cage, newRoom?.rackGroups || []);
                            setSelectedRackGroup(currGroup);
                            setSelectedRack(currRack);
                            setSelectedCage(currCage);
                            setIsNavLoading(false);
                        });
                    } else {
                        const {
                            cage: currCage,
                            rack: currRack,
                            rackGroup: currGroup
                        } = findCageInGroup(page.cage, selectedRoom?.rackGroups || []);
                        setSelectedRackGroup(currGroup);
                        setSelectedRack(currRack);
                        setSelectedCage(currCage);
                        setIsNavLoading(false);
                    }
                }
                break;
        }
    };

    const [abortController, setAbortController] = useState(null);

    // Room loading function - this will be called when user clicks a room
    const loadRoomData = async (roomName, forceReload = false): Promise<Room> => {
        // If we already have this room and not forcing reload, return cached data


        // Cancel any ongoing requests
        if (abortController) {
            abortController.abort();
        }

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const roomData = await fetchRoomData(roomName, controller.signal);
            // room exists
            if (roomData.prevRoomData) {
                const newLocalRoom: Room = (await buildNewLocalRoom(roomData.prevRoomData))[0];
                if (newLocalRoom) {
                    newLocalRoom.layoutData = roomData.prevRoomData.layoutData;
                    // Ensure they don't share the same reference (using lodash to clone)
                    setSelectedRoomMods(lodash.cloneDeep(newLocalRoom.mods));
                    setSelectedRoom({...newLocalRoom, objects: [...newLocalRoom.objects]});
                }
                return newLocalRoom;
            } else {
                setSelectedRoom(null);
                setSelectedRoomMods({});
                return null;
            }
        }
        catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading room:', err);
            }
            throw err;
        }
        finally {
            setAbortController(null);
        }
    };

    return (
        <HomeNavigationContext.Provider value={{
            selectedPage,
            selectedRoomMods,
            selectedRackGroup,
            selectedRoom,
            selectedLocalRoom,
            selectedRack,
            selectedCage,
            navigateTo,
            setSelectedLocalRoom,
            userProfile,
            isNavLoading,
            setIsNavLoading
        }}>
            {children}
        </HomeNavigationContext.Provider>
    );
};
