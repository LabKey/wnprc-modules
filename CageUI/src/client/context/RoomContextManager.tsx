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
import { getAdjLocation, saveRoomHelper, toLabKeyDate } from '../utils/helpers';
import {
    Cage,
    CageModification,
    CageModificationsType,
    CurrCageMods,
    ModLocations,
    Rack,
    RackConditionOption,
    Room,
    RoomMods, RoomObject, SessionLog
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


    const submitLayoutMods = async (): Promise<LayoutSaveResult> => {
        const newSessionLog: SessionLog = {...sessionLog, queryName: 'cage_modifications_history'};



        return saveRoomHelper(selectedLocalRoom, newSessionLog);
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

