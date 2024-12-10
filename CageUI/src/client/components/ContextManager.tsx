import * as React from 'react';
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import {
    Cage,
    CageNumber,
    DEFAULT_CAGE_TYPE,
    DEFAULT_PEN_TYPE, DeleteActions,
    GroupId,
    LayoutHistoryData,
    LocationCoords,
    Page, PrevRoom,
    Rack,
    RackActions, RackGroup,
    RackTypes,
    Room,
    RoomItem, RoomItemClass,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    UnitLocations
} from './typings';
import {
    convertCageNumToNum,
    getTranslation, parseLongId,
    parseRoomItemNum,
    parseRoomItemType,
    removeCircularReferences, zeroPadName
} from './helpers';
import * as d3 from 'd3';
import {
    addPrevRoomSvgs,
    buildNewLocalRoom, buildNewLocs,
    findNextGroupId,
    findRackInGroup,
    findSelectObjRack,
    isRack,
} from './LayoutEditorHelpers';
import { Query } from '@labkey/api';
import { ExtendedXMLHttpRequest } from '@labkey/api/dist/labkey/Utils';
import { RequestOptions } from '@labkey/api/dist/labkey/Ajax';

interface LayoutContextProps {
    children: ReactNode;
    prevRoom: PrevRoom;
}

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
    saveRoom: () => void;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    setLayoutSvg: React.Dispatch<React.SetStateAction<d3.Selection<SVGElement, {}, HTMLElement, any>>>;
    unitLocs: UnitLocations;
    localRoom: Room;
    addRoomItem: (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number) => void;
    delRack: (rackId: string) => void;
    changeCageNum: (numBefore: number, numAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveObjLocation: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
    doRackAction: (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    getNextCageNum: (rackType: RackTypes) => number;
    selectedObj: string;
    setSelectedObj: React.Dispatch<React.SetStateAction<string>>;
    delCage: (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => void;
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

export const LayoutContextProvider: FC<LayoutContextProps> = ({children, prevRoom}) => {
    const [room, setRoom] = useState<Room>({
        room: "new-layout",
        rackGroups: [],
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
        rackGroups: [],
        objects: []
    });

    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);

    const [nextAvailGroup, setNextAvailGroup] = useState<GroupId>(`rack-group-1`); // Tracks currently active groups of racks

    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);

    // the id of the clicked on svg group for either dragging or context menu opening.
    const [selectedObj, setSelectedObj] = useState<string | null>(null);

    // instead of tying scale to each location, manage one scale for the whole layout
    const [scale, setScale] = useState<number>(1);

    /*
        Fixes the group ids of the rackGroups state in room and the svg ids for those state objects
    */
    const fixGroupIds = () => {

        setLocalRoom((prevRoom) => {

            const sortedGroups = prevRoom.rackGroups.sort((groupA, groupB) => {
                const aId = parseLongId(groupA.groupId);
                const bId = parseLongId(groupB.groupId);
                return aId - bId;
            });

            const newGroups: RackGroup[] = sortedGroups.map((group, index) => {
                const groupSvg = layoutSvg.select(`[id=${group.groupId}]`);
                const newId = index + 1;
                if(!groupSvg.empty()){ // if a group svg exists for the group, rename to new group
                    groupSvg.attr('id', `rack-group-${newId}`);
                }
                return {
                    ...group,
                    groupId: `rack-group-${newId}` as GroupId
                };
            });
            const lastId: number = parseLongId(newGroups[newGroups.length - 1].groupId);
            setNextAvailGroup(`rack-group-${lastId + 1}` as GroupId);
            return {
                ...prevRoom,
                rackGroups: newGroups
            };
        })
    }

    const addRack = (id: string, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum: CageNumber = `${rackType}-${getNextCageNum(rackType)}`;
        const firstCage: Cage = {
            adjCages: undefined,
            cageState: undefined,
            id: 1,
            cageNum: newCageNum,
            position: 'top',
            x: 0,
            y: 0,
            length: 0,
            width: 0,
            height: 0,
            sqft: 0
        };

        // First cage in rack is always at rack starting position as well
        const newCageLoc: LocationCoords = {
            num: newCageNum,
            cellX: x,
            cellY: y
        };

        const newRack: Rack = {
            cages: [firstCage],
            itemId: id,
            isActive: true,
            type: rackType === RackTypes.Pen ? DEFAULT_PEN_TYPE : DEFAULT_CAGE_TYPE,
            x: 0,
            y: 0
        };

        const newRackGroup: RackGroup = {
            groupId: nextAvailGroup,
            racks: [newRack],
            x: x,
            y: y,
            scale: newScale,
        }

        setNextAvailGroup(prevState => {
            const nextId = parseLongId(prevState) + 1;
            return `rack-group-${nextId}` as GroupId
        })
        setLocalRoom(prevRoom => ({
            ...prevRoom,
            rackGroups: [...prevRoom.rackGroups, newRackGroup]
        }));

        setUnitLocs(prevState => ({
            ...prevState,
            [rackType]: [...prevState[rackType], newCageLoc] // Append the new location to the correct array
        }));
        setScale(newScale);
    };



    const mergeLocalRacks = (targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
        console.log("context merge: ", newGroup, targetId, dragId);

        setLocalRoom(prevRoom => {

            let {rack: targetRack, rackGroup: targetGroup} = findRackInGroup(targetId, prevRoom.rackGroups);
            let {rack: dragRack, rackGroup: dragGroup} = findRackInGroup(dragId, prevRoom.rackGroups);

            if (!targetRack || !dragRack) {
                console.log("One or both racks not found");
                return prevRoom;
            }
            console.log("Context merge: ", targetRack, dragRack);
            // different rack types can be connected but not merged
            if(targetRack.type !== dragRack.type){
                console.log("Impossible configuration detected, please only merge racks of the same type");
                return prevRoom;
            }

            // Merge cages and reassign local IDs
            const mergedCages = [...targetRack.cages, ...dragRack.cages].map((cage, index) => ({
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
                itemId: targetRack.itemId, // Use the larger ID for the merged rack
                type: targetRack.type,
                cages: updatedCages,
                x: targetRack.x,
                y: targetRack.y,
                isActive: targetRack.isActive,
            };

            const mergedRackGroup: RackGroup = {
                groupId: targetGroup.groupId,
                x: targetGroup.x,
                y: targetGroup.y,
                scale: targetGroup.scale,
                racks: targetGroup.racks.filter(r => {
                    return r.itemId !== targetRack.itemId;
                }).concat(mergedRack)
            }

            // Filter out the original racks and add the merged rack
            return ({
                ...prevRoom,
                rackGroups: prevRoom.rackGroups.filter(r => {
                    return r.groupId !== targetGroup.groupId && r.groupId !== dragGroup.groupId;
                }).concat(mergedRackGroup)
            });
        });
    }

    const connectLocalRacks = (targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
        setLocalRoom(prevRoom => {
            let {rack: targetRack, rackGroup: targetGroup} = findRackInGroup(targetId, prevRoom.rackGroups);
            let {rack: dragRack, rackGroup: dragGroup} = findRackInGroup(dragId, prevRoom.rackGroups);

            if (!targetRack || !dragRack) {
                console.error("One or both racks not found");
                return prevRoom;
            }
            console.log("Connect new group: ", newGroup);
            // TODO Confirm this is working as intended, possible error might occur when dealing with different sized connections
            // Update the room to match the new group ids and update x and y to be local to the new rack group
            const updatedRackGroups = prevRoom.rackGroups.map((group: RackGroup) => {
                if (group.groupId === targetGroup.groupId) {
                    const updatedRacks = [
                        ...group.racks,
                        ...dragGroup.racks.map((r: Rack) => {
                            const tempRack = newGroup.select(`#${r.itemId}`);
                            const newRackCoords = getTranslation(tempRack.attr('transform'));
                            return {
                                ...r,
                                x: newRackCoords.x,
                                y: newRackCoords.y,
                                groupId: targetGroup.groupId
                            };
                        })
                    ];
                    return {
                        ...group,
                        racks: updatedRacks
                    };
                }
                if (group.groupId === dragGroup.groupId) {
                    return null;
                }
                return group;
            }).filter((group): group is RackGroup => group !== null); // filter out the drag group


            // Return the updated room
            return {
                ...prevRoom,
                rackGroups: updatedRackGroups
            };
        })
    }

    const doRackAction = (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
        if(action === 'merge'){
            mergeLocalRacks(targetId, dragId, newGroup);
        }else{ // action = connect
            connectLocalRacks(targetId, dragId, newGroup);
        }
        // After merging / connecting fix the group ids so that they have no gaps
        fixGroupIds();
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

    const moveObjLocation = (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => {
        // Update localRoom and then find the moved rack to update cageLocs
        setLocalRoom(prevRoom => {
            let updatedLocalRoom: Room;

            // Update cageLocs based on the new rack coordinates
            if (type === 'caging') {
                const idKey = itemId.includes('group') ? 'groupId' : 'itemId'; // determine if moving rack or group of racks
                if(idKey === 'itemId'){
                    updatedLocalRoom = {
                        ...prevRoom,
                        rackGroups: prevRoom.rackGroups.map(group =>
                            group.racks.some(item => item.itemId === itemId)
                                ? {
                                    ...group,
                                    x: x,
                                    y: y,
                                    scale: k
                                }
                                : group
                        )
                    };

                    const {rack: movedRack} = findRackInGroup(itemId, updatedLocalRoom.rackGroups);

                    // Find the moved rack to access its cages
                    if(!movedRack){
                        console.log("Failed to update cages location for rack");
                        return prevRoom; // cannot find an available rack id to move
                    }

                    setUnitLocs((prevUnitLocations) =>
                        ({
                            ...prevUnitLocations,
                            // Access the correct unit location array using rack type
                            [movedRack.type.type]: prevUnitLocations[movedRack.type.type].map(cage => {
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
                }else{
                    updatedLocalRoom = {
                        ...prevRoom,
                        rackGroups: prevRoom.rackGroups.map(group =>
                            group.groupId === itemId
                                ? {
                                    ...group,
                                    x: x,
                                    y: y,
                                    scale: k
                                }
                                : group
                        )
                    };

                    const movedRacks = updatedLocalRoom.rackGroups.find(group => {
                        return group.groupId === itemId;
                    }).racks;

                    // Find the moved rack to access its cages
                    if(movedRacks.length === 0){
                        console.log("Failed to update cages location for rack");
                        return prevRoom; // cannot find an available rack id to move
                    }
                    setUnitLocs((prevUnitLocations) => {
                        const updatedUnitLocations = { ...prevUnitLocations };
                        movedRacks.forEach((movedRack) => {
                            updatedUnitLocations[movedRack.type.type] = updatedUnitLocations[movedRack.type.type].map((cage) => {
                                const movedRackCage = movedRack.cages.find((rackCage) => rackCage.cageNum === cage.num);
                                if (movedRackCage) {
                                    return {
                                        ...cage,
                                        // Update the cage position based on the rack and its cage position
                                        cellX: x + movedRackCage.x + movedRack.x,
                                        cellY: y + movedRackCage.y + movedRack.y,
                                    };
                                }
                                return cage;
                            });
                        });
                        return updatedUnitLocations;
                    });
                }
            }else{
                // Update non rack/caging object
                updatedLocalRoom = {
                    ...prevRoom,
                    objects: prevRoom.objects.map(item =>
                        item.itemId === itemId
                            ? { ...item, x, y, scale: k }
                            : item
                    )
                };
            }
            return updatedLocalRoom; // Return the updated localRoom
        });
    };

    const delRack = (rackId: string) => {
        /*setLocalRoom(prevRoom =>  ({
            ...prevRoom,
            racks: prevRoom.racks.filter(roomItem => {
                return roomItem.itemId !== rackId;
            })
        }));*/
    }

    //
    const delCage = (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => {
        console.log("deleting: ", selectedObj);

        setLocalRoom((prevRoom) => {
            let updatedRoom: Room;
            if(action === 'cage'){ // remove cage from rack, keep rack
                updatedRoom = {
                    ...prevRoom,
                    rackGroups: prevRoom.rackGroups.map((group) => ({
                            ...group,
                            racks: group.racks.map(r => ({
                                ...r,
                                cages: r.cages.filter(c => c.cageNum !== cage.cageNum)
                            }))
                        }
                    ))
                }
            }else if(action === 'rack'){ // remove rack from rack group, keep rack group
                updatedRoom = {
                    ...prevRoom,
                    rackGroups: prevRoom.rackGroups.map((group) => ({
                            ...group,
                            racks: group.racks.filter((r) => r.itemId !== rack.itemId)
                        }
                    ))
                }
            }else if (action === 'group'){ // remove rack group
                updatedRoom = {
                    ...prevRoom,
                    rackGroups: prevRoom.rackGroups.filter((group) =>
                        group.groupId !== rackGroup.groupId
                    )
                }
            }
            return updatedRoom;
        });

        setUnitLocs((prevLocs) => ({
            ...prevLocs,
            [rack.type.type]: prevLocs[rack.type.type].filter((loc) => loc.num !== cage.cageNum)
        }));
    }

    const changeCageNum = (numBefore: number, numAfter: number) => {
        const objType = parseRoomItemType(selectedObj);

        if(unitLocs[objType].find(prevLoc => parseRoomItemNum(prevLoc.num) === numAfter)){
            console.log("Please add a different cage num that doesnt exist in the current room");
            return;
        }

        console.log("Change Cage Num State: ", numBefore, numAfter);

        setLocalRoom((prevRoom) => {
            // Find the clicked rack
            let currRack: Rack;
            prevRoom.rackGroups.forEach(group => {
                if(currRack) return;
                currRack = findSelectObjRack(group.racks, selectedObj)
            });

            if (!currRack) return prevRoom; // If the clicked rack is not found, return the previous state

            // Update the local room by updating the cage numbers in the clicked rack
            const updatedLocalRoom: Room = {
                ...prevRoom,
                rackGroups: prevRoom.rackGroups.map((group: RackGroup): RackGroup => ({
                    ...group,
                    racks: group.racks.map((rack: Rack): Rack =>
                        rack.cages.some((cage: Cage) => cage.cageNum === selectedObj) // Check if any cage matches selectedObj
                            ? {
                                ...rack,
                                cages: rack.cages.map((cage: Cage): Cage =>
                                    cage.cageNum === selectedObj // Only update the cage with matching cageNum
                                        ? { ...cage, cageNum: `${rack.type.type}-${numAfter}` } as Cage
                                        : cage
                                )
                            }
                            : rack
                    )
                }))
            };



            // Now update the unit locations using the rackType from currRack
            setUnitLocs(prevUnitLocations => ({
                ...prevUnitLocations,
                // Access the correct unit location array based on clickedRack's rackType
                [currRack.type.type]: prevUnitLocations[currRack.type.type].map(cage =>
                    convertCageNumToNum(cage.num) === numBefore ? { ...cage, num: `${currRack.type.type}-${numAfter}` } : cage
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

    // Loads a room into state if it is filled
    // LayoutHistoryData type does not do a hard check against this object so make sure properties align to avoid errors
    useEffect(() => {
        if(!prevRoom.name) return;

        //TODO make sure rack-group ids are correct
        const newLocalRoom: Room = buildNewLocalRoom(prevRoom);
        const newUnitLocs: UnitLocations = buildNewLocs(prevRoom.data);

        console.log("Load Data: ", prevRoom);
        console.log("New Room State: ", newLocalRoom);
        console.log("layout: ", layoutSvg.node());


        addPrevRoomSvgs(newLocalRoom, layoutSvg);
        setUnitLocs(newUnitLocs);
        setLocalRoom(newLocalRoom);
        setRoom(newLocalRoom);
    }, [prevRoom]);

    const saveRoom = () => {
        if(localRoom.room === 'new-layout'){
            // prompt room popup to save?
        }else{
            console.log("Saving layout");
            const dataToSave: LayoutHistoryData[] = [];
            const roomName = localRoom.room;
            const newEndDate = new Date();
            const newStartDate = new Date();
            // TODO fix defaults by prmpting users to fill them in
            localRoom.rackGroups.forEach((group) => {
                const groupId = parseLongId(group.groupId);
                group.racks.forEach((rack) => {
                    // if rack is a default, assign rack id to 0(default id) and use the defaults id as id in default_rack
                    const defaultId = rack.itemId.includes('default') ? parseLongId(rack.itemId) : null;
                    const newRackId = defaultId ? 0 : parseRoomItemNum(rack.itemId);
                    rack.cages.forEach((cage) => {
                        const cageLocData = unitLocs[rack.type.type].find((loc) => loc.num === cage.cageNum);
                        const newCageData: LayoutHistoryData = {
                            cage: zeroPadName(parseRoomItemNum(cage.cageNum), 4), // converts number into string with leading 0s
                            end_date: null,
                            rack: newRackId,
                            rack_group: groupId,
                            default_rack: defaultId,
                            room: roomName,
                            room_object: null,
                            scale: group.scale,
                            start_date: newStartDate,
                            x_coord: cageLocData.cellX,
                            y_coord: cageLocData.cellY
                        }
                        dataToSave.push(newCageData);
                    })
                })
            })

            localRoom.objects.forEach((roomObj) => {
                const newObjData: LayoutHistoryData = {
                    cage: null,
                    end_date: null,
                    rack: null,
                    default_rack: null,
                    rack_group: null,
                    room: roomName,
                    room_object: roomObj.type,
                    scale: roomObj.scale,
                    start_date: newStartDate,
                    x_coord: roomObj.x,
                    y_coord: roomObj.y
                }
                dataToSave.push(newObjData);
            });


            Query.insertRows({
                failure(errorInfo: any, response: XMLHttpRequest): any {
                    console.log("failed insert")
                },
                queryName: 'layout_history',
                schemaName: 'wnprc',
                rows: dataToSave,
                success(data: any, request: ExtendedXMLHttpRequest, config: RequestOptions): any {
                    console.log("success insert")
                }
            });


            const rowsToUpdate = prevRoom.data.reduce((acc, row) => {
                return [
                    ...acc,
                    {
                        ...row,
                        end_date: newEndDate
                    }
                ];
            }, []);

            Query.updateRows({
                failure(errorInfo: any, response: XMLHttpRequest): any {
                    console.log("Failed Update");
                },
                queryName: 'layout_history',
                schemaName: 'wnprc',
                rows: rowsToUpdate,
                success(data: any, request: ExtendedXMLHttpRequest, config: RequestOptions): any {
                    console.log("Success Update");

                }
            });
        }
    }

    return (
        <LayoutContext.Provider value={{
            room,
            setRoom,
            layoutSvg,
            setLayoutSvg,
            localRoom,
            saveRoom,
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
            delCage,
            scale,
            setScale
        }}>
            {children}
        </LayoutContext.Provider>
    );
}