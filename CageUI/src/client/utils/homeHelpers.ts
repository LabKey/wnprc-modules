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
    CageNumber,
    CurrCageMods,
    ModDirections,
    ModLocations,
    ModTypes,
    RoomMods
} from '../types/typings';
import { isRoomCreator, isRoomModifier, isTemplateCreator, parseRoomItemNum, parseRoomItemType } from './helpers';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';


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