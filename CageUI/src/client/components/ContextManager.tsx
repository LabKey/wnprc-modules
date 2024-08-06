import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Cage, Rack } from './typings';
import { removeCircularReferences } from './helpers';

export interface RoomContextType {
    room: Rack[],
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>,
    clickedCage: Cage | null,
    setClickedCage: React.Dispatch<React.SetStateAction<Cage | null>> | null,
    clickedRack: Rack | null,
    setClickedRack: React.Dispatch<React.SetStateAction<Rack | null>> | null,
    isEditingRoom: boolean, // determines when the user is in edit mode
    setIsEditingRoom: React.Dispatch<React.SetStateAction<boolean>>,
    modRows: React.JSX.Element[],
    setModRows: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
    cageDetails: Cage[] | null,
    setCageDetails: React.Dispatch<React.SetStateAction<Cage[] | null>> | null,
    saveMod: () => void,
    isDirty: boolean,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
    isEditEnabled: boolean, // determines if the user has valid permissions to edit
    setIsEditEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    loading: boolean,
    error: string,
    localRoom: Rack[],
    addRack: (newRack: any) => void,
    updateLocalRacks: (id: any, newX: any, newY: any) => void,
    saveChanges: () => void,
    hasUnsavedChanges: boolean,
    isDraggingEnabled: boolean,
    setIsDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>

}

export interface LayoutContextType {
    room: Rack[],
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>,
    localRoom: Rack[],
    addRack: (newRack: any) => void,
}

const RoomContext = createContext<RoomContextType | null>(null);
const LayoutContext = createContext<LayoutContextType | null>(null)

export const useLayoutContext = () => {
    const context = useContext(LayoutContext);

    if (!context) {
        throw new Error(
            "useCurrentContext has to be used within <LayoutContext.Provider>"
        );
    }

    return context;
}

export const useCurrentContext = () => {
    const context = useContext(RoomContext);

    if (!context) {
        throw new Error(
            "useCurrentContext has to be used within <RoomContext.Provider>"
        );
    }

    return context;
};

export const RoomContextProvider = ({children}) => {
    const [room, setRoom] = useState<Rack[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
    const [isEditEnabled, setIsEditEnabled] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState<boolean>(false);

    /*
    Context for room svg
     */
    const [localRoom, setLocalRoom] = useState<Rack[]>(room);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addRack = async (newRect) => {
        setLocalRoom(prevRectangles => [...prevRectangles, newRect]);
    };

    const updateLocalRacks = (id, newX, newY) => {
        setLocalRoom(prevRack => prevRack.map(r =>
            r.id === id ? { ...r, xPos: newX, yPos: newY } : r
        ));
    };

    const saveChanges = async () => {
        try {
            setRoom(localRoom);
            setError(null);
        } catch (err) {
            setError('Failed to save changes');
        }
    };
    /*
    End SVG context
     */
    const saveMod = () => {
        setIsDirty(false);
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = clickedRack.id - 1;
            if (updatedRoom[clickedRackIndex]) {
                // Create a deep copy of the cage state object
                updatedRoom[clickedRackIndex].cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;

                clickedRack.cages.forEach((cage) => {
                    updatedRoom[clickedRackIndex].cages.find(
                        (updateCage) => updateCage.id === cage.id
                    ).cageState = cage.cageState;
                })
            }
            return updatedRoom;
        });
    }

    return (
        <RoomContext.Provider value={{
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
            saveMod,
            isDirty,
            setIsDirty,
            isEditEnabled,
            setIsEditEnabled,
            localRoom,
            loading,
            error,
            addRack,
            updateLocalRacks,
            saveChanges,
            hasUnsavedChanges: JSON.stringify(removeCircularReferences(room)) !== JSON.stringify(removeCircularReferences(localRoom)),
            isDraggingEnabled,
            setIsDraggingEnabled
        }}>
            {children}
        </RoomContext.Provider>
    )
}

export const LayoutContextProvider = ({children}) => {
    const [room, setRoom] = useState<Rack[]>([]);
    const [localRoom, setLocalRoom] = useState<Rack[]>(room);

    const addRack = async (newRect) => {
        setLocalRoom(prevRectangles => [...prevRectangles, newRect]);
    };

    return (
        <LayoutContext.Provider value={{
            room,
            setRoom,
            localRoom,
            addRack
        }}>
            {children}
        </LayoutContext.Provider>
    );
}