import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    Cage, CageNumber,
    CageSizes,
    CageType, DEFAULT_CAGE_TYPE, DEFAULT_PEN_TYPE, LayoutHistoryData,
    LocationCoords,
    Page,
    Rack, RackActions,
    RackTypes, Room, RoomItem, RoomItemType, RoomObject, RoomObjectTypes,
    UnitLocations
} from './typings';
import { convertCageNumToNum, getTranslation, parseItemType, removeCircularReferences } from './helpers';
import { testCagesInRoom, testLayoutHistory, testRoomObj } from '../layoutEditor/testData';
import { buildNewLocalRoom, isRack } from './LayoutEditorHelpers';

export interface RoomContextType {
    selectedPage: Page;
    setSelectedPage: React.Dispatch<React.SetStateAction<Page | null>> | null;
    room: RoomItem[];
    setRoom: React.Dispatch<React.SetStateAction<RoomItem[]>>;
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
    localRoom: RoomItem[];
    saveChanges: () => void;
    hasUnsavedChanges: boolean;
    isDraggingEnabled: boolean;
    setIsDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    cageCount: number;
}

export interface LayoutContextType {
    room: Room;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
    unitLocs: UnitLocations;
    localRoom: Room;
    addRoomItem: (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number) => void;
    delRack: (rackId: string) => void;
    changeCageNum: (numBefore: number, numAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveObjLocation: (itemId: string, type: RoomItemType, x: number, y: number, k: number) => void;
    doRackAction: (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    getNextCageNum: (rackType: RackTypes) => number;
    selectedObj: string;
    setSelectedObj: React.Dispatch<React.SetStateAction<string>>;
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
    const [room, setRoom] = useState<Room>({
        room: "new-layout",
        racks: [],
        objects: []
    });
    /* unit locations resembles each rack type and their respective locations in a room, since location is geospatial
        it does not need to remember anything other than x and y coords for that group of racks. The reason for having
        different objects for each rack type is to keep a separate numbering system for each type of rack. Additionally
        this state is tracked for detecting merging.
    */
    const [unitLocs, setUnitLocs] = useState<UnitLocations>({
        [RackTypes.Pen]: [],
        [RackTypes.Cage]: [],
        [RackTypes.PlayCage]: [],
        [RackTypes.TempCage]: [],
    });
    const [localRoom, setLocalRoom] = useState<Room>({
        room:"new-layout",
        racks: [],
        objects: []
    });
    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);
    const [selectedObj, setSelectedObj] = useState<string | null>(null);
    const [clickedCage, setClickedCage] = useState<number | null>(null);
    const [groupCount, setGroupCount] = useState<number>(1);

    // instead of tying scale to each location, manage one scale for the whole layout
    const [scale, setScale] = useState<number>(1);

    const addRack = (id: string, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum: CageNumber = `${rackType}-${getNextCageNum(rackType)}`;

        const firstCage: Cage = {
            adjCages: undefined,
            cageState: undefined,
            rack: "unknown",
            id: 1,
            cageNum: newCageNum,
            position: 'top',
            type: rackType === RackTypes.Pen ? DEFAULT_PEN_TYPE : DEFAULT_CAGE_TYPE,
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
            itemId: id,
            groupId: groupCount,
            isActive: true,
            type: rackType,
            x: x,
            y: y,
            scale: newScale
        };

        setLocalRoom(prevRoom => ({
            ...prevRoom,
            racks: [...prevRoom.racks, newRack]
        }));

        setGroupCount(prevState => prevState + 1);

        setUnitLocs(prevState => ({
            ...prevState,
            [rackType]: [...prevState[rackType], newCageLoc] // Append the new location to the correct array
        }));
        setScale(newScale);
    };



    const mergeLocalRacks = (targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
        console.log("context merge: ", newGroup, targetId, dragId);

        setLocalRoom(prevRoom => {
            let targetRack: Rack = prevRoom.racks.find((r: Rack) => {
                    return r.itemId === targetId;
            });

            let dragRack: Rack = prevRoom.racks.find((r: Rack) => {
                    return r.itemId === dragId;
            });

            if (!targetRack || !dragRack) {
                console.error("One or both racks not found");
                return prevRoom;
            }

            // Merge cages and reassign local IDs
            const mergedCages = [...targetRack.cages, ...dragRack.cages].map((cage, index) => ({
                ...cage,
                id: index + 1, // Reassign local IDs
            }));
            // TODO fix merging between pens and cages
            const updatedCages: Cage[] = mergedCages.map(cage => {
                const newCage = newGroup.select(`#${cage.cageNum}`);
                const cageCoords = getTranslation(newCage.attr('transform'));
                return {...cage, x: cageCoords.x, y: cageCoords.y }
            })

            // Create new merged rack
            const mergedRack: Rack = {
                itemId: targetRack.itemId, // Use the larger ID for the merged rack
                type: targetRack.type,
                groupId: targetRack.groupId,
                cages: updatedCages,
                x: targetRack.x,
                y: targetRack.y,
                scale: targetRack.scale,
                isActive: targetRack.isActive,
            };

            // Filter out the original racks and add the merged rack
            return ({
                ...prevRoom,
                racks: prevRoom.racks.filter(r => {
                    return r.itemId !== targetRack.itemId && r.itemId !== dragRack.itemId;
                }).concat(mergedRack)
            });
        });
    }

    const doRackAction = (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
        if(action === 'merge'){
            mergeLocalRacks(targetId, dragId, newGroup);
        }else{ // action = cancel

        }
    }

    const addRoomItem = (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number) => {
        if(isRack(itemType)){
            addRack(itemId, x, y, scale, itemType as RackTypes);
        }else{
            const newRoomObj: RoomObject = {
                itemId: itemId,
                type: itemType as RoomObjectTypes,
                x: x,
                y: y,
                scale: scale
            }
            setLocalRoom(prevRoom => ({
                ...prevRoom,
                objects: [...prevRoom.objects, newRoomObj]
            }));
        }
    }

    const moveObjLocation = (itemId: string, type: RoomItemType, x: number, y: number, k: number) => {
        // Update localRoom and then find the moved rack to update cageLocs
        setLocalRoom(prevRoom => {
            let updatedLocalRoom: Room;

            const itemKey = isRack(type) ? 'racks' : 'objects';

            updatedLocalRoom = {
                ...prevRoom,
                [itemKey]: prevRoom[itemKey].map(item =>
                    item.itemId === itemId
                        ? { ...item, x, y, scale: k }
                        : item
                )
            };

            // Update cageLocs based on the new rack coordinates
            if (itemKey === 'racks') {
                // Find the moved rack to access its cages
                const movedRack: Rack = updatedLocalRoom.racks.find(rack => {
                        return rack.itemId === itemId;
                });

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
            return updatedLocalRoom; // Return the updated localRoom
        });
    };

    const delRack = (rackId: string) => {
        setLocalRoom(prevRoom =>  ({
            ...prevRoom,
            racks: prevRoom.racks.filter(roomItem => {
                return roomItem.itemId !== rackId;
            })
        }));
    }

    const delCage = () => {
        console.log("deleting: ", clickedCage)
    }

    const changeCageNum = (numBefore: number, numAfter: number) => {
        if(localRoom.racks.find(prevRacks => prevRacks.cages.find(
            cage => convertCageNumToNum(cage.cageNum) === numAfter))){
            console.log("Please add a different cage num that doesnt exist in the current room");
            return;
        }

        setLocalRoom((prevRoom) => {
            // Find the clicked rack
            const currRack: Rack = prevRoom.racks.find(rack => {
                return rack.itemId === selectedObj
            });

            if (!currRack) return prevRoom; // If the clicked rack is not found, return the previous state

            // Update the local room by updating the cage numbers in the clicked rack
            const updatedLocalRoom: Room = ({
                ...prevRoom,
                racks: prevRoom.racks.map((rack: Rack): Rack =>
                    rack.itemId === selectedObj
                        ? {
                            ...rack,
                            cages: rack.cages.map((cage: Cage): Cage =>
                                convertCageNumToNum(cage.cageNum) === numBefore ? { ...cage, cageNum: `${currRack.type}-${numAfter}` } as Cage : cage
                            )
                        }
                        : rack
                )}
            );

            // Now update the unit locations using the rackType from currRack
            setUnitLocs(prevUnitLocations => ({
                ...prevUnitLocations,
                // Access the correct unit location array based on clickedRack's rackType
                [currRack.type]: prevUnitLocations[currRack.type].map(cage =>
                    convertCageNumToNum(cage.num) === numBefore ? { ...cage, num: `${currRack.type}-${numAfter}` } : cage
                )
            }));

            return updatedLocalRoom; // Return the updated local room state
        });

        setCageNumChange({before: numBefore, after: numAfter});
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
            addRoomItem,
            delRack,
            unitLocs,
            changeCageNum,
            cageNumChange,
            moveObjLocation,
            doRackAction,
            getNextCageNum,
            selectedObj,
            setSelectedObj,
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