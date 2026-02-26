import * as React from 'react';
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { HomeNavigationContextType } from '../types/homeNavigationContextTypes';
import { SelectedPage } from '../types/homeTypes';
import { Cage, Rack, RackGroup, Room, RoomMods } from '../types/typings';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { buildNewLocalRoom, fetchRoomData } from '../utils/helpers';
import _ from 'lodash';

interface HomeNavigationContextProps {
    children: ReactNode;
    room?: string;
    rack?: string;
    cage?: string;
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

export const HomeNavigationContextProvider: FC<HomeNavigationContextProps> = ({children, room, rack, cage}) => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>({selected: 'Home'});

    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedRoomMods, setSelectedRoomMods] = useState<RoomMods>({});
    const [roomLoading, setRoomLoading] = useState<boolean>(false);

    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);





    useEffect(() => {
        if(room && !rack && !cage){
            navigateTo("room", {room: room});
        }else if(room && rack && !cage){
            navigateTo("Rack", {room: room, rack: rack});
        }else if(room && rack && cage){
            navigateTo("Cage", {room: room, rack: rack, cage: cage});
        }else{
            goToHome();
        }
    }, [room, rack, cage]);

    useEffect(() => {
        if (!selectedPage?.rack) {
            return;
        }
        const {rack: currRack, rackGroup: currGroup} = findRackInGroup(selectedPage.rack, selectedRoom.rackGroups);
        setSelectedRack(currRack);
        setSelectedRackGroup(currGroup);
    }, [selectedPage.rack]);

    useEffect(() => {
        if (!selectedPage?.cage) {
            return;
        }

        const {
            cage: currCage,
            rack: currRack,
            rackGroup: currGroup
        } = findCageInGroup(selectedPage.cage, selectedRoom.rackGroups);
        setSelectedRackGroup(currGroup);
        setSelectedRack(currRack);
        setSelectedCage(currCage);
    }, [selectedPage.cage]);

    const [abortController, setAbortController] = useState(null);

    // Room loading function - this will be called when user clicks a room
    const loadRoomData = async (roomName, forceReload = false) => {
        // If we already have this room and not forcing reload, return cached data


        // Cancel any ongoing requests
        if (abortController) {
            abortController.abort();
        }

        setRoomLoading(true);
        const controller = new AbortController();
        setAbortController(controller);

        try {
            // Your existing room loading logic here
            const roomData = await fetchRoomData(roomName, controller.signal);
            //setLoadedRooms(prev => ({ ...prev, [roomName]: roomData }));
            console.log('Set new room: ', roomData);
            // room exists
            if (roomData.prevRoomData) {
                buildNewLocalRoom(roomData.prevRoomData).then((d) => {
                    const newLocalRoom = d[0];
                    if (newLocalRoom) {
                        newLocalRoom.layoutData = roomData.prevRoomData.layoutData;
                        // Ensure they don't share the same reference (using lodash to clone)
                        setSelectedRoomMods(_.cloneDeep(newLocalRoom.mods));
                        setSelectedRoom(newLocalRoom);
                    }
                });
            } else {
                setSelectedRoom(null);
                setSelectedRoomMods({});
            }
        }
        catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading room:', err);
            }
            throw err;
        }
        finally {
            setRoomLoading(false);
            setAbortController(null);
        }
    };

    // Method to explicitly switch to a different room
    const switchToRoom = async (roomName: string) => {
        try {
            await loadRoomData(roomName, true); // Force reload
        }
        catch (error) {
            console.error('Failed to switch to room:', error);
        }
    };

    const cancelRoomLoad = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
    };

    // Navigation functions
    const navigateTo = (page, data = null) => {
        console.log('navigateTo', page, data);
        setSelectedPage({selected: page, ...data});
    };

    const goToHome = () => {
        setSelectedPage(prevState => ({
            selected: 'Home'
        }));
    };

    const navigateToRoom = async (roomName, switchRoom) => {
        // First navigate to the room page
        navigateTo('Room', {room: roomName});

        // Then load the room data if needed
        if (switchRoom) {
            try {
                // This is the switchToRoom function from the RoomContextProvider instance
                await switchRoom(roomName);
            }
            catch (error) {
                console.error('Failed to load room data:', error);
            }
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
            switchToRoom,
            setSelectedRoom,
            goToHome,
            navigateToRoom
        }}>
            {children}
        </HomeNavigationContext.Provider>
    );
};
