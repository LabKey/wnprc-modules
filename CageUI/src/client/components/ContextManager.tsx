import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Cage, Rack, Page, CageLocations } from './typings';
import { removeCircularReferences } from './helpers';
import { svg } from 'd3';

export interface RoomContextType {
    selectedPage: Page;
    setSelectedPage: React.Dispatch<React.SetStateAction<Page | null>> | null;
    room: Rack[];
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>;
    clickedCage: Cage | null;
    setClickedCage: React.Dispatch<React.SetStateAction<Cage | null>> | null;
    clickedRack: Rack | null;
    setClickedRack: React.Dispatch<React.SetStateAction<Rack | null>> | null;
    isEditingRoom: boolean, // determines when the user is in edit mod;
    setIsEditingRoom: React.Dispatch<React.SetStateAction<boolean>>;
    modRows: React.JSX.Element[];
    setModRows: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>;
    cageDetails: Cage[] | null;
    setCageDetails: React.Dispatch<React.SetStateAction<Cage[] | null>> | null;
    saveMod: () => void;
    isDirty: boolean;
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
    isEditEnabled: boolean, // determines if the user has valid permissions to edi;
    setIsEditEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean;
    error: string;
    localRoom: Rack[];
    saveChanges: () => void;
    hasUnsavedChanges: boolean;
    isDraggingEnabled: boolean;
    setIsDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    cageCount: number;
}

export interface LayoutContextType {
    room: Rack[];
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>;
    cageLocs: CageLocations[];
    setCageLocs: React.Dispatch<React.SetStateAction<CageLocations[]>>;
    localRoom: Rack[];
    addRack: (id: number) => void;
    setCageCount: React.Dispatch<React.SetStateAction<number>>;
    cageCount: number;
    delRack: (id: number) => void;
    changeCageId: (idBefore: number, idAfter: number) => void;
    cageNumChange: {before: number, after: number};
    addNewCageLocation: (newCage: CageLocations) => void;
    moveCageLocation: (cageNum: number, x: number, y: number, k: number) => void;
    mergeLocalRacks: (targetNum: number, draggedNum: number) => void;
    getCageCount: () => number;
    clickedRack: number;
    setClickedRack: React.Dispatch<React.SetStateAction<number>>;
}

const RoomContext = createContext<RoomContextType | null>(null);
const LayoutContext = createContext<LayoutContextType | null>(null)

export const useLayoutContext = () => {
    const context = useContext(LayoutContext);

    if (!context) {
        throw new Error(
            "useRoomContext has to be used within <LayoutContext.Provider>"
        );
    }

    return context;
}

export const useRoomContext = () => {
    const context = useContext(RoomContext);

    if (!context) {
        throw new Error(
            "useRoomContext has to be used within <RoomContext.Provider>"
        );
    }

    return context;
};

export const RoomContextProvider = ({children}) => {
    // New state management
    const [selectedPage, setSelectedPage] = useState<Page>(null);

    // End new state management
    const [room, setRoom] = useState<Rack[]>([]);
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
    const [localRoom, setLocalRoom] = useState<Rack[]>(room);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            saveChanges,
            hasUnsavedChanges: JSON.stringify(removeCircularReferences(room)) !== JSON.stringify(removeCircularReferences(localRoom)),
            isDraggingEnabled,
            setIsDraggingEnabled,
            selectedPage,
            setSelectedPage,
            cageCount
        }}>
            {children}
        </RoomContext.Provider>
    )
}

export const LayoutContextProvider = ({children}) => {
    const [room, setRoom] = useState<Rack[]>([]);
    const [cageLocs, setCageLocs] = useState<CageLocations[]>([])
    const [localRoom, setLocalRoom] = useState<Rack[]>(room);
    const [cageCount, setCageCount] = useState<number>(1);
    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);
    const [clickedRack, setClickedRack] = useState<number | null>(null);

    const addRack = (id: number) => {
        const firstCage: Cage = {
            adjCages: undefined,
            cageState: undefined,
            id: 1,
            cageNum: cageCount,
            manufacturer: undefined,
            name: '',
            position: '',
            size: undefined,
            type: undefined
        };
        const newRack: Rack = {
            cages: [firstCage],
            id: id,
            isActive: false,
            type: undefined
        };
        setLocalRoom(prevRacks => [...prevRacks, newRack]);
        setCageCount(prevState => prevState + 1);
    };

    const mergeLocalRacks = (targetNum: number, dragNum: number) => {
        console.log("context merge: ", targetNum, dragNum, localRoom);

        setLocalRoom(prevRacks => {
            const targetRack = prevRacks.find(r => r.id === targetNum);
            const dragRack = prevRacks.find(r => r.id === dragNum);

            if (!targetRack || !dragRack) {
                console.error("One or both racks not found");
                return prevRacks;
            }

            // Merge cages and reassign local IDs
            const mergedCages = [...targetRack.cages, ...dragRack.cages].map((cage, index) => ({
                ...cage,
                id: index + 1, // Reassign local IDs
            }));

            // Create new merged rack
            const mergedRack: Rack = {
                id: targetRack.id, // Use the larger ID for the merged rack
                type: targetRack.type || dragRack.type,
                cages: mergedCages,
                xPos: targetRack.xPos || dragRack.xPos,
                yPos: targetRack.yPos || dragRack.yPos,
                isActive: true,
            };

            // Filter out the original racks and add the merged rack
            return prevRacks.filter(r => r.id !== targetRack.id && r.id !== dragRack.id).concat(mergedRack);
        });
    }

    const addNewCageLocation = (newCage: CageLocations) => {
        setCageLocs((prevCageLocs) => {
            // Add the new box location
            const updatedCageLocs = [...prevCageLocs, newCage];

            // Set the scale of all boxes to the scale of the new box location
            return updatedCageLocs.map(box => ({
                ...box,
                scale: newCage.scale,
            }));
        });
    };

    const moveCageLocation = (cageNum: number, x: number, y: number, k: number) => {
        setCageLocs((prevCageLocs) =>
            prevCageLocs.map(cage =>
                cage.num === cageNum
                    ? { ...cage, cellX: x, cellY: y, scale: k }  // Update x, y, and scale of the target box
                    : { ...cage, scale: k }  // Only update the scale of other boxes
            )
        );

    };

    const delRack = (id: number) => {
        if(cageCount == 0) return;
        setLocalRoom(prevRacks =>  prevRacks.filter(rack => rack.id !== id));
        setCageCount(prevState => prevState - 1);
    }

    const changeCageId = (idBefore: number, idAfter: number) => {
        if(cageCount == 0){
            return;
        }
        if(localRoom.find(rack => rack.id === idAfter)){
            console.log("Please add a different id that doesnt exist in the current room");
            return;
        }
        setLocalRoom(prevRacks => prevRacks.map(rack =>
            rack.id === clickedRack
                ? {...rack, cages: rack.cages.map(cage =>
                        cage.cageNum === idBefore ? {...cage, cageNum: idAfter} : cage
                    )}
                : rack
        ));
        setCageLocs(prevCages =>  prevCages.map(cage =>
            cage.num === idBefore ? { ...cage, num: idAfter } : cage
        ));

        setCageNumChange({before: idBefore, after: idAfter});
    }

    const getCageCount = () => {
        return cageLocs.reduce((max, obj) => (obj.num > max ? obj.num : max), 0) + 1;
    }

    return (
        <LayoutContext.Provider value={{
            room,
            setRoom,
            localRoom,
            addRack,
            cageCount,
            setCageCount,
            delRack,
            changeCageId,
            cageNumChange,
            cageLocs,
            setCageLocs,
            addNewCageLocation,
            moveCageLocation,
            mergeLocalRacks,
            getCageCount,
            clickedRack,
            setClickedRack
        }}>
            {children}
        </LayoutContext.Provider>
    );
}