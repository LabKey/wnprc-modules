import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { Cage, Rack, RoomItem } from '../types/typings';
import { removeCircularReferences } from '../utils/homeHelpers';
import { HomeContextType } from '../types/homeContextTypes';
import {SelectedPage} from '../types/homeTypes';


const HomeContext = createContext<HomeContextType | null>(null);

export const useHomeContext = () => {
    const context = useContext(HomeContext);

    if (!context) {
        throw new Error(
            'useRoomContext has to be used within <HomeContext.Provider>'
        );
    }

    return context;
};

export const HomeContextProvider = ({children}) => {
    // New state management
    const [selectedPage, setSelectedPage] = useState<SelectedPage>({selected: "Home"});

    // End new state management
    const [room, setRoom] = useState<RoomItem[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
    const [isEditEnabled, setIsEditEnabled] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState<boolean>(false);
    const [cageCount, setCageCount] = useState<number>(0);

    /*
    Context for room svg
     */
    const [localRoom, setLocalRoom] = useState<RoomItem[]>(room);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveChanges = async () => {
        try {
            setRoom(localRoom);
            setError(null);
        }
        catch (err) {
            setError('Failed to save changes');
        }
    };
    /*
    End SVG context

    const saveMod = () => {
        setIsDirty(false);
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = updatedRoom.findIndex(((rack) => rack.itemId === clickedRack.itemId))
            if (clickedRackIndex) {
                // Create a deep copy of the cage state object
                (updatedRoom[clickedRackIndex] as Rack).cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;

                clickedRack.cages.forEach((cage) => {
                    (updatedRoom[clickedRackIndex] as Rack).cages.find(
                        (updateCage) => updateCage.id === cage.id
                    ).cageState = cage.cageState;
                })
            }
            return updatedRoom;
        });
    }*/

    return (
        <HomeContext.Provider value={{
            room,
            setRoom,
            clickedCage,
            setClickedCage,
            clickedRack,
            setClickedRack,
            isEditingRoom,
            setIsEditingRoom,
            modRows,
            setModRows,
            cageDetails,
            setCageDetails,
            isDirty,
            setIsDirty,
            isEditEnabled,
            setIsEditEnabled,
            localRoom,
            loading,
            error,
            saveChanges,
            hasUnsavedChanges: JSON.stringify(removeCircularReferences(room)) !== JSON.stringify(removeCircularReferences(localRoom)),
            isDraggingEnabled,
            setIsDraggingEnabled,
            selectedPage,
            setSelectedPage,
            cageCount
        }}>
            {children}
        </HomeContext.Provider>
    );
};

