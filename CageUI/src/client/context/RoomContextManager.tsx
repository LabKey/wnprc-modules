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
    RoomMods,
    UnitType
} from '../types/typings';
import { ModificationSaveResult, RackSwitchOption } from '../types/homeTypes';
import { LayoutSaveResult } from '../types/layoutEditorTypes';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { useHomeNavigationContext } from './HomeNavigationContextManager';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { createNewRoomFromRackChange, labkeyActionSelectWithPromise } from '../api/labkeyActions';


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
    const {selectedRoom, selectedRackGroup, selectedRoomMods, selectedRack, selectedCage, setSelectedRoom} = useHomeNavigationContext();

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

    const submitRackChange = async (newRackOption: RackSwitchOption, prevRack: Rack): Promise<LayoutSaveResult> => {
        // First pass it to java for validation and to create the room to submit to saveRoomHelper.
        let result: LayoutSaveResult;
        let newRoom: Room;
        try {
            const newRoomRes = await createNewRoomFromRackChange(selectedRoom, newRackOption, prevRack);
            newRoom = newRoomRes.room;
            let errors;
            if (newRoomRes.errors) {
                errors = Array.isArray(newRoomRes.errors) ? newRoomRes.errors : [newRoomRes.errors];
                result = {success: false, roomName: selectedRoom.name, reason: errors};
                return result;
            }
        }
        catch (e) {
            const errors = Array.isArray(e.errors) ? e.errors : [e.errors];
            result = {success: e.success, roomName: selectedRoom.name, reason: errors.map(err => err.message || err)};
            return result;
        }
        return saveRoomHelper(newRoom);
    }

    return (
        <RoomContext.Provider value={{
            saveCageMods,
            submitLayoutMods,
            submitRackChange
        }}>
            {children}
        </RoomContext.Provider>
    );
};

