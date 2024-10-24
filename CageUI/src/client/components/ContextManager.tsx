import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    Cage, CageNumber,
    CageSizes,
    CageType, LayoutHistoryData,
    LocationCoords,
    Page,
    Rack,
    RackTypes, RoomItem,
    UnitLocations
} from './typings';
import { convertCageNumToNum, getTranslation, removeCircularReferences } from './helpers';
import { testCagesInRoom, testLayoutHistory, testRoomObj } from '../layoutEditor/testData';
import { buildNewLocalRoom, isRack } from './LayoutEditorHelpers';

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
    localRoom: RoomItem[];
    addRack: (id: number, x: number, y: number, newScale: number, rackType: RackTypes) => void;
    delRack: (id: number) => void;
    changeCageId: (idBefore: number, idAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveObjLocation: (objId: number, x: number, y: number, k: number) => void;
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

export const LayoutContextProvider = ({children, prevRoom}) => {
    const [room, setRoom] = useState<Rack[]>([]);
    /* unit locations resembles each rack type and their respective locations in a room, since location is geospatial
        it does not need to remember anything other than x and y coords for that group of racks. The reason for having
        different objects for each rack type is to keep a separate numbering system for each type of rack.
    */
    const [unitLocs, setUnitLocs] = useState<UnitLocations>({
        [RackTypes.Pen]: [],
        [RackTypes.Cage]: [],
        [RackTypes.PlayCage]: [],
        [RackTypes.TempCage]: [],
    });
    const [localRoom, setLocalRoom] = useState<RoomItem[]>([]);
    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);
    const [clickedRack, setClickedRack] = useState<number | null>(null);
    const [clickedCage, setClickedCage] = useState<number | null>(null);
    // instead of tying scale to each location, manage one scale for the whole layout
    const [scale, setScale] = useState<number>(1);

    const addRack = (id: number, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum: CageNumber = `${rackType}-${getNextCageNum(rackType)}`;
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

        setLocalRoom(prevObj => {
            let targetObj = prevObj.find(r => r.id === targetNum);
            let dragObj = prevObj.find(r => r.id === dragNum);

            if (!targetObj || !dragObj) {
                console.error("One or both racks not found");
                return prevObj;
            }
            if(!isRack(targetObj.type.toString()) || !isRack(dragObj.type.toString())) return prevObj;
            targetObj = targetObj as Rack;
            dragObj = dragObj as Rack;
            let mergedCages;
            // Merge cages and reassign local IDs
            mergedCages = [...targetObj.cages, ...dragObj.cages].map((cage, index) => ({
                ...cage,
                id: index + 1, // Reassign local IDs
            }));

            const updatedCages: Cage[] = mergedCages.map(cage => {
                const newCage = newGroup.select(`#${cage.cageNum}`);
                const cageCoords = getTranslation(newCage.attr('transform'));
                return {...cage, x: cageCoords.x, y: cageCoords.y }
            })

            // Create new merged rack
            const mergedRack: Rack = {
                id: targetObj.id, // Use the larger ID for the merged rack
                type: targetObj.type || dragObj.type,
                cages: updatedCages,
                x: targetObj.x || dragObj.x,
                y: targetObj.y || dragObj.y,
                scale: targetObj.scale || dragObj.scale,
                isActive: targetObj.isActive || dragObj.isActive,
            };

            // Filter out the original racks and add the merged rack
            return prevObj.filter(r => r.id !== targetObj.id && r.id !== dragObj.id).concat(mergedRack);
        });
    }

    const moveObjLocation = (objId: number, x: number, y: number, k: number) => {
        // Update localRoom and then find the moved rack to update cageLocs
        setLocalRoom((prevState: RoomItem[]) => {
            const updatedLocalRoom = prevState.map(item =>
                item.id === objId
                    ? {
                        ...item,
                        x: x, // Update rack's new x position
                        y: y, // Update rack's new y position
                        scale: k
                    }
                    : item
            );

            // Find the moved rack to access its cages
            const movedRack: Rack = updatedLocalRoom.find(rack => rack.id === objId) as Rack;

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
        if(localRoom.find(roomItem => 'cages' in roomItem ? roomItem.cages.find(cage =>
            convertCageNumToNum(cage.cageNum) === idAfter
        ) : roomItem)){
            console.log("Please add a different id that doesnt exist in the current room");
            return;
        }
        setLocalRoom((prevRacks: Rack[]) => {
            // Find the clicked rack
            const currRack: Rack = prevRacks.find(rack => rack.id === clickedRack);

            if (!currRack) return prevRacks; // If the clicked rack is not found, return the previous state

            // Update the local room by updating the cage numbers in the clicked rack
            const updatedLocalRoom: Rack[] = prevRacks.map((rack: Rack): Rack =>
                rack.id === clickedRack
                    ? {
                        ...rack,
                        cages: rack.cages.map((cage: Cage): Cage =>
                            convertCageNumToNum(cage.cageNum) === idBefore ? { ...cage, cageNum: `${currRack.type}-${idAfter}` } as Cage : cage
                        )
                    }
                    : rack
            );

            // Now update the unit locations using the rackType from currRack
            setUnitLocs(prevUnitLocations => ({
                ...prevUnitLocations,
                // Access the correct unit location array based on clickedRack's rackType
                [currRack.type]: prevUnitLocations[currRack.type].map(cage =>
                    convertCageNumToNum(cage.num) === idBefore ? { ...cage, num: `${currRack.type}-${idAfter}` } : cage
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
        const maxCageNum = Math.max(...cages.map(cage => convertCageNumToNum(cage.num)));

        // Return the next available cageNum (max + 1)
        return maxCageNum + 1;
    };

    // Loads a room into state if it is not null
    useEffect(() => {
        if(!prevRoom) return;
        // Test data on pre created objects to determine a working backend
        // TODO Query statement to fetch layout history data based on room
        const layoutData: LayoutHistoryData[] = testLayoutHistory;
        // TODO Query statement to fetch cage data based racks in room at the time
        const rackData = testCagesInRoom;

        //TODO query statement to fetch room objects based on location in layout history
        const roomObjData = testRoomObj;

        const newLocalRoom: RoomItem[] = buildNewLocalRoom(layoutData, rackData, roomObjData);

        console.log("Load Data: ", newLocalRoom);

    }, [prevRoom]);

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
            moveObjLocation,
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