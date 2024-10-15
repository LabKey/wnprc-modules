import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { Cage, CageLocations, Page, Rack, RackTypes } from './typings';
import { removeCircularReferences } from './helpers';

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
    localRoom: Rack[];
    addRack: (id: number, x: number, y: number, scale: number) => void;
    delRack: (id: number) => void;
    changeCageId: (idBefore: number, idAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveRackLocation: (rackId: number, x: number, y: number, k: number) => void;
    mergeLocalRacks: (targetNum: number, draggedNum: number) => void;
    getCageCount: () => number;
    clickedRack: number;
    setClickedRack: React.Dispatch<React.SetStateAction<number>>;
    clickedCage: number;
    setClickedCage: React.Dispatch<React.SetStateAction<number>>;
    delCage: () => void;
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
    const [localRoom, setLocalRoom] = useState<Rack[]>([]);
    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);
    const [clickedRack, setClickedRack] = useState<number | null>(null);
    const [clickedCage, setClickedCage] = useState<number | null>(null);

    const addRack = (id: number, x: number, y: number, scale: number) => {
        const newCageNum = getCageCount();
        const firstCage: Cage = {
            adjCages: undefined,
            cageState: undefined,
            id: 1,
            cageNum: newCageNum,
            position: 'top',
            type: undefined,
            x: 0,
            y: 0,
        };

        // First cage in rack is always at rack starting position as well
        const newCageLoc: CageLocations = {
            num: newCageNum,
            cellX: x,
            cellY: y,
            scale: scale
        }

        const newRack: Rack = {
            cages: [firstCage],
            id: id,
            isActive: true,
            type: RackTypes.OneOfOne,
            x: x,
            y: y,
            scale: scale
        };
        setLocalRoom(prevRacks => [...prevRacks, newRack]);

        setCageLocs((prevCageLocs) => {
            // Add the new box location
            const updatedCageLocs = [...prevCageLocs, newCageLoc];

            // Set the scale of all boxes to the scale of the new box location
            return updatedCageLocs.map(box => ({
                ...box,
                scale: newCageLoc.scale,
            }));
        });
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
                x: targetRack.x || dragRack.x,
                y: targetRack.y || dragRack.y,
                scale: targetRack.scale || dragRack.scale,
                isActive: targetRack.isActive || dragRack.isActive,
            };

            // Filter out the original racks and add the merged rack
            return prevRacks.filter(r => r.id !== targetRack.id && r.id !== dragRack.id).concat(mergedRack);
        });
    }

    const moveRackLocation = (rackId: number, x: number, y: number, k: number) => {
        // Update localRoom and then find the moved rack to update cageLocs
        setLocalRoom((prevState) => {
            const updatedLocalRoom = prevState.map(rack =>
                rack.id === rackId
                    ? {
                        ...rack,
                        x: x, // Update rack's new x position
                        y: y, // Update rack's new y position
                        scale: k
                    }
                    : rack
            );

            // After updating localRoom, use updatedLocalRoom to adjust cageLocs
            setCageLocs((prevCageLocs) =>
                prevCageLocs.map(cage => {
                    // Find if the cage belongs to the moved rack
                    const isInMovedRack = updatedLocalRoom.find(rack =>
                        rack.id === rackId &&
                        rack.cages.some(rackCage => rackCage.cageNum === cage.num)
                    );

                    return isInMovedRack
                        ? {
                            ...cage,
                            // New absolute positions for cages
                            cellX: x + isInMovedRack.x, // Add rack's new x position
                            cellY: y + isInMovedRack.y, // Add rack's new y position
                            scale: k  // Update scale
                        }
                        : cage; // Leave other cages unchanged
                })
            );

            return updatedLocalRoom as Rack[]; // Return the updated localRoom
        });
    };

    const delRack = (id: number) => {
        if(getCageCount() == 0) return;
        setLocalRoom(prevRacks =>  prevRacks.filter(rack => rack.id !== id));
    }

    const delCage = () => {
        if(getCageCount() == 0) return;
        console.log("deleting: ", clickedCage)
    }

    const changeCageId = (idBefore: number, idAfter: number) => {
        if(getCageCount() == 0){
            return;
        }
        if(localRoom.find(rack => rack.cages.find(cage =>
            cage.cageNum === idAfter
        ))){
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
            delRack,
            cageLocs,
            changeCageId,
            cageNumChange,
            moveRackLocation,
            mergeLocalRacks,
            getCageCount,
            clickedRack,
            setClickedRack,
            clickedCage,
            setClickedCage,
            delCage
        }}>
            {children}
        </LayoutContext.Provider>
    );
}