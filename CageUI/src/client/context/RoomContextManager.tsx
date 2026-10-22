/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import { createContext, useContext, useState } from 'react';

import { RoomContextType } from '../types/roomContextTypes';
import { saveRoomHelper, toLabKeyDate } from '../utils/helpers';
import {
    Cage,
    CurrCageMods,
    ModLocations,
    ModTypes,
    Rack,
    RackConditionOption,
    Room,
    RoomObject,
    SessionLog
} from '../types/typings';
import { ModificationSaveResult, RackSwitchOption } from '../types/homeTypes';
import { LayoutSaveResult, RackChangeSaveResult } from '../types/layoutEditorTypes';
import { useHomeNavigationContext } from './HomeNavigationContextManager';
import { createNewRoomFromRackChange } from '../api/labkeyActions';
import { buildUpdatedCageAndRoomMods } from '../utils/homeHelpers';


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
    const {selectedLocalRoom, setSelectedLocalRoom, selectedRoom} = useHomeNavigationContext();

    const [sessionLog, setSessionLog] = useState<SessionLog>({
        startTime: toLabKeyDate(new Date()),
        userAgent: navigator.userAgent,
        schemaName: 'cageui',
        queryName: null,
    });

    const saveRoomObj = (itemId: string, newObj: RoomObject)=> {
        setSelectedLocalRoom(prevState => ({
            ...prevState,
            objects: prevState.objects.map(obj => {
                if(obj.itemId === itemId){
                    return newObj;
                }
                return obj;
            })
        }));
    }

    const saveCageMods = (
        currCage: Cage,
        currCageMods: CurrCageMods
    ): void => {
        // Phase 1: Build updated structures (pure)
        const { cageModsByCage, newRoomMods } = buildUpdatedCageAndRoomMods(selectedLocalRoom, currCage, currCageMods);

        // Phase 2: Update React state
        setSelectedLocalRoom(prevState => {
            // Deep-update cages only where mods were changed
            const updatedRackGroups = prevState.rackGroups.map(rg => ({
                ...rg,
                racks: rg.racks.map(rack => ({
                    ...rack,
                    cages: rack.cages.map(cage => {
                        if (cageModsByCage[cage.objectId]) {
                            return { ...cage, mods: cageModsByCage[cage.objectId] };
                        }
                        return cage;
                    }),
                })),
            }));

            return {
                ...prevState,
                rackGroups: updatedRackGroups,
                mods: newRoomMods,
            };
        });
    };


    const submitLayoutMods = async (): Promise<ModificationSaveResult> => {
        const newSessionLog: SessionLog = {...sessionLog, queryName: 'cage_modifications_history'};

        // Helper to extract mods of type ModTypes.NoDivider or ModTypes.NoFloor on a cage
        const getCageTargetMods = (cage: Cage, room: Room) => {
            const list: { location: ModLocations; subId: number; value: ModTypes }[] = [];
            if (!cage.mods || !room.mods) return list;

            Object.keys(cage.mods).forEach(dirStr => {
                const loc = parseInt(dirStr) as ModLocations;
                const sections = cage.mods[loc];
                if (!sections) return;

                sections.forEach(section => {
                    if (!section.modKeys) return;
                    section.modKeys.forEach(key => {
                        const modObj = room.mods?.[key.modId];
                        if (modObj && (modObj.value === ModTypes.NoDivider || modObj.value === ModTypes.NoFloor)) {
                            list.push({
                                location: loc,
                                subId: section.subId,
                                value: modObj.value
                            });
                        }
                    });
                });
            });
            return list;
        };

        // Helper to find the corresponding cage in the other room
        const findCorrespondingCage = (targetCage: Cage, sourceRoom: Room): Cage | undefined => {
            if (!sourceRoom || !sourceRoom.rackGroups) return undefined;
            for (const group of sourceRoom.rackGroups) {
                if (!group.racks) continue;
                for (const rack of group.racks) {
                    if (!rack.cages) continue;
                    const found = rack.cages.find(c => 
                        (targetCage.objectId && c.objectId === targetCage.objectId) || 
                        (c.cageNum === targetCage.cageNum)
                    );
                    if (found) return found;
                }
            }
            return undefined;
        };

        const differentCages: Cage[] = [];

        if (selectedLocalRoom) {
            selectedLocalRoom.rackGroups?.forEach(group => {
                group.racks?.forEach(rack => {
                    rack.cages?.forEach(cage => {
                        const localTargetMods = getCageTargetMods(cage, selectedLocalRoom);
                        if (localTargetMods.length === 0) return;

                        if (!selectedRoom) {
                            differentCages.push(cage);
                            return;
                        }

                        const prevCage = findCorrespondingCage(cage, selectedRoom);
                        if (!prevCage) {
                            differentCages.push(cage);
                            return;
                        }

                        const prevTargetMods = getCageTargetMods(prevCage, selectedRoom);

                        // Check if any mod in localTargetMods is not present in prevTargetMods
                        const hasDifferentMod = localTargetMods.some(localMod => {
                            return !prevTargetMods.some(prevMod => 
                                prevMod.location === localMod.location &&
                                prevMod.subId === localMod.subId &&
                                prevMod.value === localMod.value
                            );
                        });

                        if (hasDifferentMod) {
                            differentCages.push(cage);
                        }
                    });
                });
            });
        }

        console.log('Cages with different NoDivider or NoFloor mods:', differentCages);
        let layoutRes: LayoutSaveResult;
        const transferToHousing: boolean = differentCages.length > 0;
        if(transferToHousing){
            layoutRes = await saveRoomHelper(selectedLocalRoom, newSessionLog, null, null, 2);
        }else{
            layoutRes = await saveRoomHelper(selectedLocalRoom, newSessionLog);
        }
        return {
            success: layoutRes.success,
            transferToHousing: transferToHousing,
            reason: layoutRes.reason,
            historyid: layoutRes.historyid,
            cages: differentCages.map(c => c.objectId),
        };
    };

    const submitRackChange = async (newRackOption: RackSwitchOption, prevRack: Rack, prevRackCondition: RackConditionOption): Promise<RackChangeSaveResult> => {
        // First pass it to java for validation and to create the room to submit to saveRoomHelper.
        let result: RackChangeSaveResult;
        let newRoom: Room;
        let newRack: string;
        const newSessionLog: SessionLog = {...sessionLog, queryName: 'rack_history'};
        try {
            const newRoomRes = await createNewRoomFromRackChange(selectedLocalRoom, newRackOption, prevRack);
            newRoom = newRoomRes.room;
            let errors;
            if (newRoomRes.errors) {
                errors = Array.isArray(newRoomRes.errors) ? newRoomRes.errors : [newRoomRes.errors];
                result = {success: false, roomName: selectedLocalRoom.name, rack: "",reason: errors};
                return result;
            }
            newRack = newRoomRes.rack;
        }
        catch (e) {
            const errors = Array.isArray(e.errors) ? e.errors : [e.errors];
            result = {
                success: e.success,
                roomName: selectedLocalRoom.name,
                rack: "",
                reason: errors.map(err => err.message || err)
            };
            return result;
        }
        const saveRoomRes = await saveRoomHelper(newRoom,newSessionLog, null, prevRackCondition);
        return {
            ...saveRoomRes,
            rack: newRack,
        }
    }

    return (
        <RoomContext.Provider value={{
            saveCageMods,
            submitLayoutMods,
            submitRackChange,
            saveRoomObj
        }}>
            {children}
        </RoomContext.Provider>
    );
};

