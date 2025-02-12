import { GateContext } from './layoutEditorTypes';

export type RackStringType = string & { __brand: "RackStringType" };
export type DefaultRackStringType = string & { __brand: "DefaultRackStringType" };
export type RoomObjectStringType = string & { __brand: "RoomObjectStringType" };

export type GroupId = `rack-group-${number}`
export type CageNumber = `${RackStringType}-${number}`

export type RoomItemStringType = RackStringType | RoomObjectStringType | DefaultRackStringType;

export type RoomItemType = RackTypes | RoomObjectTypes | DefaultRackTypes;

export type RoomItem = Rack | RoomObject;
//client side to determine which object type is currently selected
export type SelectionType =  'rack' | 'cage' | 'obj' | 'rackGroup';

// Classification of the objects, caging is for racks/cages/rack groups, roomObj is for things placed in the room not applied to caging
export type RoomItemClass = 'caging' | 'roomObj';

export interface Cage {
    id: number; // Id local to rack
    selectionType: SelectionType;
    cageNum: CageNumber; // Id local to room
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
    extraContext?: string; // extra context if needed for cage
}

export interface Room {
    name: string;
    rackGroups: RackGroup[];
    objects: RoomObject[];
    layoutData: LayoutData;
}

export interface LayoutData {
    scale: number;
    borderWidth: number;
    borderHeight: number;
}

export interface LayoutHistoryData {
    object_type: RoomObjectTypes | RackTypes | DefaultRackTypes;
    extra_context: string | null;
    rack_group: number | null;
    rack: number | null;
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
    name: string | null;
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
    itemId: string; // rack id
    selectionType: SelectionType;
    type: UnitType;
    cages: Cage[];
    x: number; // x coordinate of rack relative to the rack group
    y: number; // y coordinate of rack relative to the rack group
    isActive?: boolean; // Determines if rack is "in use or active"
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
}

// used in ehr to determine if the rack is default (doesn't have a rackid)
export enum DefaultRackTypes {
    DefaultCage = 0,
    DefaultPen = 1,
    DefaultTempCage = 2,
    DefaultPlayCage = 3
}

// RackTypes, DefaultRackTypes and RoomObjectTypes enums equal the value in the ehr_lookups table cageui_item_types
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
    Gate = 103,
}

export interface LocationCoords {
    num: CageNumber;
    cellX: number;
    cellY: number;
}

// keys here are the string for rack type,
export type UnitLocations = {
    [key in RackStringType]: LocationCoords[];
};
