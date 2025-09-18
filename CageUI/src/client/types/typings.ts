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

import { GateContext } from './layoutEditorTypes';
import { ConnectedCages, ConnectedModType, ConnectedRacks } from './homeTypes';
import { Option } from '@labkey/components';

/*
   **IMPORTANT**

   DefaultRackTypes, RackTypes, and RoomObjectTypes must be defined in this file.
   Type checking and enum looping is used throughout the cage UI project so it's important to have them written here.

   RackTypes, DefaultRackTypes and RoomObjectTypes enums equal the value in the ehr_lookups table cageui_item_types.

 */


// used in ehr to determine if the rack is default (doesn't have a rackid)
export enum DefaultRackTypes {
    DefaultCage = 0,
    DefaultPen = 1,
    DefaultTempCage = 2,
    DefaultPlayCage = 3
}


// Enum of rack types, map to string first, used to store types as integers in the db
export enum RackTypes {
    Cage = 4,
    Pen = 5,
    TempCage = 6,
    PlayCage = 7
}

// Like rack types enum but for room objects, start at 100 to give buffer room for rack types
export enum RoomObjectTypes {
    RoomDivider = 100,
    Drain = 101,
    Door = 102,
    GateClosed = 103,
    GateOpen = 104,
    Top = 104,
    Bottom = 104,
}

// value in the cage modifications table in EHR
export enum ModTypes {
    StandardFloor='sf',
    MeshFloor='mf',
    MeshFloorX2='dmf',
    NoFloor='nf',
    SolidDivider='sd',
    PCDivider='pcd', // protected contact
    VCDivider='vcd', // visual contact
    PrivacyDivider='pd',
    NoDivider='nd',
    CTunnel='ct',
    Extension='ex',
    SPDivider = 'spd' // Social Panel
}

export enum ModDirections {
    Horizontal,
    Vertical,
    Direct
}

export enum ModStyle {
    Attachment,
    Separator
}

export enum ModLocations {
    Left,
    Right,
    Top,
    Bottom,
    Direct
}

export enum CageDirection {
    Left,
    Right,
    Top,
    Bottom,
}

export type RackStringType = string & { __brand: "RackStringType" };
export type DefaultRackStringType = string & { __brand: "DefaultRackStringType" };
export type RoomObjectStringType = string & { __brand: "RoomObjectStringType" };
export type DefaultRackId = `default-rack-${number}`;
export type RealRackId = `rack-${number}`;
export type CageSvgId = `cageSVG-${number}`;

export type GroupId = `rack-group-${number}`
export type CageNumber = `${RackStringType}-${number}`

export type RoomItemStringType = RackStringType | RoomObjectStringType | DefaultRackStringType;

export type RoomItemType = RackTypes | RoomObjectTypes | DefaultRackTypes;

export type RoomItem = Rack | RoomObject;
//client side to determine which object type is currently selected
export type SelectionType =  'rack' | 'cage' | 'obj' | 'rackGroup';

// Classification of the objects, caging is for racks/cages/rack groups, roomObj is for things placed in the room not applied to caging
export type RoomItemClass = 'caging' | 'roomObj';

/* svgIds is an array of ids to apply the style to.
    Each id is a string to the following these rules to match the id in the svg file.
    1. The first string before an optional '-' is always the first id or only id to find. The location id always follows this first string.
    2. ids following each "-" is the id of the next child to grab of the previous svg id.
    Examples:
        ["extension"]: This will find the id with the name "extension" in the svg file with the appropriate location id. (extension-locationId)
        ["cTunnel-left", "cTunnel-circle"]: For each string, first find the id (cTunnel-locationId) then find the id "left" or "circle".
 */
export type Modification = {
    name: string;
    svgIds: {
        [key in ModLocations]?: string[];
    };
    styles: {
        property: string;
        value: string;
    }[]
}

export type ModRecord = Record<ModTypes, Modification>;

export type CageModification = {
    id: number; // id for duplicate mods in the same location, imagine 2 cages on one side of a pen
    mod: ModTypes; // Use mod in the Modifications constant to get styles for mod
}

export interface Cage {
    id: CageSvgId; // unique id
    localRackId: number; // Id local to rack
    selectionType: SelectionType;
    cageNum: CageNumber; // Id local to room
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
    size: number; // length in cells of cage square of svg image
    extraContext?:  {[key: string]: any}; // extra context if needed for cage
    mods?: CageModificationsType;
}


export type CageMapKey = string;

export interface RoomMods {
    [key: CageMapKey]: Option<ModTypes>;
}

export interface CurrCageMods {
    adjCages: ConnectedCages;
    adjRacks: ConnectedRacks;
    currCage: ConnectedModType[];
}

export interface CageModificationsType {
    [ModLocations.Top]: {
        mods: CageMapKey[];
        subId: number; // subsection id
    }[];
    [ModLocations.Bottom]: {
        mods: CageMapKey[];
        subId: number;
    }[];
    [ModLocations.Left]: {
        mods: CageMapKey[];
        subId: number;
    }[];
    [ModLocations.Right]: {
        mods: CageMapKey[];
        subId: number;
    }[];
    [ModLocations.Direct]: {
        mods: CageMapKey[];
        subId: number;
    }[];
}

export interface Room {
    name: string;
    rackGroups: RackGroup[];
    objects: RoomObject[];
    layoutData: LayoutData;
    mods?: RoomMods;
}

export interface LayoutData {
    scale: number;
    borderWidth: number;
    borderHeight: number;
    status: boolean;
}

export interface LayoutHistoryData {
    object_type: RoomObjectTypes | RackTypes | DefaultRackTypes;
    extra_context: string | null;
    rack_group: number | null;
    rack: number | null; // row id of rack in racks table
    cage: string | null;
    x_coord: number;
    y_coord: number;
    start_date?: Date;
    end_date?: Date;
    room?: string;
    rowid?: number;
}

export interface PrevRoom {
    cagingData: LayoutHistoryData[];
    layoutData: LayoutData;
    modData?: ModHistoryData[];
    name: string | null;
}

export interface ModHistoryData {
    rowid?: number;
    modId: string; // unique mod id
    parentModId: string | null; // this determines if the mod is the flipped perspective of the inserted mod or the original (null if original, or modId of the original mod if flipped perspective)
    room: string;
    rack: number; // rack row id
    cage: number;
    modification: ModTypes;
    location: ModLocations;
    subId: number; // subsection of location where the mod is located
    startDate: Date;
    endDate: Date | null;
}

export interface RackGroup {
    racks: Rack[];
    selectionType: SelectionType;
    groupId: GroupId;
    x: number; // x coords relative to group of connected racks
    y: number; // y coords relative to group of connected racks
    scale: number // scale relative to group of connected racks
}

export interface Rack {
    itemId: DefaultRackId | RealRackId; // rack id
    rowid?: number; // if real rack this will have a rowid
    selectionType: SelectionType;
    type: UnitType;
    cages: Cage[];
    x: number; // x coordinate of rack relative to the rack group
    y: number; // y coordinate of rack relative to the rack group
    isActive?: boolean; // Determines if rack is "in use or active"
    extraContext?: {[key: string]: any};
}

export interface RoomObject {
    itemId: string; // object id
    selectionType: SelectionType;
    type: RoomObjectTypes
    x: number;
    y: number;
    scale: number;
    extraContext?: GateContext; // add any additional context def here
}

export interface UnitType {
    rowid: number;
    name: string; // naming convention is 'type-manufacturer-sqft'
    type: RackTypes; // this cannot be a default, defaults are stored in layout history but not included in code. use isDefault to check if a rack is default outside of getting data
    isDefault: boolean;
    sides: {
        [ModLocations.Top]: {
            sections: number
        };
        [ModLocations.Bottom]: {
            sections: number
        };
        [ModLocations.Left]: {
            sections: number
        };
        [ModLocations.Right]: {
            sections: number
        };
        [ModLocations.Direct]: {
            sections: number
        };
    };
}

export interface LocationCoords {
    cageId: CageSvgId;
    cellX: number;
    cellY: number;
}

// keys here are the string for rack type,
export type UnitLocations = {
    [key in RackStringType]: LocationCoords[];
};
