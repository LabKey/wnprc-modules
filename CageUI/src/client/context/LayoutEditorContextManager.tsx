import * as React from 'react';
import { createContext, FC, useContext, useEffect, useState } from 'react';
import { LayoutContextProps, LayoutContextType } from '../types/layoutEditorContextTypes';
import {
    Cage,
    CageNumber,
    GroupId,
    LayoutHistoryData,
    LocationCoords,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemClass,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    UnitLocations,
    UnitType
} from '../types/typings';
import {
    DeleteActions,
    LayoutSaveResult,
    RackActions,
    SelectedObj
} from '../types/layoutEditorTypes';
import {
    convertCageNumToNum,
    createEmptyUnitLoc,
    findCageInGroup,
    findRackInGroup,
    findSelectObjRack,
    getTranslation,
    isRackDefault,
    isRackEnum,
} from '../utils/LayoutEditorHelpers';
import * as d3 from 'd3';
import {
    defaultTypeToRackType,
    parseLongId,
    parseRoomItemNum,
    parseRoomItemType,
    rackTypeToDefaultType,
    roomItemToString,
    zeroPadName
} from '../utils/helpers';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { Command, CommandType } from '@labkey/api/dist/labkey/query/Rows';
import { labkeyActionSelectWithPromise, labkeySaveRows, } from '../api/labkeyActions';

const LayoutEditorContext = createContext<LayoutContextType | null>(null);

export const useLayoutEditorContext = () => {
    const context = useContext(LayoutEditorContext);

    if (!context) {
        throw new Error(
            "useRoomContext has to be used within <LayoutEditorContext.Provider>"
        );
    }

    return context;
}

export const LayoutEditorContextProvider: FC<LayoutContextProps> = ({children, prevRoom}) => {
    // loaded in and unchanged since start of layout editing
    const [room, setRoom] = useState<Room>({
        name: "new-layout",
        rackGroups: [],
        objects: [],
        layoutData: null
    });
    /* unit locations resembles each rack type and their respective locations in a room, since location is geospatial
        it does not need to remember anything other than x and y coords for that group of racks. The reason for having
        different objects for each rack type is to keep a separate numbering system for each type of rack. Additionally
        this state is tracked for detecting merging.
    */
    const [unitLocs, setUnitLocs] = useState<UnitLocations>(createEmptyUnitLoc());

    // All changes made to room reflect here. Use room state to compare to the start of room editing vs the changes made here
    const [localRoom, setLocalRoom] = useState<Room>({
        name:"new-layout",
        rackGroups: [],
        objects: [],
        layoutData: null
    });

    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);

    const [nextAvailGroup, setNextAvailGroup] = useState<GroupId>(`rack-group-1`); // Tracks currently active groups of racks

    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(prevRoom ? true : false);

    // the id of the clicked on svg group for either dragging or context menu opening.
    const [selectedObj, setSelectedObj] = useState<SelectedObj | null>(null);

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

    const addRack = async (id: string, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum: CageNumber = `${roomItemToString(rackType) as RackStringType}-${getNextCageNum(roomItemToString(rackType) as RackStringType)}`;
        const firstCage: Cage = {
            selectionType: 'cage',
            id: 1,
            cageNum: newCageNum,
            x: 0,
            y: 0
        };

        // First cage in rack is always at rack starting position as well
        const newCageLoc: LocationCoords = {
            num: newCageNum,
            cellX: x,
            cellY: y
        };

        let type: UnitType;

        const optConfig: SelectRowsOptions = {
            schemaName: "cageui",
            queryName: "rack_types",
            filterArray: [
                Filter.create('type', rackTypeToDefaultType(rackType), Filter.Types.EQUAL)
            ]
        }
        // grab and set first default of that type to same svg object
        const rackTypeData = await labkeyActionSelectWithPromise(optConfig);

        // make first rack type
        type = {
            rowid: rackTypeData.rows[0].rowid,
            name: rackTypeData.rows[0].name,
            type: rackType,
            isDefault: true,
        };

        const newRack: Rack = {
            selectionType: 'rack',
            cages: [firstCage],
            itemId: id,
            isActive: false, // Default racks are not active by default (since they technically don't exist)
            type: type,
            x: 0,
            y: 0
        };

        const newRackGroup: RackGroup = {
            selectionType: 'rackGroup',
            groupId: nextAvailGroup,
            racks: [newRack],
            x: x,
            y: y,
            scale: newScale,
        }

        setNextAvailGroup(prevState => {
            const nextId = parseLongId(prevState) + 1;
            return `rack-group-${nextId}` as GroupId
        });
        setLocalRoom(prevRoom => ({
            ...prevRoom,
            rackGroups: [...prevRoom.rackGroups, newRackGroup]
        }));

        setUnitLocs(prevState => ({
            ...prevState,
            [roomItemToString(rackType)]: [...prevState[roomItemToString(rackType)], newCageLoc] // Append the new location to the correct array
        }));
        setScale(newScale);
    };



    const mergeLocalRacks = (targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {

        setLocalRoom(prevRoom => {

            let {rack: targetRack, rackGroup: targetGroup} = findRackInGroup(targetId, prevRoom.rackGroups);
            let {rack: dragRack, rackGroup: dragGroup} = findRackInGroup(dragId, prevRoom.rackGroups);

            if (!targetRack || !dragRack) {
                console.log("One or both racks not found");
                return prevRoom;
            }
            // different rack types can be connected but not merged
            if(targetRack.type.rowid !== dragRack.type.rowid){
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
                selectionType: 'rack',
                type: targetRack.type,
                cages: updatedCages,
                x: targetRack.x,
                y: targetRack.y,
                isActive: targetRack.isActive,
            };

            const mergedRackGroup: RackGroup = {
                groupId: targetGroup.groupId,
                selectionType: 'rackGroup',
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
                                y: newRackCoords.y
                            };
                        })
                    ];
                    return {
                        ...group,
                        groupId: targetGroup.groupId,
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

    // Adds item to the local room. return the new room for listeners.
    const addRoomItem = (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number) => {
        if(isRackEnum(itemType)){
            addRack(itemId, x, y, scale, itemType as RackTypes);
        }else{
            const newRoomObj: RoomObject = {
                selectionType: 'obj',
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
                            [roomItemToString(movedRack.type.type)]: prevUnitLocations[roomItemToString(movedRack.type.type)].map(cage => {
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
                            updatedUnitLocations[roomItemToString(movedRack.type.type)] = updatedUnitLocations[roomItemToString(movedRack.type.type)].map((cage) => {
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

    const delObject = (objectId: string) => {
        setLocalRoom(prevRoom =>  ({
            ...prevRoom,
            objects: prevRoom.objects.filter(obj => {
                return obj.itemId !== objectId;
            })
        }));
    }


    const delCage = (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => {

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
            [roomItemToString(rack.type.type)]: prevLocs[roomItemToString(rack.type.type)].filter((loc) => loc.num !== cage.cageNum)
        }));
    }

    const changeRack = async (newType: {value: string, label: string}) => {
        let {value: oldRackType, label: oldRackId} = newType;
        const rackId = parseInt(oldRackId);
        const rackType = oldRackType.split(' - ')[1];

        const optConfig: SelectRowsOptions = {
            schemaName: "cageui",
            queryName: "rack_types",
            filterArray: [
                Filter.create('name', rackType, Filter.Types.EQUAL)
            ]
        }
        const rackTypeData = await labkeyActionSelectWithPromise(optConfig);

        if(rackTypeData.rowCount === 1){
            const newRackType = rackTypeData.rows[0];
            const isDefault = isRackDefault(newRackType.type);
            if(isDefault){
                newRackType.type = defaultTypeToRackType(newRackType.type);
            }
            setLocalRoom(prevRoom => {
                const {rackGroup, rack, cage} = findCageInGroup((selectedObj as Cage).cageNum as CageNumber, prevRoom.rackGroups);
                const roomToUpdate: Room = {
                    ...prevRoom,
                    rackGroups: prevRoom.rackGroups.map(group =>
                        group.groupId === rackGroup.groupId
                            ? {
                                ...group,
                                racks: group.racks.map((r) => r.itemId === rack.itemId ? {
                                    ...r,
                                    itemId: `rack-${rackId.toString()}`,
                                    type: {
                                        ...r.type,
                                        rowid: newRackType.rowid,
                                        name: newRackType.name,
                                        type: newRackType.type,
                                        isDefault: isDefault // not stored in db
                                    }
                                } : r)
                            }
                            : group
                    )
                }
                return roomToUpdate;
            })
        }else{
            console.log("Error fetching rack type");
        }
    }

    const changeCageNum = (numBefore: number, numAfter: number) => {
        const selectedCage = (selectedObj as Cage).cageNum;
        const objType = parseRoomItemType(selectedCage);

        if(unitLocs[objType].find(prevLoc => parseRoomItemNum(prevLoc.num) === numAfter)){
            console.log("Please add a different cage num that doesnt exist in the current room");
            return;
        }

        setLocalRoom((prevRoom) => {
            // Find the clicked rack
            let currRack: Rack;
            prevRoom.rackGroups.forEach(group => {
                if(currRack) return;
                currRack = findSelectObjRack(group.racks, selectedCage)
            });

            if (!currRack) return prevRoom; // If the clicked rack is not found, return the previous state

            // Update the local room by updating the cage numbers in the clicked rack
            const updatedLocalRoom: Room = {
                ...prevRoom,
                rackGroups: prevRoom.rackGroups.map((group: RackGroup): RackGroup => ({
                    ...group,
                    racks: group.racks.map((rack: Rack): Rack =>
                        rack.cages.some((cage: Cage) => cage.cageNum === selectedCage) // Check if any cage matches selectedObj
                            ? {
                                ...rack,
                                cages: rack.cages.map((cage: Cage): Cage =>
                                    cage.cageNum === selectedCage // Only update the cage with matching cageNum
                                        ? { ...cage, cageNum: `${roomItemToString(rack.type.type)}-${numAfter}` } as Cage
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
                [roomItemToString(currRack.type.type)]: prevUnitLocations[roomItemToString(currRack.type.type)].map(cage =>
                    convertCageNumToNum(cage.num) === numBefore ? { ...cage, num: `${roomItemToString(currRack.type.type)}-${numAfter}` } : cage
                )
            }));

            return updatedLocalRoom; // Return the updated local room state
        });

        setCageNumChange({before: numBefore, after: numAfter});
    }

    const getNextCageNum = (rackType: RackStringType) => {
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

    const clearGrid = () => {
        setLocalRoom(prevState => {
            return {
                ...prevState,
                rackGroups: [],
                objects: []
            }
        });
    }

    // Loads a room into state if it is filled
    // LayoutHistoryData type does not do a hard check against this object so make sure properties align to avoid errors
    useEffect(() => {
        if(!prevRoom) {
            return;
        }

        let lastGroup: GroupId;

        if(prevRoom.room.rackGroups.length !== 0){
            lastGroup = prevRoom.room.rackGroups[prevRoom.room.rackGroups.length - 1].groupId;
        }

        if (lastGroup){
            setNextAvailGroup(`rack-group-${parseLongId(lastGroup) + 1}`);
        }else{
            setNextAvailGroup(`rack-group-1`);
        }
        if(prevRoom.locs) {
            setUnitLocs(prevRoom.locs);
        }
        setLocalRoom(prevRoom.room);
        setRoom(prevRoom.room);
        setIsLoading(false);
    }, [prevRoom]);

    const saveRoom = async (templateRename?: boolean): Promise<LayoutSaveResult> => {
        const commands: Command[] = [];
        const dataToSave: LayoutHistoryData[] = [];
        // if template parse room name, 1 is the new name, 0 is the old name
        const roomName = templateRename ? JSON.parse(localRoom.name)[1] : localRoom.name;
        const oldRoomName = templateRename ? JSON.parse(localRoom.name)[0] : localRoom.name;
        const newEndDate = new Date();
        const newStartDate = new Date();
        let rowsToUpdate;
        let templateHistory: LayoutHistoryData[];

        //check if template already had layout in history and needs to be updated
        if(prevRoom && prevRoom.room.name !== roomName){
            const prevRoomConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'layout_history',
                columns: ['object_type', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'rowid'],
                filterArray: [
                    Filter.create('room', oldRoomName, Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK)
                ]
            }
            const prevTemplate = await labkeyActionSelectWithPromise(prevRoomConfig)

            if(prevTemplate.rowCount > 0){
                templateHistory = prevTemplate.rows;
            }
        }

        localRoom.rackGroups.forEach((group) => {
            const groupId = parseLongId(group.groupId);
            group.racks.forEach((rack) => {
                // if rack is a default, assign rack id to 0(default id) and use the defaults id as id in default_rack
                const newRackId = rack.type.isDefault ? parseLongId(rack.itemId) : parseInt(rack.itemId);
                rack.cages.forEach((cage) => {
                    const cageLocData = unitLocs[roomItemToString(rack.type.type)].find((loc) => loc.num === cage.cageNum);
                    const newCageData: LayoutHistoryData = {
                        cage: zeroPadName(parseRoomItemNum(cage.cageNum), 4), // converts number into string with leading 0s
                        end_date: null,
                        extra_context: cage.extraContext ? JSON.stringify(cage.extraContext) : null,
                        rack: newRackId,
                        object_type: rack.type.isDefault ? rackTypeToDefaultType(rack.type.type) : rack.type.type,
                        rack_group: groupId,
                        room: roomName,
                        start_date: newStartDate,
                        x_coord: cageLocData.cellX,
                        y_coord: cageLocData.cellY
                    }
                    dataToSave.push(newCageData);
                })
            })
        });

        localRoom.objects.forEach((roomObj) => {
            const newObjData: LayoutHistoryData = {
                cage: null,
                end_date: null,
                rack: null,
                object_type: roomObj.type,
                rack_group: null,
                extra_context: roomObj.extraContext ? JSON.stringify(roomObj.extraContext) : null,
                room: roomName,
                start_date: newStartDate,
                x_coord: roomObj.x,
                y_coord: roomObj.y
            }
            dataToSave.push(newObjData);
        });

        // get data for updating layout history end dates
        if(prevRoom && prevRoom.data.length !== 0){
            rowsToUpdate = prevRoom.data.reduce((acc, row) => {
                return [
                    ...acc,
                    {
                        ...row,
                        end_date: newEndDate
                    }
                ];
            }, []);
        }else if(templateHistory && templateHistory?.length !== 0) {// ensure template history exists and has data.
            rowsToUpdate = templateHistory.reduce((acc, row) => {
                return [
                    ...acc,
                    {
                        ...row,
                        end_date: newEndDate
                    }
                ];
            }, []);
        }

        // update template name
        if(templateRename){
            commands.push({
                command: "updateChangingKeys" as CommandType,
                schemaName: "ehr_lookups",
                queryName: "rooms",
                extraContext: {keyField: 'room'},
                rows: [{
                    oldKeys: {room: JSON.parse(localRoom.name)[0]},
                    values: {room: roomName}
                }]
            });
        }

        // update prevRoom rows to include end date marking end of layout for that time frame
        if(rowsToUpdate){
            commands.push({
                command: "update",
                schemaName: "cageui",
                queryName: "layout_history",
                rows: rowsToUpdate
            });
        }

        // insert rows to layout history for cages and room objects, no end date
        if(dataToSave.length !== 0){
            commands.push({
                command: "insert",
                schemaName: "cageui",
                queryName: "layout_history",
                rows: dataToSave
            });

        }

        // update room border and scale
        const roomToSave = [{
            room: roomName,
            layout_scale: localRoom.layoutData.scale,
            border_width: localRoom.layoutData.borderWidth,
            border_height: localRoom.layoutData.borderHeight
        }];
        commands.push({
            command: "update",
            schemaName: "ehr_lookups",
            queryName: "rooms",
            rows: roomToSave
        });

        const result = await labkeySaveRows(commands);
        // Determine success or failure
        if(result.errorCount === 0){
            return { status: 'Success' };
        }else{
            return {
                status: 'Failure',
                reason: ["failures"] // Return an array of failure reasons
            };
        }
    }

    return (
        <LayoutEditorContext.Provider value={{
            room,
            setRoom,
            layoutSvg,
            setLayoutSvg,
            localRoom,
            setLocalRoom,
            saveRoom,
            addRoomItem,
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
            setScale,
            changeRack,
            clearGrid,
            delObject,
        }}>
            {!isLoading ? children : null}
        </LayoutEditorContext.Provider>
    );
}