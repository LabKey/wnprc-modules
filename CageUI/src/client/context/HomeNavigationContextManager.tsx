import * as React from 'react';
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { HomeNavigationContextType } from '../types/homeNavigationContextTypes';
import { SelectedPage } from '../types/homeTypes';
import { Cage, Rack, RackGroup, Room, RoomMods } from '../types/typings';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { buildNewLocalRoom, fetchRoomData } from '../utils/helpers';
import _ from 'lodash';
import { ActionURL } from '@labkey/api';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';

interface HomeNavigationContextProps {
    user: GetUserPermissionsResponse;
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
    const [userProfile, setUserProfile] = useState<GetUserPermissionsResponse>(user);

    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedRoomMods, setSelectedRoomMods] = useState<RoomMods>({});

    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);

    // Track if we've already handled this specific URL

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
                break;

            case 'Room':
                if (page.room) {
                    loadRoomData(page.room);
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
                        });
                    } else {
                        const { rack: currRack, rackGroup: currGroup } = findRackInGroup(page.rack, selectedRoom?.rackGroups || []);
                        setSelectedRack(currRack);
                        setSelectedRackGroup(currGroup);
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
                    setSelectedRoomMods(_.cloneDeep(newLocalRoom.mods));
                    setSelectedRoom(newLocalRoom);
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
            selectedRack,
            selectedCage,
            navigateTo,
            setSelectedRoom,
            userProfile,
        }}>
            {children}
        </HomeNavigationContext.Provider>
    );
};
