/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { createContext, FC, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
    LayoutContextProps,
    LayoutContextType
} from '../types/layoutEditorContextTypes';
import {
    Cage,
    CageNumber,
    DefaultRackId,
    GroupId,
    LayoutHistoryData,
    LocationCoords, ModData,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    RealRackId,
    Room,
    RoomItemClass,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    UnitLocations,
    UnitType
} from '../types/typings';
import {
    CellKey,
    DeleteActions,
    ExtraContext,
    LayoutSaveResult,
    RackActions,
    SelectedObj
} from '../types/layoutEditorTypes';
import {
    convertCageNumToNum,
    createEmptyUnitLoc,
    findCageInGroup,
    findRackInGroup,
    findSelectObjRack, getNextGroupId,
    getTranslation,
    isRackDefault,
    isRackEnum,
    showLayoutEditorError,
} from '../utils/LayoutEditorHelpers';
import * as d3 from 'd3';
import {
    defaultTypeToRackType, getNextDefaultRackId,
    getSvgSize,
    parseLongId,
    parseRoomItemNum,
    parseRoomItemType,
    rackTypeToDefaultType,
    roomItemToString,
    zeroPadName
} from '../utils/helpers';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Filter } from '@labkey/api';
import { Command, CommandType } from '@labkey/api/dist/labkey/query/Rows';
import {
    labkeyActionSelectDistinctWithPromise,
    labkeyActionSelectWithPromise,
    labkeySaveRows,
} from '../api/labkeyActions';
import { CELL_SIZE } from '../utils/constants';

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

export const LayoutEditorContextProvider: FC<LayoutContextProps> = ({children, prevRoom, user}) => {
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

    const cageConnections = useRef<{
        parent: Record<CageNumber, CageNumber>,
        rank: Record<CageNumber, number>,
        root: Record<CageNumber, CageNumber>,    // Root with path compression
        adjacency: Record<CageNumber, Set<CageNumber>>; // Track all adjacent cages
    }>({
        parent: {},
        rank: {},
        adjacency: {},
        root: {}
    });

    const [reloadRoom, setReloadRoom] = useState<Room>(null);


    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);

    const [nextAvailGroup, setNextAvailGroup] = useState<GroupId>(`rack-group-1`); // Tracks currently active groups of racks

    const [cageNumChange, setCageNumChange] = useState<{before: number, after: number} | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(prevRoom ? true : false);

    // the id of the clicked on svg group for either dragging or context menu opening.
    const [selectedObj, setSelectedObj] = useState<SelectedObj | null>(null);

    // instead of tying scale to each location, manage one scale for the whole layout
    const [scale, setScale] = useState<number>(1);


    const grid = useRef<Map<CellKey, LocationCoords[]>>(new Map());

    const getCageLoc = (cageNum: CageNumber): LocationCoords => {
        for (const cageLoc of unitLocs[parseRoomItemType(cageNum)]) {
            if((cageLoc as LocationCoords).num === cageNum){
                return(cageLoc);
            }
        }
    }

    const getCellKey = (x: number, y: number): CellKey => {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);
        return `${gridX},${gridY}`;
    }

    const getCageCells = (cage: Cage, cageLoc: LocationCoords): CellKey[] => {
        const cells: CellKey[] = [];
        const xEnd = cageLoc.cellX + (cage.size * CELL_SIZE);
        const yEnd = cageLoc.cellY + (cage.size * CELL_SIZE);

        for (let x = cageLoc.cellX; x < xEnd; x += CELL_SIZE) {
            for (let y = cageLoc.cellY; y < yEnd; y += CELL_SIZE) {
                cells.push(getCellKey(x, y));
            }
        }
        return cells;
    }

    const insertCageToMap = (cage: Cage, cageLoc: LocationCoords) => {
        const cells = getCageCells(cage, cageLoc);
        for (const cell of cells) {
            if (!grid.current.has(cell)) {
                grid.current.set(cell, []);
            }
            grid.current.get(cell)!.push(cageLoc);
        }
    }

    const getAdjCages = (cage: Cage, cageLoc: LocationCoords): LocationCoords[] => {
        const adjacentCages = new Set<LocationCoords>();
        const { cellX: x, cellY: y } = cageLoc;
        const width = cage.size * CELL_SIZE;
        const height = cage.size * CELL_SIZE;

        // Check all four directions
        const directions = [
            { dx: 0, dy: -1 },  // Top
            { dx: 1, dy: 0 },   // Right
            { dx: 0, dy: 1 },    // Bottom
            { dx: -1, dy: 0 }    // Left
        ];

        for (const dir of directions) {
            const checkX = x + (dir.dx === 1 ? width : dir.dx === -1 ? -1 : 0);
            const checkY = y + (dir.dy === 1 ? height : dir.dy === -1 ? -1 : 0);

            // Check along the entire edge
            if (dir.dx !== 0) { // Left/Right check
                for (let yCheck = y; yCheck < y + height; yCheck += CELL_SIZE) {
                    const cell = getCellKey(checkX, yCheck);
                    for (const otherBox of grid.current.get(cell) || []) {
                        if (otherBox.num !== cageLoc.num) adjacentCages.add(otherBox);
                    }
                }
            } else { // Top/Bottom check
                for (let xCheck = x; xCheck < x + width; xCheck += CELL_SIZE) {
                    const cell = getCellKey(xCheck, checkY);
                    for (const otherBox of grid.current.get(cell) || []) {
                        if (otherBox.num !== cageLoc.num) adjacentCages.add(otherBox);
                    }
                }
            }
        }

        return Array.from(adjacentCages);
    }

    const removeCageFromMap = (cage: Cage, cageLoc: LocationCoords): void => {
        const cells = getCageCells(cage, cageLoc);
        for (const cell of cells) {
            const cagesInCell = grid.current.get(cell);
            if (cagesInCell) {
                const updatedBoxes = cagesInCell.filter((b) => b.num !== cageLoc.num);
                if (updatedBoxes.length === 0) {
                    grid.current.delete(cell); // Prune empty cells
                } else {
                    grid.current.set(cell, updatedBoxes);
                }
            }
        }
    }

    const updateCageInMap = (cage: Cage, cageLoc: LocationCoords, oldCageLoc: LocationCoords): void => {
        removeCageFromMap(cage, oldCageLoc);
        insertCageToMap(cage, cageLoc);
    }

    /*
        Fixes the group ids of the rackGroups state in room and the svg ids for those state objects
    */
    const fixGroupIds = () => {

        setLocalRoom((prevRoom) => {

            if(prevRoom.rackGroups.length === 0){
                return prevRoom;
            }
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

    // This only adds default racks/cages to the layout, it is not used in loading in previous layouts
    const addRack = async (id: string, x: number, y: number, newScale: number, rackType: RackTypes) => {
        const newCageNum: CageNumber = `${roomItemToString(rackType) as RackStringType}-${getNextCageNum(roomItemToString(rackType) as RackStringType)}`;

        const svgSize = await getSvgSize(rackType);
        if(!svgSize){
            await showLayoutEditorError("No size found for cage");
            return false;
        }

        const newCage: Cage = {
            selectionType: 'cage',
            id: 1,
            cageNum: newCageNum,
            x: 0,
            y: 0,
            size: svgSize,
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
        if(rackTypeData.rows.length === 0){
            await showLayoutEditorError("Unable to find rack type data");
            return false;
        }

        // make first rack type
        type = {
            rowid: rackTypeData.rows[0].rowid,
            name: rackTypeData.rows[0].name,
            type: rackType,
            isDefault: true,
            sides: null
        };

        const newRack: Rack = {
            selectionType: 'rack',
            cages: [newCage],
            itemId: id as DefaultRackId,
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
        insertCageToMap(newCage, newCageLoc);
        cageConnections.current = {
            parent: { ...cageConnections.current.parent, [newCageNum]: newCageNum },
            rank: { ...cageConnections.current.rank, [newCageNum]: 0 },
            adjacency: {...cageConnections.current.adjacency},
            root: {...cageConnections.current.root, [newCageNum]: newCageNum},
        };
        return true;
    };

    const mergeLocalRacks = (newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, targetCageNum, dragCageNum) => {

        setLocalRoom(prevRoom => {

            let {rack: targetRack, rackGroup: targetGroup, cage: targetCage} = findCageInGroup(targetCageNum, prevRoom.rackGroups);
            let {rack: dragRack, rackGroup: dragGroup, cage: dragCage} = findCageInGroup(dragCageNum, prevRoom.rackGroups);

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

                return {
                    ...cage,
                    x: cageCoords.x,
                    y: cageCoords.y,
                }
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

    const connectLocalRacks = (targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, targetCageNum, dragCageNum) => {
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

    const doRackAction = (action: RackActions, targetRackId: string, dragRackId: string, targetCageNum, dragCageNum, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, ) => {
        const { rack: targetRack, rackGroup: targetGroup} = findCageInGroup(targetCageNum, localRoom.rackGroups);
        const {rack: dragRack, rackGroup: dragGroup} = findCageInGroup(dragCageNum, localRoom.rackGroups);
        if(action === 'merge'){
            mergeLocalRacks(newGroup, targetCageNum, dragCageNum);

        }else{ // action = connect
            connectLocalRacks(targetRackId, dragRackId, newGroup, targetCageNum, dragCageNum);

        }
        // Initialize if needed
        if (!cageConnections.current.parent[targetCageNum]) {
            cageConnections.current.parent[targetCageNum] = targetCageNum;
            cageConnections.current.root[targetCageNum] = targetCageNum;
            cageConnections.current.rank[targetCageNum] = 0;
        }
        if (!cageConnections.current.parent[dragCageNum]) {
            cageConnections.current.parent[dragCageNum] = dragCageNum;
            cageConnections.current.root[dragCageNum] = dragCageNum;
            cageConnections.current.rank[dragCageNum] = 0;
        }

        // Update adjacency
        for (const dc of dragRack.cages) {
            cageConnections.current.adjacency[dc.cageNum] = cageConnections.current.adjacency[dc.cageNum] || new Set();
            getAdjCages(dc, getCageLoc(dc.cageNum)).forEach((c) => {
                // check if adj cage is in target group, if not ignore it
                if(findCageInGroup(c.num, [targetGroup])?.cage){
                    cageConnections.current.adjacency[dc.cageNum].add(c.num);
                }
            });
        }

        for (const tc of targetRack.cages){
            cageConnections.current.adjacency[tc.cageNum] = cageConnections.current.adjacency[tc.cageNum] || new Set();
            getAdjCages(tc, getCageLoc(tc.cageNum)).forEach((c) => {
                if (findCageInGroup(c.num, [dragGroup])?.cage) {
                    cageConnections.current.adjacency[tc.cageNum].add(c.num)
                }
            });
        }

        // Perform union
        union(targetCageNum, dragCageNum);

        // After merging / connecting fix the group ids so that they have no gaps
        fixGroupIds();
    }

    // Adds item to the local room. return the new room for listeners.
    const addRoomItem = async (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number): Promise<boolean> => {
        if(isRackEnum(itemType)){
            return await addRack(itemId, x, y, scale, itemType as RackTypes);
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
            return true;
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

                                if(movedRackCage) {
                                    const oldLocCoords: LocationCoords = {
                                        ...cage
                                    }
                                    const newLocCoords: LocationCoords = {
                                        ...cage,
                                        // Update the cage's coordinates by adding its own coordinates to the new rack's coordinates
                                        cellX: x + movedRackCage.x, // Add new rack's x position to cage's local x
                                        cellY: y + movedRackCage.y, // Add new rack's y position to cage's local y
                                    }
                                    updateCageInMap(movedRackCage,newLocCoords, oldLocCoords);
                                    return newLocCoords;
                                }else{
                                    return cage;
                                }
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
                                    const oldLocCoords: LocationCoords = {
                                        ...cage
                                    }
                                    const newLocCoords: LocationCoords = {
                                        ...cage,
                                        // Update the cage's coordinates by adding its own coordinates to the new rack's coordinates
                                        cellX: x + movedRackCage.x + movedRack.x, // Add new rack's x position to cage's local x
                                        cellY: y + movedRackCage.y + movedRack.y, // Add new rack's y position to cage's local y
                                    }
                                    updateCageInMap(movedRackCage,newLocCoords, oldLocCoords);
                                    return newLocCoords;

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

    // Modified find that only compresses the root structure
    const find = useCallback((id: CageNumber, root: Record<CageNumber, CageNumber>): CageNumber => {
        if (root[id] !== id) {
            root[id] = find(root[id], root); // Path compression
        }
        return root[id];
    }, []);

    // Modified union operation
    const union = useCallback((a: CageNumber, b: CageNumber) => {
        // Set direct parent relationship (maintains connection chain)
        if (parseRoomItemNum(a) < parseRoomItemNum(b)) {
            cageConnections.current.parent[b] = a;
        } else {
            cageConnections.current.parent[a] = b;
        }

        // Standard union-by-rank on the root structure
        const rootA = find(a, cageConnections.current.root);
        const rootB = find(b, cageConnections.current.root);

        if (rootA !== rootB) {
            if (cageConnections.current.rank[rootA] < cageConnections.current.rank[rootB]) {
                cageConnections.current.root[rootA] = rootB;
            } else if (cageConnections.current.rank[rootA] > cageConnections.current.rank[rootB]) {
                cageConnections.current.root[rootB] = rootA;
            } else {
                cageConnections.current.root[rootB] = rootA;
                cageConnections.current.rank[rootA]++;
            }
        }
    }, [find]);

    const disconnectCage = (cageNum: CageNumber) => {
        // Get current connections
        const { parent, rank, adjacency } = cageConnections.current;
        const location = findCageInGroup(cageNum, localRoom.rackGroups);

        if (!location) return;

        // 1. Remove from adjacency lists (direct connections)
        const directlyConnected = adjacency[cageNum] ? Array.from(adjacency[cageNum]) : [];
        for (const neighbor of directlyConnected) {
            adjacency[neighbor]?.delete(cageNum);
        }
        delete adjacency[cageNum];

        // 2. Handle DSU structure
        // Find all cages that point to this cage and reset them
        const children = Object.keys(parent).filter(id => parent[id] === cageNum);
        for (const child of children) {
            parent[child] = child; // Reset to self
            rank[child] = 0;
        }

        // Remove the cage from DSU
        delete parent[cageNum];
        delete rank[cageNum];

        // 3. Rebuild connections between remaining directly connected cages
        for (let i = 0; i < directlyConnected.length; i++) {
            for (let j = i + 1; j < directlyConnected.length; j++) {
                const a = directlyConnected[i];
                const b = directlyConnected[j];
                if (adjacency[a]?.has(b)) {
                    union(a, b);
                }
            }
        }

        // 4. Now use your existing group splitting logic with DSU-enhanced component detection
        let updatedGroups = localRoom.rackGroups.map(group => {
            if (group.groupId !== location.rackGroup.groupId) return group;

            // Cage deletion
            return {
                ...group,
                racks: group.racks.map(r => {
                    if (r.itemId !== location.rack.itemId) return r;
                    return {
                        ...r,
                        cages: r.cages.filter(c => c.cageNum !== cageNum)
                    }
                }).filter(r => r.cages.length > 0) // Remove empty racks
            };
        }).filter(g => g.racks.length > 0); // Remove empty groups

        // 5. Enhanced component detection using DSU
        const affectedGroup = updatedGroups.find(g => g.groupId === location.rackGroup.groupId);
        if (!affectedGroup) return;

        // Build cage map for the affected group
        const cageMap = Object.fromEntries(
            affectedGroup.racks.flatMap(r => r.cages.map(c => [c.cageNum, c]))
        );

        // Find connected components using DSU roots
        const components = new Map<string, Set<string>>();
        const processed = new Set<string>();

        for (const cageNumInGroup of Object.keys(cageMap)) {
            if (processed.has(cageNumInGroup)) continue;

            const root = find(cageNumInGroup as CageNumber, parent);
            if (!components.has(root)) {
                components.set(root, new Set());
            }

            // BFS to find all cages in this component
            const queue = [cageNumInGroup];
            processed.add(cageNumInGroup);

            while (queue.length > 0) {
                const current = queue.shift()!;
                components.get(root)!.add(current);

                for (const neighbor of adjacency[current] || []) {
                    if (cageMap[neighbor] && !processed.has(neighbor)) {
                        processed.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }

        // 6. Split groups based on components (your existing coordinate logic)
        let finalGroups = updatedGroups.filter(g => g.groupId !== location.rackGroup.groupId);
        let nextGroupId = nextAvailGroup;

        // In the group splitting logic:
        if (components.size > 1) {
            const componentList = Array.from(components.values());

            // First component keeps original group ID
            const firstComponent = componentList[0];
            const firstGroupRacks = affectedGroup.racks.map(r => {
                const componentCages = r.cages.filter(c => firstComponent.has(c.cageNum));
                return componentCages.length > 0 ? {
                    ...r,
                    cages: componentCages
                } : null;
            }).filter(Boolean) as Rack[];

            finalGroups.push({
                ...affectedGroup,
                racks: firstGroupRacks
            });

            // Additional components become new groups
            for (let i = 1; i < componentList.length; i++) {
                const component = componentList[i];

                // Separate racks with cages in this component
                const componentRacks = affectedGroup.racks.map(r => {
                    const componentCages = r.cages.filter(c => component.has(c.cageNum));
                    return componentCages.length > 0 ? {
                        ...r,
                        cages: componentCages
                    } : null;
                }).filter(Boolean) as Rack[];

                // Calculate absolute positions of all cages in this component
                const absoluteCagePositions = componentRacks.flatMap(r =>
                    r.cages.map(c => ({
                        x: affectedGroup.x + r.x + c.x,
                        y: affectedGroup.y + r.y + c.y,
                        rack: r,
                        cage: c
                    }))
                );

                // Find minimum position for new group origin
                const minX = Math.min(...absoluteCagePositions.map(p => p.x));
                const minY = Math.min(...absoluteCagePositions.map(p => p.y));

                // Create new racks based on connection types
                const newRacks: Rack[] = [];

                // Case 1: Cages from multiple racks → split racks
                if (componentRacks.length > 1) {
                    newRacks.push(...componentRacks.map(r => ({
                        ...r,
                        x: (affectedGroup.x + r.x) - minX,
                        y: (affectedGroup.y + r.y) - minY,
                        cages: r.cages.map(c => ({
                            ...c,
                            // Cage coordinates remain relative to rack
                            x: c.x,
                            y: c.y
                        }))
                    })));
                }
                // Case 2: Multiple cages in same rack → split into new racks
                else if (componentRacks[0].cages.length > 1) {
                    const newCages: Cage[] = [];
                    for (let j = 0; j < absoluteCagePositions.length; j++) {
                        newCages.push({
                            ...absoluteCagePositions[j].cage,
                            id: j + 1,
                            x: absoluteCagePositions[j].x - minX,
                            y: absoluteCagePositions[j].y - minY
                        });
                    }
                    newRacks.push({
                        ...absoluteCagePositions[0].rack,
                        itemId: getNextDefaultRackId([...finalGroups]) as DefaultRackId,
                        x: 0,
                        y: 0,
                        cages: newCages
                    });
                }
                // Case 3: Single cage → keep as is
                else {
                    newRacks.push({
                        ...componentRacks[0],
                        x: (affectedGroup.x + componentRacks[0].x) - minX,
                        y: (affectedGroup.y + componentRacks[0].y) - minY,
                        cages: componentRacks[0].cages.map(c => ({
                            ...c,
                            x: c.x,
                            y: c.y
                        }))
                    });
                }

                finalGroups.push({
                    ...affectedGroup,
                    groupId: nextGroupId,
                    x: minX,
                    y: minY,
                    racks: newRacks
                });

                // Update next group ID
                const nextIdNum = parseInt(nextGroupId.split('-')[2]) + 1;
                nextGroupId = `rack-group-${nextIdNum}` as GroupId;
            }
        } else {
            // No splitting needed, keep the modified group
            finalGroups.push(affectedGroup);
        }

        // 7. Update state
        setNextAvailGroup(nextGroupId);
        setLocalRoom(prev => ({
            ...prev,
            rackGroups: finalGroups
        }));
        setReloadRoom({
            ...localRoom,
            rackGroups: finalGroups
        });
    };

    const delCage = (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => {
        if(action !== 'group'){
            disconnectCage(cage.cageNum);
            setUnitLocs((prevLocs) => ({
                ...prevLocs,
                [roomItemToString(rack.type.type)]: prevLocs[roomItemToString(rack.type.type)].filter((loc) => loc.num !== cage.cageNum)
            }));
            return;
        }else{
            setLocalRoom((prevRoom) => {
                let updatedRoom: Room;
                // remove rack group
                updatedRoom = {
                    ...prevRoom,
                    rackGroups: prevRoom.rackGroups.filter((group) =>
                        group.groupId !== rackGroup.groupId
                    )
                }
                // remove all cages in group
                setUnitLocs((prevLocs) => {
                    const cageIds = new Set<CageNumber>();
                    rackGroup.racks.forEach((r) => {
                        r.cages.forEach((c) => {
                            cageIds.add(c.cageNum);
                        })
                    })
                    const filteredLocs: UnitLocations = {};
                    Object.keys(prevLocs).forEach(key => {
                        filteredLocs[key] = prevLocs[key].filter((loc: LocationCoords) => !cageIds.has(loc.num));
                    })
                    return filteredLocs;
                });
                setNextAvailGroup(rackGroup.groupId);
                setReloadRoom(updatedRoom); // reload room with new groups
                return updatedRoom;
            });
        }
        fixGroupIds();
    }

    const changeRack = async (newType: {value: string, label: string}): Promise<string | null> => {
        let {value: oldRackId, label: oldRackType} = newType;
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
                                    itemId: `rack-${rackId.toString()}` as RealRackId,
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
            return `rack-${rackId}`;
        }else{
            console.log("Error fetching rack type");
            return null;
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
        setUnitLocs(createEmptyUnitLoc());
        setNextAvailGroup('rack-group-1');
    }

    const saveRoom = async (oldTemplateName?: string): Promise<LayoutSaveResult> => {
        const commands: Command[] = [];
        const dataToSave: LayoutHistoryData[] = [];

        // if template parse room name, 1 is the new name, 0 is the old name

        const roomName = localRoom.name;
        const oldRoomName: string = oldTemplateName ? oldTemplateName : ActionURL.getParameter('room');
        const savingTemplate: boolean = roomName.toLowerCase().includes("template");
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

        await Promise.all(localRoom.rackGroups.map(async (group) => {
            const groupId = parseLongId(group.groupId);
            await Promise.all(group.racks.map(async (rack) => {
                const newRackId = rack.type.isDefault ? parseLongId(rack.itemId) : parseRoomItemNum(rack.itemId);
                let rackRowId;
                if (!rack.type.isDefault) {
                    const rackConfig = {
                        schemaName: 'cageui',
                        queryName: 'racks',
                        column: 'rowid',
                        filterArray: [
                            Filter.create('rackid', newRackId, Filter.Types.EQUALS),
                            Filter.create('rack_type', rack.type.rowid, Filter.Types.EQUALS),
                        ]
                    };
                    const rackResult = await labkeyActionSelectDistinctWithPromise(rackConfig);
                    if (rackResult.values.length === 1) {
                        rackRowId = rackResult.values[0];
                    }
                }
                rack.cages.forEach((cage) => {
                    const cageLocData = unitLocs[roomItemToString(rack.type.type)].find((loc) => loc.num === cage.cageNum);
                    let extraContext: ExtraContext = {};

                    // set up cage extra context
                    if (cage.extraContext) {
                        extraContext.cage = {};
                        extraContext.cage.context = cage.extraContext;
                    }
                    // set up rack extra context
                    if (rack.type.isDefault) {
                        extraContext.rack = {};
                        extraContext.rack.rackId = newRackId; // room id is for rebuilding a layout for default racks
                    }

                    const newCageData: LayoutHistoryData = {
                        cage: zeroPadName(parseRoomItemNum(cage.cageNum), 4), // converts number into string with leading 0s
                        end_date: null,
                        extra_context: Object.keys(extraContext).length !== 0 ? JSON.stringify(extraContext) : null,
                        rack: rack.type.isDefault ? null : rackRowId,
                        object_type: rack.type.isDefault ? rackTypeToDefaultType(rack.type.type) : rack.type.type,
                        rack_group: groupId,
                        room: roomName,
                        start_date: newStartDate,
                        x_coord: cageLocData.cellX,
                        y_coord: cageLocData.cellY
                    };
                    dataToSave.push(newCageData);
                });
            }));
        }));

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
            // Dont update template room when saving as a new room
            // if prev room is template and saving as same room, update
            // if prev room is template and saving as different room, don't update
            // if prev room is room and saving as room, update
            if((prevRoom.room.name === oldRoomName) || savingTemplate){
                rowsToUpdate = prevRoom.data.reduce((acc, row) => {
                    return [
                        ...acc,
                        {
                            ...row,
                            end_date: newEndDate
                        }
                    ];
                }, []);
            }
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
        if(savingTemplate && oldRoomName !== roomName){
            commands.push({
                command: "updateChangingKeys" as CommandType,
                schemaName: "ehr_lookups",
                queryName: "rooms",
                extraContext: {keyField: 'room'},
                rows: [{
                    oldKeys: {room: oldRoomName},
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
        const layoutToSave = [{
            room: roomName,
            layout_scale: localRoom.layoutData.scale,
            border_width: localRoom.layoutData.borderWidth,
            border_height: localRoom.layoutData.borderHeight
        }];
        commands.push({
            command: "update",
            schemaName: "ehr_lookups",
            queryName: "rooms",
            rows: layoutToSave
        });

        const result = await labkeySaveRows(commands);
        // Determine success or failure
        if(result.errorCount === 0){
            return { status: 'Success', roomName: roomName};
        }else{
            return {
                status: 'Failure',
                roomName: roomName,
                reason: ["failures"] // Return an array of failure reasons
            };
        }
    }

    useEffect(() => {
        if(!prevRoom) {
            return;
        }


        if(prevRoom.room.rackGroups.length !== 0){
            setNextAvailGroup(getNextGroupId(prevRoom.room.rackGroups));
        }

        if(prevRoom.locs) {
            setUnitLocs(prevRoom.locs);
        }
        setLocalRoom(prevRoom.room);
        setRoom(prevRoom.room);
        setIsLoading(false);
    }, [prevRoom]);

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
            user,
            getAdjCages,
            reloadRoom,
            setReloadRoom
        }}>
            {!isLoading ? children : null}
        </LayoutEditorContext.Provider>
    );
}