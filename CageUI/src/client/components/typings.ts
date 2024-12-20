import * as d3 from 'd3';
import * as React from 'react';
import { Command } from '@labkey/api/dist/labkey/query/Rows';

type CageSize = {
    width: number;
    length: number;
    height: number
}
export type CageSizeWithKey =
    { sizeKey: "8.0", dimensions: CageSize } |
    { sizeKey: "6.0", dimensions: CageSize } |
    { sizeKey: "4.3", dimensions: CageSize };

export type CagePosition = "top" | "bottom" | "none";
export type CageBuilder = "Allentown" | "Suburban" | "Lenderking";
type PageViews = "Room" | "Rack" | "Cage";
export type RackActions = 'merge' | 'connect' | 'cancel';
export type GroupId = `rack-group-${number}`;

export type RackStringType = (typeof RackTypesStrings)[RackTypes];
export type RoomObjectStringType = (typeof RoomObjectTypesStrings)[RoomObjectTypes];

export type RoomItemStringType = RackStringType | RoomObjectStringType;
export type RoomItemType = RackTypes | RoomObjectTypes | DefaultRackTypes;

// Classification of the objects, caging is for racks, roomObj is for things placed in the room not applied to caging
export type RoomItemClass = 'caging' | 'roomObj';

// deletion actions for state management, cage = delete cage from rack, rack = delete rack from rack group, group = delete entire rack group
export type DeleteActions = 'cage' | 'rack' | 'group';

export interface DoorResizeProps {
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    scaleX: number;
    scaleY: number;
}

export interface LayoutHistoryData {
    object_type: RoomObjectTypes | RackTypes | DefaultRackTypes;
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

export interface Page {
    mainView: PageViews;
    subViewId: string;
}

export interface HandleZoomProps {
    svgHeight: number;
    svgWidth: number;
    gridSize: number;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
}

export interface OffsetProps {
    clientX: number;
    clientY: number;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
}

export interface PendingRoomUpdate {
    draggedShape: any;
    updateItemType: RoomItemType;
    cellX: number;
    cellY: number;
    itemId: string;
}

export interface CageActionProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<string>>;
    setCtxMenuStyle: React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>;
}

export interface LayoutDragProps {
    gridSize: number;
    moveItem: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
}

export interface StartDragProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<string>>;
}

export interface Cage {
    id: number; // Id local to rack
    cageNum: CageNumber; // Id local to room
    cageState: CageState;
    position: CagePosition;
    length: number; //  actual length
    width: number; // actual width
    height: number; // actual height
    sqft: number; //  actual sqft
    adjCages: AdjCages | undefined; //TODO adjCages is for modifications, no need to store the data in backend but make sure its needed when I start work on that part
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
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

export interface PrevRoom {
    cagingData: LayoutHistoryData[];
    layoutData: LayoutData;
    name: string | null;
}

export interface RackGroup {
    racks: Rack[];
    groupId: GroupId;
    x: number; // x coords relative to group of connected racks
    y: number; // y coords relative to group of connected racks
    scale: number // scale relative to group of connected racks
}

export interface Rack {
    itemId: string; // rack id
    type: EHRRackType;
    cages: Cage[];
    x: number; // x coordinate of rack relative to the rack group
    y: number; // y coordinate of rack relative to the rack group
    isActive: boolean;
}

export interface RoomObject {
    itemId: string; // object id
    type: RoomObjectTypes
    x: number;
    y: number;
    scale: number;
}

export interface EHRRackType {
    rowid: number;
    name: string;
    type: RackTypes;
    manufacturer: CageType;
    length: number; // default length
    width: number; // default width
    height: number; // default height
    sqft: number; // default sqft
    supportsTunnel: boolean;
    abbreviation: string;
    description: string;
    isDefault: boolean;
}

export interface EHRRoom {
    rowid: number;
    room: string;
    building: string;
    area: string;
    housingType: number | null;
    housingCondition: number | null;
    maxCages: number;
}

export interface EHRCage {
    rowid: number; // unique row id
    location: string; // location of cage following format 'rack-rackNum'
    position: CagePosition; // position of cage in rack
    cageNum: string; // number of cage in room
    rackNum: number; // number of cage in rack
    x: number; // x coordinate
    y: number; // y coordinate
    rack: string; // unique rack id
    cagetype: EHRRackType; // Rack/Cage Type
    room: string; // unique room name
}

export interface AdjCages {
    leftCage: Cage | undefined;
    rightCage: Cage | undefined;
    floorCage: Cage | undefined;
    ceilingCage: Cage | undefined;
}
export interface CageState {
    leftDivider: {modData: SeparatorMod} | undefined;
    rightDivider: {modData: SeparatorMod} | undefined;
    floor: {modData: SeparatorMod} | undefined;
    extraMod: {modData: ExtraMod} | undefined;
}

export type RoomItem = Rack | RoomObject;

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

// Object mapping for string representation. These string names are used to id divs in the svgs
export const RackTypesStrings: { [key in RackTypes]: string } = {
    [RackTypes.Cage]: "cage",
    [RackTypes.Pen]: "pen",
    [RackTypes.TempCage]: "tempCage",
    [RackTypes.PlayCage]: "playCage",
};

// Like rack types enum but for room objects, start at 100 to give buffer room for rack types
export enum RoomObjectTypes {
    RoomDivider = 100,
    Drain = 101,
    Door = 102
}

export const RoomObjectTypesStrings: { [key in RoomObjectTypes]: string } = {
    [RoomObjectTypes.RoomDivider]: "roomDivider",
    [RoomObjectTypes.Drain]: "drain",
    [RoomObjectTypes.Door]: "door"
};

export interface LocationCoords {
    num: CageNumber;
    cellX: number;
    cellY: number;
}

// keys here are the string for rack type,
export type UnitLocations = {
    [key in RackStringType]: LocationCoords[];
};


export enum CageType {
    Allentown = "allentown",
    Suburban = "suburban",
    Lenderking = "lenderking",
    Unknown = "unknown"
}

export enum ModTypes {
    StandardFloor,
    MeshFloor,
    MeshFloorX2,
    NoFloor,
    SolidDivider,
    PCDivider, // protected contact
    VCDivider, // visual contact
    PrivacyDivider,
    NoDivider,
    CTunnel,
    Extension,
    PlayCage,
    NoMod
}

export interface Modification {
    name: string;
    mod: ModTypes;
    styles: {
        property: string;
        value: string;
    }[]
}

interface SchematicRoomProps {
    [key: string]: {
        rackNum: number;
        cageNum: number;
        rackTypes: RackTypes[];
        cageTypes: CageBuilder[]
        cageSizes: CageSizeWithKey[]
    }
}

export type CageNumber = `${RackStringType}-${number}`

export type SeparatorType = "divider" | "floor";

export type SeparatorPosition = `F${number}` | `T${number}` | `B${number}`;

export interface SeparatorMod {
    type: SeparatorType,
    mod: Modification,
    position: SeparatorPosition
}
export type Separators = SeparatorMod[];

export interface ExtraMod {
    mod: Modification
}

export const DEFAULT_CAGE_TYPE: EHRRackType = {
    rowid: 1,
    abbreviation: 'uk', // abbreviation of manufacturer
    name: 'cage-uk-0.0', // naming convention is 'type-abbreviation-sqft'
    description: 'unknown default cage',
    height: 0.0,
    length: 0.0,
    manufacturer: CageType.Unknown,
    sqft: 0.0,
    supportsTunnel: false,
    type: RackTypes.Cage,
    width: 0.0,
    isDefault: true
}

export const DEFAULT_PEN_TYPE: EHRRackType = {
    rowid: 2,
    abbreviation: 'uk',
    name: 'pen-uk-0.0',
    description: 'unknown default pen',
    height: 0.0,
    length: 0.0,
    manufacturer: CageType.Unknown,
    sqft: 0.0,
    supportsTunnel: false,
    type: RackTypes.Pen,
    width: 0.0,
    isDefault: true

}

export const CageSizes: Record<string, CageSizeWithKey> = {
    "8.0": {
        sizeKey: "8.0",
        dimensions: { width: 8, length: 8, height: 8 }
    },
    "6.0": {
        sizeKey: "6.0",
        dimensions: { width: 6, length: 6, height: 6 }
    },
    "4.3": {
        sizeKey: "4.3",
        dimensions: { width: 4.3, length: 4.3, height: 4.3 }
    }
};

//TODO finish styles
export const Modifications = {
    standardFloor: {
        name: "Standard Floor",
        mod: ModTypes.StandardFloor,
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    meshFloor: {
        name: "Mesh Floor",
        mod: ModTypes.MeshFloor,
        styles: [
            {
                property: "stroke",
                value: "black"
            },
            {
                property: "stroke-dasharray",
                value: "10"
            }
        ]
    },
    meshFloorX2: {
        name: "Mesh Floor x2",
        mod: ModTypes.MeshFloorX2,
        styles: [
            {
                property: "stroke",
                value: "black"
            },
            {
                property: "stroke-dasharray",
                value: "10 5 10"
            },{
                property: "stroke-width",
                value: "2"
            }
        ]
    },
    noFloor: {
        name: "No Floor",
        mod: ModTypes.NoFloor,
        styles: [
            {
                property: "stroke",
                value: "none"
            }
        ]
    },
    solidDivider: {
        name: "Solid Divider",
        mod: ModTypes.SolidDivider,
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    pcDivider: {
        name: "Protected Contact Divider",
        mod: ModTypes.PCDivider,
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "2 5 2"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    vcDivider: {
        name: "Visual Contact Divider",
        mod: ModTypes.VCDivider,
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "5 10 5 10 5 10"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    privacyDivider: {
        name: "Privacy Divider",
        mod: ModTypes.PrivacyDivider,
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "1 1 1 1 1 1"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    noDivider: {
        name: "No Divider",
        mod: ModTypes.NoDivider,
        styles: [{
            property: "stroke",
            value: "none"
        }]
    },
    noMod: {
        name: "No Modification",
        mod: ModTypes.NoMod,
        styles: []
    },
    cTunnel: {
        name: "C-Tunnel",
        mod: ModTypes.CTunnel,
        styles: [{
            property: "stroke",
            value: "black",
        },{
            property: "stroke-width",
            value: "1px",
        }
        ]
    },
    extension: {
        name: "Extension",
        mod: ModTypes.Extension,
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-width",
            value: "1px"
        },{
            property: "fill",
            value: "#FCB017"
        }]
    },
    playCage: {
        name: "Play Cage",
        mod: ModTypes.PlayCage,
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-width",
            value: "1px"
        },{
            property: "fill",
            value: "#6D88C4"
        }]
    },
}

// This is based off the Cage State interface.
export const DefaultCageState = {
    rackTwoOfTwo: {
        posA: {
            rightDivider: {
                modData: {type: "divider", mod: Modifications.solidDivider, position: "T1"} as SeparatorMod,
            },
            floor: {
                modData: {type: "floor", mod: Modifications.standardFloor, position: "F1"} as SeparatorMod
            },
            extraMod: {
                modData: {mod: Modifications.noMod}
            }
        },
        posB: {
            leftDivider: {
                modData: {type: "divider", mod: Modifications.solidDivider, position: "T1"} as SeparatorMod
            },
            floor: {
                modData: {type: "floor", mod: Modifications.standardFloor, position: "F2"} as SeparatorMod
            },
            extraMod: {
                modData: {mod: Modifications.noMod}
            }
        },
        posC: {
            rightDivider: {
                modData: {type: "divider", mod: Modifications.solidDivider, position: "B1"} as SeparatorMod
            },
            extraMod: {
                modData: {mod: Modifications.noMod}
            }
        },
        posD: {
            leftDivider: {
                modData: {type: "divider", mod: Modifications.solidDivider, position: "B1"} as SeparatorMod
            },
            extraMod: {
                modData: {mod: Modifications.noMod}
            }
        },
    }
}