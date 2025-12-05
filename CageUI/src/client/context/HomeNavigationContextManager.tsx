import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { HomeContextType } from '../types/homeContextTypes';
import { HomeNavigationContextType } from '../types/homeNavigationContextTypes';
import { SelectedPage } from '../types/homeTypes';


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
        }}>
            {children}
        </HomeNavigationContext.Provider>
    );
};
