

import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { RoomContextType } from '../types/roomContextTypes';
import { buildNewLocalRoom, fetchRoomData, getAdjLocation } from '../utils/helpers';
import {
    Cage,
    ModIdKey,
    CageModificationsType,
    CageSvgId,
    CurrCageMods,
    ModLocations, ModTypes,
    Room,
    RoomMods
} from '../types/typings';
import { LoadedRooms, ModificationSaveResult } from '../types/homeTypes';
import _ from 'lodash';
import { findCageInGroup } from '../utils/LayoutEditorHelpers';
import { LayoutSaveResult } from '../types/layoutEditorTypes';
import { saveModLayout } from '../api/labkeyActions';
import { resetMod } from '../utils/homeHelpers';
import { Utils } from '@labkey/api';



const RoomContext = createContext<RoomContextType>({} as RoomContextType);

export const useRoomContext = () => {
    const context = useContext(RoomContext);

    if (!context) {
        throw new Error(
            'useRoomContext has to be used within <RoomContext.Provider>'
        );
    }

    return context;
};

export const RoomContextProvider = ({children}) => {
    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedRoomMods, setSelectedRoomMods] = useState<RoomMods>({});
    //const [loadedRooms, setLoadedRooms] = useState<LoadedRooms>({});
    const [roomLoading, setRoomLoading] = useState<boolean>(false);

    const [abortController, setAbortController] = useState(null);

    // Room loading function - this will be called when user clicks a room
    const loadRoomData = async (roomName, forceReload = false) => {
        // If we already have this room and not forcing reload, return cached data
        /*if (loadedRooms[roomName].loaded && !forceReload) {
            setSelectedRoom(loadedRooms[roomName].room);
            return loadedRooms[roomName];
        }*/

        // Cancel any ongoing requests
        if (abortController) {
            abortController.abort();
        }

        setRoomLoading(true);
        const controller = new AbortController();
        setAbortController(controller);

        try {
            // Your existing room loading logic here
            const roomData = await fetchRoomData(roomName, controller.signal);
            //setLoadedRooms(prev => ({ ...prev, [roomName]: roomData }));
            console.log("Set new room: ", roomData);
            // room exists
            if(roomData.prevRoomData){
                buildNewLocalRoom(roomData.prevRoomData).then((d) => {
                    const newLocalRoom = d[0];
                    if(newLocalRoom){
                        newLocalRoom.layoutData = roomData.prevRoomData.layoutData;
                        // Ensure they don't share the same reference (using lodash to clone)
                        setSelectedRoomMods(_.cloneDeep(newLocalRoom.mods));
                        setSelectedRoom(newLocalRoom);
                    }
                })
            }else{
                setSelectedRoom(null);
                setSelectedRoomMods({});
            }

        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading room:', err);
            }
            throw err;
        } finally {
            setRoomLoading(false);
            setAbortController(null);
        }
    };

    // Method to explicitly switch to a different room
    const switchToRoom = async (roomName: string) => {
        try {
            await loadRoomData(roomName, true); // Force reload
        } catch (error) {
            console.error('Failed to switch to room:', error);
        }
    };

    const cancelRoomLoad = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
    };

    const saveCageMods = (currCage: Cage, currCageMods: CurrCageMods): ModificationSaveResult => {
        const cageModsByCage: { [key in CageSvgId]: CageModificationsType } = {};
        const roomModsAccumulator: RoomMods = {};
        let newRoomMods: RoomMods = {};
        const usedModKeys: ModIdKey[] = [];

        // Helpers
        const emptyCageMods = (): CageModificationsType => ({
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Direct]: []
        });

        const ensureCageEntry = (cageId: CageSvgId) => {
            if (!cageModsByCage[cageId]) {
                cageModsByCage[cageId] = emptyCageMods();
            }
            return cageModsByCage[cageId];
        };

        const addOrAppendSubsectionMod = (
            cageId: CageSvgId,
            location: ModLocations,
            subsectionId: number,
            modId: ModIdKey,
            parentModId: ModIdKey | null = null
        ) => {
            const cageEntry = ensureCageEntry(cageId);
            const subsections = cageEntry[location];

            const existing = subsections.find(s => s.subId === subsectionId);
            if (!existing) {
                cageEntry[location] = [...subsections, { subId: subsectionId, modKeys: [{modId: modId, parentModId: parentModId}] }];
            } else {
                cageEntry[location] = subsections.map(s =>
                    s.subId === subsectionId ? { ...s, modKeys: [...s.modKeys, {modId: modId, parentModId: parentModId}] } : s
                );
            }
        };

        const recordRoomMod = (id: ModIdKey, label: string, value: ModTypes) => {
            console.log("id: ", id, "label: ", label, "value: ", value);
            if (!roomModsAccumulator[id]) {
                roomModsAccumulator[id] = { label, value };
                usedModKeys.push(id);
            }
        };

        // 1) Current cage → Direct subsection 1
        currCageMods.currCage.forEach(mod => {
            recordRoomMod(mod.id, mod.label, mod.value);
            addOrAppendSubsectionMod(currCage.svgId, ModLocations.Direct, 1, mod.id, null);
        });

        // 2) Adjacent cages
        Object.entries(currCageMods.adjCages).forEach(([dirKey, allDirMods]) => {
            const dir = Number(dirKey) as ModLocations;

            console.log("dir: ", dir, "allDirMods: ", allDirMods);
            allDirMods.forEach(modSubsection => {
                modSubsection.mods.forEach(mod => {
                    // Check if this mod already exists in roomModsAccumulator
                    const existingMod = roomModsAccumulator[mod.id];
                    const parentModId = Utils.generateUUID().toUpperCase();

                    if (!existingMod) {
                        // Only record new mods
                        recordRoomMod(mod.id, mod.label, mod.value);
                        recordRoomMod(parentModId, mod.label, mod.value);

                        // Update current cage in given direction
                        addOrAppendSubsectionMod(modSubsection.currCage.svgId, dir, modSubsection.currSubId, mod.id, null);

                        // Update adjacent cage in opposite direction
                        const adjDir = getAdjLocation(dir);
                        addOrAppendSubsectionMod(modSubsection.adjCage.svgId, adjDir, modSubsection.adjSubId, parentModId, mod.id);
                    }
                });
            });
        });

        // 3) Adjacent racks
        Object.entries(currCageMods.adjRacks).forEach(([dirKey, connectedRacks]) => {
            const dir = Number(dirKey) as ModLocations;

            connectedRacks.forEach(modSubsection => {
                // Ensure current cage entry exists (seed from existing cage mods if available and not already present)
                const currEntry = ensureCageEntry(modSubsection.currCage.svgId);
                const isEntryEmpty =
                    currEntry[ModLocations.Top].length === 0 &&
                    currEntry[ModLocations.Bottom].length === 0 &&
                    currEntry[ModLocations.Left].length === 0 &&
                    currEntry[ModLocations.Right].length === 0 &&
                    currEntry[ModLocations.Direct].length === 0;

                if (isEntryEmpty && modSubsection.currCage.mods) {
                    cageModsByCage[modSubsection.currCage.svgId] = {
                        [ModLocations.Top]: modSubsection.currCage.mods[ModLocations.Top] || [],
                        [ModLocations.Bottom]: modSubsection.currCage.mods[ModLocations.Bottom] || [],
                        [ModLocations.Left]: modSubsection.currCage.mods[ModLocations.Left] || [],
                        [ModLocations.Right]: modSubsection.currCage.mods[ModLocations.Right] || [],
                        [ModLocations.Direct]: modSubsection.currCage.mods[ModLocations.Direct] || []
                    };
                }

                modSubsection.mods.forEach(mod => {
                    // Check if this mod already exists in roomModsAccumulator
                    const existingMod = roomModsAccumulator[mod.id];

                    if (!existingMod) {
                        // Only record new mods
                        recordRoomMod(mod.id, mod.label, mod.value);
                    }

                    // Update current cage at dir
                    addOrAppendSubsectionMod(modSubsection.currCage.svgId, dir, modSubsection.currSubId, mod.id, null);
                });
            });
        });

        // Build newRoomMods from accumulated room mods.
        console.log("roomModsAccumulator: ", roomModsAccumulator)
        Object.keys(roomModsAccumulator).forEach((key) => {
            newRoomMods[key] = {
                label: roomModsAccumulator[key].label,
                value: roomModsAccumulator[key].value
            };
        });

        console.log("newRoomMods:", newRoomMods);
        console.log("cageModsByCage:", cageModsByCage);

        // Merge cage modifications back into selectedRoom.rackGroups
        setSelectedRoom(prevState => {
            let newRackGroups = prevState.rackGroups;

            Object.entries(cageModsByCage).forEach(([cageId, value]) => {
                const { rack, rackGroup } = findCageInGroup(cageId as CageSvgId, newRackGroups);
                // rack and rackGroup are used indirectly by the map below; not mutated directly
                newRackGroups = newRackGroups.map(g => ({
                    ...g,
                    racks: g.racks.map(r => ({
                        ...r,
                        cages: r.cages.map(c => {
                            if (c.svgId === cageId) {
                                return { ...c, mods: value };
                            } else {
                                return c;
                            }
                        })
                    }))
                }));
            });

            return {
                ...prevState,
                rackGroups: newRackGroups,
                mods: newRoomMods
            };
        });

        return { status: "Success" };
    };



    const submitLayoutMods = async (): Promise<LayoutSaveResult> => {



        /*const {rack: currRack} = findCageInGroup(currCage.id, selectedRoom.rackGroups);
        const commands: Command[] = [];
        const modsToSave: ModHistoryData[] = [];
        const modsToUpdate: ModHistoryData[] = [];
        const modChanges = compareMods(prevRoomMods, currCageMods);
        console.log("Mod Changes: ", modChanges);
        const newTimestamp = new Date();
        modChanges.forEach((change) => {
            const modLoc = parseInt(change.direction);
            // new mod data if adding or modifying
            const newModData: ModHistoryData = {
                location: undefined,
                subId: 0,
                modId: '',
                parentModId: null,
                cage: parseRoomItemNum(currCage.cageNum),
                endDate: null,
                modification: change.mod as ModTypes,
                rack: currRack.rowid,
                room: selectedRoom.name,
                startDate: newTimestamp
            };
            if(change.type === 'added'){
                // Add new mod
                modsToSave.push(newModData);
            }else {
                // Set old mod date end date
                /!*const modToEnd = prevRoomMods.find((mod) => {
                    // Finding the correct mod in the desired location that is currently active
                    // Uses rack (rowid), cage num, location, location id and endDate to determine correct mod.
                    return mod.rackRowId === currRack.rowid && mod.cage === parseRoomItemNum(currCage.cageNum) && mod.endDate === null;
                });
                modsToUpdate.push({...modToEnd, endDate: newTimestamp});
                if (change.type === 'modified') { // add new mod if modified
                    modsToSave.push(newModData);
                }*!/
            }
        })

        if(modsToUpdate.length > 0){
            commands.push({
                command: "update",
                schemaName: "cageui",
                queryName: "cage_modifications_history",
                rows: modsToUpdate
            });
        }

        if(modsToSave){
            commands.push({
                command: "insert",
                schemaName: "cageui",
                queryName: "cage_modifications_history",
                rows: modsToSave
            });
        }
        console.log("Commands: ", commands);
        return;
        const result = await labkeySaveRows(commands);
        // Determine success or failure
        if(result.errorCount === 0){
            // On success refresh the current room and ensure that it fetches new data by changing loaded to false.
            setRoomRefresh(true);
            setLoadedRooms((prevRooms) => {
                if(prevRooms[selectedRoom.name]){
                    return {
                        ...prevRooms,
                       [selectedRoom.name]: {
                            ...prevRooms[selectedRoom.name],
                            loaded: false
                        }
                    }
                }else{
                    return prevRooms;
                }
            });
            return { status: 'Success'};
        }else{
            return {
                status: 'Failure',
                reason: ["failures"] // Return an array of failure reasons
            };
        }*/


        let result: LayoutSaveResult;
        try {
            const layoutSave = await saveModLayout(selectedRoom, selectedRoomMods);
            result = {success: layoutSave.success, roomName: selectedRoom.name};
        } catch (e){
            result = {success: e.success, roomName: selectedRoom.name, reason: e.errors};
        }
        // Determine success or failure
        return result;
    }

    return (
        <RoomContext.Provider value={{
            switchToRoom,
            selectedRoom,
            selectedRoomMods,
            saveCageMods,
            submitLayoutMods
        }}>
            {children}
        </RoomContext.Provider>
    );
};

