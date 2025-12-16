import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { HomeNavigationContextType } from '../types/homeNavigationContextTypes';
import { SelectedPage } from '../types/homeTypes';
import { Cage, Rack, RackGroup } from '../types/typings';


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

export const HomeNavigationContextProvider = ({ children }) => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>({selected: "Home"});
    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);


    /*useEffect(() => {
    if(!selectedPage?.rack) return;
    //TODO Fetch mods for rack here as well and then set the rack and rack mods
    const {rack: currRack, rackGroup: currGroup} = findRackInGroup(selectedPage.rack, selectedRoom.rackGroups);
    setSelectedRack(currRack);
    setSelectedRackGroup(currGroup);
}, [selectedPage.rack]);

useEffect(() => {
    if(!selectedPage?.cage) return;

    const {cage: currCage, rack: currRack, rackGroup: currGroup} = findCageInGroup(selectedPage.cage, selectedRoom.rackGroups);
    setSelectedRackGroup(currGroup)
    setSelectedRack(currRack)
    setSelectedCage(currCage)
}, [selectedPage.cage]);*/

    // Navigation functions
    const navigateTo = (page, data = null) => {
        setSelectedPage({ selected: page, ...data });
    };

    const goToHome = () => {
        console.log("Home clicked");
        setSelectedPage(prevState => ({
            selected: "Home"
        }));
    }

    const navigateToRoom = async (roomName, switchRoom) => {
        // First navigate to the room page
        navigateTo("Room", { room: roomName });

        // Then load the room data if needed
        if (switchRoom) {
            try {
                // This is the switchToRoom function from the RoomContextProvider instance
                await switchRoom(roomName);
            } catch (error) {
                console.error('Failed to load room data:', error);
            }
        }
    };


    return (
        <HomeNavigationContext.Provider value={{
            selectedPage,
            navigateTo,
            goToHome,
            navigateToRoom,
            selectedRackGroup,
            selectedRack,
            selectedCage
        }}>
            {children}
        </HomeNavigationContext.Provider>
    );
};
