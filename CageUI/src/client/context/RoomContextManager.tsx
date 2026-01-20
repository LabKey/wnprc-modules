import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { RoomContextType } from '../types/roomContextTypes';
import { buildNewLocalRoom, fetchRoomData, getAdjLocation, saveRoomHelper } from '../utils/helpers';
import {
    Cage,
    CageModification,
    CageModificationsType,
    CurrCageMods,
    ModLocations,
    Rack,
    RackGroup,
    Room,
    RoomMods
} from '../types/typings';
import { ModificationSaveResult } from '../types/homeTypes';
import _ from 'lodash';
import { LayoutSaveResult } from '../types/layoutEditorTypes';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { useHomeNavigationContext } from './HomeNavigationContextManager';


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
    const {selectedPage} = useHomeNavigationContext();
    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedRoomMods, setSelectedRoomMods] = useState<RoomMods>({});
    const [roomLoading, setRoomLoading] = useState<boolean>(false);

    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);


    useEffect(() => {
        if (!selectedPage?.rack) {
            return;
        }
        //TODO Fetch mods for rack here as well and then set the rack and rack mods
        const {rack: currRack, rackGroup: currGroup} = findRackInGroup(selectedPage.rack, selectedRoom.rackGroups);
        setSelectedRack(currRack);
        setSelectedRackGroup(currGroup);
    }, [selectedPage.rack]);

    useEffect(() => {
        if (!selectedPage?.cage) {
            return;
        }

        const {
            cage: currCage,
            rack: currRack,
            rackGroup: currGroup
        } = findCageInGroup(selectedPage.cage, selectedRoom.rackGroups);
        setSelectedRackGroup(currGroup);
        setSelectedRack(currRack);
        setSelectedCage(currCage);
    }, [selectedPage.cage]);

    const [abortController, setAbortController] = useState(null);

    // Room loading function - this will be called when user clicks a room
    const loadRoomData = async (roomName, forceReload = false) => {
        // If we already have this room and not forcing reload, return cached data


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
            console.log('Set new room: ', roomData);
            // room exists
            if (roomData.prevRoomData) {
                buildNewLocalRoom(roomData.prevRoomData).then((d) => {
                    const newLocalRoom = d[0];
                    if (newLocalRoom) {
                        newLocalRoom.layoutData = roomData.prevRoomData.layoutData;
                        // Ensure they don't share the same reference (using lodash to clone)
                        setSelectedRoomMods(_.cloneDeep(newLocalRoom.mods));
                        setSelectedRoom(newLocalRoom);
                    }
                });
            } else {
                setSelectedRoom(null);
                setSelectedRoomMods({});
            }
        }
        catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading room:', err);
            }
            throw err;
        }
        finally {
            setRoomLoading(false);
            setAbortController(null);
        }
    };

    // Method to explicitly switch to a different room
    const switchToRoom = async (roomName: string) => {
        try {
            await loadRoomData(roomName, true); // Force reload
        }
        catch (error) {
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
        const cageModsByCage: { [key in string]: CageModificationsType } = {}; // string is object uuid
        let idsToRemove: Map<string, boolean> = new Map();
        const newRoomMods: RoomMods = {...selectedRoom.mods};


        // Add adjacent cage mods
        Object.entries(currCageMods.adjCages).forEach(([dirKey, allDirMods]) => {
            allDirMods.forEach(modSubsection => {
                const {currMods, adjMods} = modSubsection;
                const newCurrMods = [...currMods];
                const newAdjMods = [...adjMods];

                if (!cageModsByCage[modSubsection.currCage.objectId]) {
                    cageModsByCage[modSubsection.currCage.objectId] = {...modSubsection.currCage.mods};
                }

                if (!cageModsByCage[modSubsection.adjCage.objectId]) {
                    cageModsByCage[modSubsection.adjCage.objectId] = {...modSubsection.adjCage.mods};
                }

                // 1. go through connected cage mods and add them to the cagesModsByCage object.
                [...newCurrMods, ...newAdjMods].forEach(mod => {
                    newRoomMods[mod.modId] = {label: mod.label, value: mod.value};
                    console.log('Add mod: ', mod.modId, ' value: ', mod.value, ' label: ', mod.label);
                });

                // Track old mod IDs to remove (from previous cage modKeys)
                const oldModIds = [
                    ...modSubsection.currCage.mods[dirKey]?.flatMap(cm =>
                        cm.subId === modSubsection.currSubId ? cm.modKeys.map(m => m.modId) : []
                    ) || [],
                    ...modSubsection.adjCage.mods[getAdjLocation(parseInt(dirKey))]?.flatMap(cm =>
                        cm.subId === modSubsection.adjSubId ? cm.modKeys.map(m => m.modId) : []
                    ) || []
                ];

                oldModIds.forEach(modId => idsToRemove.set(modId, true));
                // Go through all cage mods in direction dirKey, remove the old mods by adding to idsToRemove,
                // and add the new mods from modSubsection.currMods, do the same thing for adjCages.
                cageModsByCage[modSubsection.currCage.objectId][dirKey] = cageModsByCage[modSubsection.currCage.objectId][dirKey].map((cm: CageModification) => {
                    if (cm.subId === modSubsection.currSubId) {
                        return {
                            ...cm,
                            modKeys: [...newCurrMods.map(m => {
                                if (idsToRemove.has(m.modId)) { // this happens when a mod is saved again without changing it.
                                    idsToRemove.delete(m.modId);
                                }
                                return {modId: m.modId, parentModId: m.parentModId};
                            })]
                        };
                    } else {
                        return cm;
                    }
                });

                cageModsByCage[modSubsection.adjCage.objectId][getAdjLocation(parseInt(dirKey))] = cageModsByCage[modSubsection.adjCage.objectId][getAdjLocation(parseInt(dirKey))].map((cm: CageModification) => {
                    if (cm.subId === modSubsection.adjSubId) {
                        return {
                            ...cm,
                            modKeys: [...newAdjMods.map(m => {
                                if (idsToRemove.has(m.modId)) { // this happens when a mod is saved again without changing it.
                                    idsToRemove.delete(m.modId);
                                }
                                return {modId: m.modId, parentModId: m.parentModId};
                            })]
                        };
                    } else {
                        return cm;
                    }
                });
            });
        });

        // Remove direct cage old mods.
        if (currCage.mods[ModLocations.Direct]?.length > 0) {
            currCage.mods[ModLocations.Direct][0].modKeys.forEach(mod => {
                idsToRemove.set(mod.modId, true);
            });
        }
        // Add direct cage mods new mods
        const newDirectMods = currCageMods.currCage.map(m => {
            newRoomMods[m.modId] = {label: m.label, value: m.value};
            if (idsToRemove.has(m.modId)) { // this happens when a mod is saved again without changing it.
                idsToRemove.delete(m.modId);
            }
            return {modId: m.modId, parentModId: null};
        });
        cageModsByCage[currCage.objectId] = {
            ...cageModsByCage[currCage.objectId],
            [ModLocations.Direct]: newDirectMods.length > 0 ? [{subId: 1, modKeys: newDirectMods}] : []
        };

        idsToRemove.forEach((value, key) => {
            if (value) {
                delete newRoomMods[key];
            }
        });

        setSelectedRoom(
            prevState => ({
                ...prevState,
                rackGroups: prevState.rackGroups.map((g) => ({
                    ...g,
                    racks: g.racks.map(r => ({
                        ...r,
                        cages: r.cages.map(c => {
                            if (cageModsByCage[c.objectId]) {
                                return {...c, mods: cageModsByCage[c.objectId]};
                            } else {
                                return c;
                            }
                        })
                    }))
                })),
                mods: newRoomMods
            })
        );

        return {status: 'Success'};
    };

    const submitLayoutMods = async (): Promise<LayoutSaveResult> => {
        return saveRoomHelper(selectedRoom);
    };

    return (
        <RoomContext.Provider value={{
            switchToRoom,
            selectedRoom,
            selectedRoomMods,
            saveCageMods,
            submitLayoutMods,
            selectedRackGroup,
            selectedRack,
            selectedCage
        }}>
            {children}
        </RoomContext.Provider>
    );
};

