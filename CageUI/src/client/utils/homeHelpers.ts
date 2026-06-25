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

import {
    Cage,
    CageDirection,
    CageModification,
    CageModificationsType,
    CageNumber,
    CurrCageMods,
    ModDirections,
    ModLocations,
    ModTypes,
    Room,
    RoomMods, RoomObject,
    RoomObjectTypes
} from '../types/typings';
import {
    getAdjLocation,
    isRoomCreator,
    isRoomModifier,
    isTemplateCreator,
    parseRoomItemNum,
    parseRoomItemType
} from './helpers';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';


// Returns true if the obj is in the list of available room objects that have a popup.
export const availRoomObjPopups = (obj: RoomObject): boolean => {
    if(obj.type === RoomObjectTypes.GateOpen || obj.type === RoomObjectTypes.GateClosed){
        return true;
    }
    return false;
}

// Determines if the user has access to editing the layout
export const canEditLayout = (user: GetUserPermissionsResponse) => {
    if(isRoomCreator(user) || isTemplateCreator(user) || isRoomModifier(user)) {
        return true;
    }
    return false;
}

// takes a cage number and returns it in a display friendly format, ex: cage-1 -> Cage 1
export const getCageNumDisplay = (cageNum: CageNumber) => {
    return `${parseRoomItemType(cageNum).charAt(0).toUpperCase() + parseRoomItemType(cageNum).slice(1)} ${parseRoomItemNum(cageNum)}`;
}

// sorts an array of cages by cage number for display purposes.
export const sortCagesByCageNumber = (cages: Cage[]): Cage[] => {
    return [...cages].sort((a, b) => {
        const aParts = a.cageNum.split('-');
        const bParts = b.cageNum.split('-');

        // Compare string parts
        const stringComparison = aParts[0].localeCompare(bParts[0]);
        if (stringComparison !== 0) return stringComparison;

        // Compare number parts
        return Number(aParts[1]) - Number(bParts[1]);
    });
}

// Returns a better formatted string for the modification directions shown to users
export const findDirStr = (dir: ModLocations) => {
    return dir === ModLocations.Bottom ? 'Above'
        : dir === ModLocations.Top ? 'Below'
            : dir === ModLocations.Right ? `${ModLocations[ModLocations.Left]} of`
                : `${ModLocations[ModLocations.Right]} of`;
};

export const getLocationDirection = (location: CageDirection | ModLocations): ModDirections => {
    // Check for ModLocations enum values
    if (Object.values(ModLocations).includes(location as ModLocations)) {
        if (location === ModLocations.Direct) {
            return ModDirections.Direct;
        }
        return location === ModLocations.Top || location === ModLocations.Bottom
            ? ModDirections.Vertical
            : ModDirections.Horizontal;
    }

    // Otherwise it must be CageDirection
    return location === CageDirection.Top || location === CageDirection.Bottom
        ? ModDirections.Vertical
        : ModDirections.Horizontal;
};

/*
Recursive helper function to find all the modifications attached to a cage.
It is recursive because if a cage has no divider/floor, it should combine and repeat.
 */
export const findDetails = (clickedCage, cageDetails, rack) => {
    let newCage: Cage;

    Object.keys(clickedCage.cageState).forEach((key) => {
        if (key === 'rightDivider') {
            if (clickedCage.cageState.rightDivider.modData.mod.mod === ModTypes.NoDivider) {
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.rightCage.id);
                if (cageDetails.find(cage => cage.id === newCage.positionId)) {
                    return;
                }
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        } else if (key === 'leftDivider') {
            if (clickedCage.cageState.leftDivider.modData.mod.mod === ModTypes.NoDivider) {
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.leftCage.id);
                if (cageDetails.find(cage => cage.id === newCage.positionId)) {
                    return;
                }
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        } else if (key === 'floor') {
            if (clickedCage.cageState.floor.modData.mod.mod === ModTypes.NoFloor) {
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.floorCage.id);
                if (cageDetails.find(cage => cage.id === newCage.positionId)) {
                    return;
                }
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }
    });
};


interface BuildResult {
    cageModsByCage: { [key: string]: CageModificationsType };
    newRoomMods: RoomMods;
}

/*
 * Builds updated cage modifications and room mods based on current changes,
 * without modifying React state.
 */
export const buildUpdatedCageAndRoomMods = (
    selectedLocalRoom: Room,
    currCage: Cage,
    currCageMods: CurrCageMods
): BuildResult => {
    const cageModsByCage: { [key: string]: CageModificationsType } = {};
    const idsToRemove = new Set<string>();
    const newRoomMods: RoomMods = { ...selectedLocalRoom.mods }; // shallow copy of current room mods

    // --- 1. Process adjacent cages ---
    Object.entries(currCageMods.adjCages).forEach(([dirKey, allDirMods]) => {
        allDirMods.forEach((modSubsection) => {
            const { currMods = [], adjMods = [], currCage: adjCurrCage, adjCage: adjAdjCage } = modSubsection;

            const currCageId = adjCurrCage.objectId;
            const adjCageId = adjAdjCage.objectId;

            // Initialize cage modifications if missing (deep copy the existing mods)
            if (!cageModsByCage[currCageId]) {
                cageModsByCage[currCageId] = deepCopyCageMods(adjCurrCage.mods);
            }
            if (!cageModsByCage[adjCageId]) {
                cageModsByCage[adjCageId] = deepCopyCageMods(adjAdjCage.mods);
            }

            // Step A: Add new mods to room-wide mods registry
            [...currMods, ...adjMods].forEach(mod => {
                newRoomMods[mod.modId] = {direction: mod.direction, rowid: mod.rowid, title: mod.title, type: mod.type, value: mod.value};
            });

            // Step B: Collect mod IDs to remove (from old modKeys in same dir/subId)
            const oldModIds = [
                // From current cage's mods in this direction + subId
                ...(cageModsByCage[currCageId][dirKey] ?? [])
                    .filter(cm => cm.subId === modSubsection.currSubId)
                    .flatMap(cm => cm.modKeys.map(m => m.modId)),
                // From adjacent cage's mods in *reverse* direction + same subId
                ...(cageModsByCage[adjCageId][getAdjLocation(parseInt(dirKey)) as ModLocations] ?? [])
                    .filter(cm => cm.subId === modSubsection.adjSubId)
                    .flatMap(cm => cm.modKeys.map(m => m.modId)),
            ];

            oldModIds.forEach(id => idsToRemove.add(id));

            // Step C: Update modKeys for current cage
            cageModsByCage[currCageId][dirKey] = (
                cageModsByCage[currCageId][dirKey] || []
            ).map((cm: CageModification) => {
                if (cm.subId === modSubsection.currSubId) {
                    const updatedModKeys = currMods.map(m => ({
                        modId: m.modId,
                        parentModId: m.parentModId ?? null,
                    }));

                    // De-duplicate removals: if new mod has same ID as an old one we're removing, don't remove it
                    updatedModKeys.forEach(m => idsToRemove.delete(m.modId));

                    return {
                        ...cm,
                        modKeys: updatedModKeys,
                    };
                }
                return cm;
            });

            // Step D: Update modKeys for adjacent cage
            const reverseDir = getAdjLocation(parseInt(dirKey)) as ModLocations;
            cageModsByCage[adjCageId][reverseDir] = (
                cageModsByCage[adjCageId][reverseDir] || []
            ).map((cm: CageModification) => {
                if (cm.subId === modSubsection.adjSubId) {
                    const updatedModKeys = adjMods.map(m => ({
                        modId: m.modId,
                        parentModId: m.parentModId ?? null,
                    }));

                    updatedModKeys.forEach(m => idsToRemove.delete(m.modId));

                    return {
                        ...cm,
                        modKeys: updatedModKeys,
                    };
                }
                return cm;
            });
        });
    });

    // --- 2. Process current (direct) cage mods ---
    const directKey = ModLocations.Direct;

    // Remove old direct mod keys
    const currDirectMods = currCage.mods?.[directKey] ?? [];
    if (currDirectMods.length > 0) {
        currDirectMods[0].modKeys.forEach(m => idsToRemove.add(m.modId));
    }

    // Add new direct mods
    const newDirectMods = currCageMods.currCage.map(mod => {
        newRoomMods[mod.modId] = {direction: mod.direction, rowid: mod.rowid, title: mod.title, type: mod.type, value: mod.value};
        idsToRemove.delete(mod.modId); // prevent removal if re-saved unchanged
        return {
            modId: mod.modId,
            parentModId: mod.parentModId ?? null,
        };
    });

    // Update direct cage mods (only first subId = 1 is used)
    const currCageId = currCage.objectId;
    if (!cageModsByCage[currCageId]) {
        cageModsByCage[currCageId] = deepCopyCageMods(currCage.mods);
    }
    cageModsByCage[currCageId][directKey] = newDirectMods.length
        ? [{ subId: 1, modKeys: newDirectMods }]
        : [];

    // Apply removals (already tracked in Set → delete from newRoomMods)
    idsToRemove.forEach(modId => {
        delete newRoomMods[modId];
    });

    return { cageModsByCage, newRoomMods };
};

/*
 * Helper to deep-clone cage mods safely (avoids mutating original)
 */
const deepCopyCageMods = (mods?: CageModificationsType): CageModificationsType => {
    if (!mods) return initialCageMods(); // assuming you have a fallback
    return Object.fromEntries(
        Object.entries(mods).map(([dir, cMods]) => [
            dir,
            cMods.map(cm => ({
                ...cm,
                modKeys: [...cm.modKeys],
            })),
        ])
    ) as CageModificationsType;
};

// You’ll need this fallback somewhere — e.g., for empty cages
const initialCageMods = (): CageModificationsType => ({
    [ModLocations.Top]: [],
    [ModLocations.Bottom]: [],
    [ModLocations.Left]: [],
    [ModLocations.Right]: [],
    [ModLocations.Direct]: [],
});
