import { ExtraContext, GateContext } from './layoutEditorTypes';

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
    PlayCage='pc',
}

export enum ModLocations {
    Left,
    Right,
    Top,
    Bottom,
    Direct
}


export type RackStringType = string & { __brand: "RackStringType" };
export type DefaultRackStringType = string & { __brand: "DefaultRackStringType" };
export type RoomObjectStringType = string & { __brand: "RoomObjectStringType" };
export type DefaultRackId = `default-rack-${number}`;
export type RealRackId = `rack-${number}`;

export type GroupId = `rack-group-${number}`
export type CageNumber = `${RackStringType}-${number}`

export type RoomItemStringType = RackStringType | RoomObjectStringType | DefaultRackStringType;

export type RoomItemType = RackTypes | RoomObjectTypes | DefaultRackTypes;

export type RoomItem = Rack | RoomObject;
//client side to determine which object type is currently selected
export type SelectionType =  'rack' | 'cage' | 'obj' | 'rackGroup';

// Classification of the objects, caging is for racks/cages/rack groups, roomObj is for things placed in the room not applied to caging
export type RoomItemClass = 'caging' | 'roomObj';

export type Modification = {
    name: string;
    svgIds: {
        [key in ModLocations]?: string
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
    id: number; // Id local to rack
    selectionType: SelectionType;
    cageNum: CageNumber; // Id local to room
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
    size: number; // length in cells of cage square of svg image
    extraContext?:  {[key: string]: any}; // extra context if needed for cage
}

export type CageWithMods = Cage & Partial<CageModifications>;

export interface CageModifications {
    mods: {
        [ModLocations.Top]: CageModification[]
        [ModLocations.Bottom]: CageModification[];
        [ModLocations.Left]: CageModification[];
        [ModLocations.Right]: CageModification[];
        [ModLocations.Direct]: CageModification[];
    };
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
    status?: boolean;
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
    modData?: ModData[];
    name: string | null;
}

export interface ModData {
    rowid: number;
    room: string;
    rack: number; // rowid of rack
    cage: number;
    location: ModLocations;
    locationId: number;
    modification: ModTypes;
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
    cages: CageWithMods[];
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
