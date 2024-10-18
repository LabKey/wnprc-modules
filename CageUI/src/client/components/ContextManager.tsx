import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import {
    Cage,
    CageSizes,
    CageType,
    LocationCoords,
    Page,
    Rack,
    RackTypes,
    UnitLocations
} from './typings';
import { getTranslation, removeCircularReferences } from './helpers';

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
    unitLocs: UnitLocations;
    localRoom: Rack[];
    addRack: (id: number, x: number, y: number, newScale: number, rackType: RackTypes) => void;
    delRack: (id: number) => void;
    changeCageId: (idBefore: number, idAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveRackLocation: (rackId: number, x: number, y: number, k: number) => void;
    mergeLocalRacks: (targetRackNum: number, draggedRackNum: number, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    getNextCageNum: (rackType: RackTypes) => number;
    clickedRack: number;
    setClickedRack: React.Dispatch<React.SetStateAction<number>>;
    clickedCage: number;
    setClickedCage: React.Dispatch<React.SetStateAction<number>>;
    delCage: () => void;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
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
    const [unitLocs, setUnitLocs] = useState<UnitLocations>({
        [RackTypes.Pen]: [],
        [RackTypes.Cage]: [],
        [RackTypes.PlayCage]: [],
        [RackTypes.TempCage]: [],
    });
    const [localRoom, setLocalRoom] = useState<Rack[]>([]);
    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);
    const [clickedRack, setClickedRack] = useState<number | null>(null);
    const [clickedCage, setClickedCage] = useState<number | null>(null);
    // instead of tying scale to each location, manage one scale for the whole layout
    const [scale, setScale] = useState<number>(1);

    const addRack = (id: number, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum = getNextCageNum(rackType);
        const firstCage: Cage = {
            adjCages: undefined,
            cageState: undefined,
            id: 1,
            cageNum: newCageNum,
            position: 'top',
            type: rackType === RackTypes.Pen ? CageType.Pen : CageType.Allentown,
            size: CageSizes['8.0'],
            x: 0,
            y: 0,
        };

        // First cage in rack is always at rack starting position as well
        const newCageLoc: LocationCoords = {
            num: newCageNum,
            cellX: x,
            cellY: y
        }

        const newRack: Rack = {
            cages: [firstCage],
            id: id,
            isActive: true,
            type: rackType,
            x: x,
            y: y,
            scale: newScale
        };
        setLocalRoom(prevRacks => [...prevRacks, newRack]);

        setUnitLocs(prevState => ({
            ...prevState,
            [rackType]: [...prevState[rackType], newCageLoc] // Append the new location to the correct array
        }));
        setScale(newScale);
    };

    const mergeLocalRacks = (targetNum, dragNum, newGroup) => {
        console.log("context merge: ", newGroup, targetNum, dragNum);


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

            const updatedCages: Cage[] = mergedCages.map(cage => {
                const newCage = newGroup.select(`#cage-${cage.cageNum}`);
                const cageCoords = getTranslation(newCage.attr('transform'));
                return {...cage, x: cageCoords.x, y: cageCoords.y }
            })

            // Create new merged rack
            const mergedRack: Rack = {
                id: targetRack.id, // Use the larger ID for the merged rack
                type: targetRack.type || dragRack.type,
                cages: updatedCages,
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

            // Find the moved rack to access its cages
            const movedRack = updatedLocalRoom.find(rack => rack.id === rackId);

            // Update cageLocs based on the new rack coordinates
            if (movedRack) {
                setUnitLocs((prevUnitLocations) =>
                    ({
                        ...prevUnitLocations,
                        // Access the correct unit location array using rack type
                        [movedRack.type]: prevUnitLocations[movedRack.type].map(cage => {
                            // Check if the cage belongs to the moved rack using cageNum
                            const movedRackCage = movedRack.cages.find(rackCage => rackCage.cageNum === cage.num);
                            return movedRackCage
                                ? {
                                    ...cage,
                                    // Update the cage's coordinates by adding its own coordinates to the new rack's coordinates
                                    cellX: x + movedRackCage.x, // Add new rack's x position to cage's local x
                                    cellY: y + movedRackCage.y, // Add new rack's y position to cage's local y
                                }
                                : cage; // Leave other cages unchanged
                        })
                    })
                );
            }
            return updatedLocalRoom as Rack[]; // Return the updated localRoom
        });
    };

    const delRack = (id: number) => {
        setLocalRoom(prevRacks =>  prevRacks.filter(rack => rack.id !== id));
    }

    const delCage = () => {
        console.log("deleting: ", clickedCage)
    }

    const changeCageId = (idBefore: number, idAfter: number) => {
        if(localRoom.find(rack => rack.cages.find(cage =>
            cage.cageNum === idAfter
        ))){
            console.log("Please add a different id that doesnt exist in the current room");
            return;
        }
        setLocalRoom(prevRacks => {
            // Find the clicked rack
            const currRack = prevRacks.find(rack => rack.id === clickedRack);

            if (!currRack) return prevRacks; // If the clicked rack is not found, return the previous state

            // Update the local room by updating the cage numbers in the clicked rack
            const updatedLocalRoom = prevRacks.map(rack =>
                rack.id === clickedRack
                    ? {
                        ...rack,
                        cages: rack.cages.map(cage =>
                            cage.cageNum === idBefore ? { ...cage, cageNum: idAfter } : cage
                        )
                    }
                    : rack
            );

            // Now update the unit locations using the rackType from currRack
            setUnitLocs(prevUnitLocations => ({
                ...prevUnitLocations,
                // Access the correct unit location array based on clickedRack's rackType
                [currRack.type]: prevUnitLocations[currRack.type].map(cage =>
                    cage.num === idBefore ? { ...cage, num: idAfter } : cage
                )
            }));

            return updatedLocalRoom; // Return the updated local room state
        });

        setCageNumChange({before: idBefore, after: idAfter});
    }

    const getNextCageNum = (rackType: RackTypes) => {
        const cages = unitLocs[rackType];

        // If no cages exist for this rackType, return 1 as the first available cage number
        if (!cages || cages.length === 0) {
            return 1;
        }

        // Get the maximum cageNum in the current array of cages
        const maxCageNum = Math.max(...cages.map(cage => cage.num));

        // Return the next available cageNum (max + 1)
        return maxCageNum + 1;
    };

    return (
        <LayoutContext.Provider value={{
            room,
            setRoom,
            localRoom,
            addRack,
            delRack,
            unitLocs,
            changeCageId,
            cageNumChange,
            moveRackLocation,
            mergeLocalRacks,
            getNextCageNum,
            clickedRack,
            setClickedRack,
            clickedCage,
            setClickedCage,
            delCage,
            scale,
            setScale
        }}>
            {children}
        </LayoutContext.Provider>
    );
}