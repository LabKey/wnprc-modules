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
import { SelectorOptions } from '../components/layoutEditor/RoomSizeSelector';

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
    Top = 105,
    Bottom = 106,
}

// value in the cage modifications table in EHR
export enum ModTypes {
    StandardFloor = 'sf',
    MeshFloor = 'mf',
    MeshFloorX2 = 'dmf',
    NoFloor = 'nf',
    SolidDivider = 'sd',
    PCDivider = 'pcd', // protected contact
    VCDivider = 'vcd', // visual contact
    PrivacyDivider = 'pd',
    NoDivider = 'nd',
    CTunnel = 'ct',
    Extension = 'ex',
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

export enum GroupRotation {
    Origin = 0,
    Quarter = 90,
    Half = 180,
    ThreeQuarter = 270,
}

export enum ModSvgLocId {
    Left = 'left',
    Right = 'right',
    Top = 'ceiling',
    Bottom = 'floor',
    Extension = 'extension',
    CTunnelCircle = 'cTunnel-circle',
    CTunnelLeft = 'cTunnel-left',
    CTunnelRight = 'cTunnel-right',
    CTunnelTop = 'cTunnel-top',
    CTunnelBottom = 'cTunnel-bottom',
}

export enum RackConditions {
    Operational,
    Damaged,
    Repairing,
}

export type RackStringType = string & { __brand: 'RackStringType' };
export type DefaultRackStringType = string & { __brand: 'DefaultRackStringType' };
export type RoomObjectStringType = string & { __brand: 'RoomObjectStringType' };
export type CageSvgId = `cageSVG_${string}`;
export type RackSvgId = `rack_${string}`;
export type FullCageHistory = { cageHistory: CageHistoryData, cageData: CageData };

export type GroupId = `rack-group-${number}`
export type CageNumber = `${RackStringType}-${number}`

export type RoomItemStringType = RackStringType | RoomObjectStringType | DefaultRackStringType;

export type RoomItemType = RackTypes | RoomObjectTypes | DefaultRackTypes;

export type RoomItem = Rack | RoomObject;
//client side to determine which object type is currently selected
export type SelectionType = 'rack' | 'cage' | 'obj' | 'rackGroup';

// Classification of the objects, caging is for racks/cages/rack groups, roomObj is for things placed in the room not applied to caging
export type RoomItemClass = 'caging' | 'roomObj';
export type historyType = 'real' | 'template';

export type ModIdKey = string;
export type ModKeyMap = { modId: ModIdKey, parentModId: ModIdKey | null }
export type CageModification = {
    modKeys: ModKeyMap[];
    subId: number; // subsection id
}


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
        [key in ModLocations]?: {
            [key in GroupRotation]?: ModSvgLocId[]
        };
    };
    styles: {
        property: string;
        value: string;
    }[]
}

export type ModRecord = Record<ModTypes, Modification>;


export interface FetchRoomData {
    selectedSize: SelectorOptions;
    showSelectionPopup: boolean;
    prevRoomData: PrevRoom;
    error?: string;
}

export interface Cage {
    objectId: string; //object id of cage in cages table, if it was loaded in from previous room.
    svgId: CageSvgId; // unique id for svg
    positionId: number; // Id local to rack
    selectionType: SelectionType;
    cageNum: CageNumber; // Id local to room
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
    size: number; // length in cells of cage square of svg image
    extraContext?: { [key: string]: any }; // extra context if needed for cage
    mods?: CageModificationsType;
}

export interface CageDimensions {
    length: number;
    width: number;
    height: number;
    sqft: number;
}

export interface RoomMods {
    [key: ModIdKey]: Option<ModTypes>;
}

export interface CurrCageMods {
    adjCages: ConnectedCages | ConnectedRacks;
    currCage: ConnectedModType[];
}

export interface CageModificationsType {
    [ModLocations.Top]: CageModification[];
    [ModLocations.Bottom]: CageModification[];
    [ModLocations.Left]: CageModification[];
    [ModLocations.Right]: CageModification[];
    [ModLocations.Direct]: CageModification[];
}

export interface Room {
    name: string;
    valid: boolean;
    rackGroups: RackGroup[];
    objects: RoomObject[];
    layoutData: LayoutData;
    mods?: RoomMods;
}

export interface LayoutData {
    scale: number;
    borderWidth: number;
    borderHeight: number;
}

export type LayoutObjectData = TemplateHistoryData | LayoutHistoryData;

export interface TemplateHistoryData {
    object_type: RoomObjectTypes | RackTypes | DefaultRackTypes;
    historyid?: string;
    extra_context: string | null;
    rack_group: number;
    group_rotation: GroupRotation;
    rack: number;
    cage: string;
    x_coord: number;
    y_coord: number;
    rowid: number;
}

export interface LayoutHistoryData {
    historyId: string;
    cage: string;
    objectType: RoomObjectTypes | RackTypes | DefaultRackTypes;
    extraContext: string | null;
    xCoord: number;
    yCoord: number;
    rowid?: number;
}

export interface CageHistoryData {
    rowid?: number;
    historyId: string;
    cage: string;
    rackGroup: number;
    groupRotation: GroupRotation;
    cageNum: number;
    length: number;
    width: number;
    height: number;
    sqft: number;
}

// interface for cageui.cages table
export interface CageData {
    rowid: number;
    positionId: number; // id of position in rack
    objectId: string;
    // objectid of rack in racks table
    rack: string;
    cageNum: string;
    length: number;
    width: number;
    height: number;
    sqft: number;
}

// interface for cageui.racks table
export interface RackData {
    rowid: number;
    objectId: string;
    room: string;
    rackId: number;
    rackType: number;
    condition: RackConditions;
}

// interface for cageui.all_history table
export interface AllHistoryData {
    rowid: number;
    room: string;
    valid: boolean;
    historyId: string;
    historyType: historyType;
    startDate: number;
    endDate: number;
}

export interface FullObjectHistoryData {
    objectType: RoomObjectTypes | RackTypes | DefaultRackTypes;
    extraContext: string | null;
    rackGroup?: number;
    groupRotation?: GroupRotation;
    // objectid of rack in racks table
    rack?: RackData | string;
    cage?: FullCageHistory | string;
    xCoord: number;
    yCoord: number;
}

export interface ModData {
    historyId: string;
    cage: string;
    modId: string;
    parentModId: string | null;
    modification: ModTypes;
    location: ModLocations;
    subId: number;
}

export interface PrevRoom {
    cagingData: FullObjectHistoryData[];
    layoutData: LayoutData;
    modData?: ModData[];
    isDefault: boolean;
    name: string | null;
}

export interface CageMods {
    modId: string; // unique mod id
    parentModId: string | null; // this determines if the mod is the flipped perspective of the inserted mod or the original (null if original, or modId of the original mod if flipped perspective)
    rack: string; // rack objectid
    cage: string;// cage objectid
    modification: ModTypes;
    location: ModLocations;
    subId: number; // subsection of location where the mod is located
}

export interface RackGroup {
    racks: Rack[];
    selectionType: SelectionType;
    groupId: GroupId;
    rotation: GroupRotation;
    x: number; // x coords relative to group of connected racks
    y: number; // y coords relative to group of connected racks
    scale: number; // scale relative to group of connected racks
}

export interface Rack {
    itemId: number; // rack id
    svgId: RackSvgId;
    objectId: string;
    selectionType: SelectionType;
    type: UnitType;
    cages: Cage[];
    x: number; // x coordinate of rack relative to the rack group
    y: number; // y coordinate of rack relative to the rack group
    isActive?: boolean; // Determines if rack is "in use or active"
    extraContext?: { [key: string]: any };
    isNew: boolean; // if true this rack was created during the current session and not loaded from the database
}

export interface RoomObject {
    itemId: string; // object id
    selectionType: SelectionType;
    type: RoomObjectTypes;
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
    manufacturer: string;
    stationary: boolean;
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
