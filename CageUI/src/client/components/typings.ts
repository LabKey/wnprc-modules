import * as d3 from 'd3';
import * as React from 'react';

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

// Classification of the objects, caging is for racks, roomObj is for things placed in the room not applied to caging, cagingObj are like roomObjs but can be connected to caging units
export type RoomItemClass = 'caging' | 'roomObj' | 'cagingObj';



export interface LayoutHistoryData {
    rowid: number;
    objectId: string;
    objectType: RoomObjectTypes | RackTypes;
    startDate: string;
    endDate: string | null;
    x: number;
    y: number;
    scale: number;
    room: string
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
    itemTypeClass: RoomItemClass; // classification of the item
    updateItemType: RackTypes | RoomObjectTypes;
    cellX: number;
    cellY: number;
    itemId: string;
}

export interface CageActionProps {
    setEditCageNum: React.Dispatch<React.SetStateAction<string>>;
    setCtxMenuStyle: React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>;
}

export interface LayoutDragProps {
    gridSize: number;
    MAX_SNAP_DISTANCE: number;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    delRack: (rackId: string) => void;
    moveItem: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
    itemClass: RoomItemClass;
}

export interface StartDragProps {
    setRoomItem: React.Dispatch<React.SetStateAction<string>>;
}

export interface Cage {
    id: number; // Id local to rack
    cageNum: CageNumber; // Id local to room
    rack: string;
    cageState: CageState;
    position: CagePosition;
    type: EHRCageType;
    adjCages: AdjCages | undefined; //TODO adjCages is for modifications, no need to store the data in backend but make sure its needed when I start work on that part
    x: number; // x coordinate of cage in rack coordinate plane
    y: number; // y coordinate of cage in rack coordinate plane
}

export interface Room {
    room: string;
    racks: Rack[];
    objects: RoomObject[];
}


export interface EHRCageType {
    rowid: number;
    cagetype: string;
    type: string;
    manufacturer: string;
    length: number;
    width: number;
    height: number;
    sqft: number;
    supportsTunnel: boolean;
    abbreviation: string;
    description: string;
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
    cageNum: string; // number of cage in room for cagetype.type
    rackNum: number; // number of cage in rack
    x: number; // x coordinate
    y: number; // y coordinate
    rack: string; // unique rack id
    cagetype: EHRCageType; // Rack/Cage Type
    room: string; // unique room name
}

export interface LocationCoords {
    num: CageNumber;
    cellX: number;
    cellY: number;
}

export type UnitLocations = {
    [key in RackTypes]: LocationCoords[];
};

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

/*
   This describes details about groups of connected racks.
   When a new rack is added this will be populated as a new group, and the x and y will be the starting position of that
   group relative to the layout grid.
   This object tells us that the rack is part of a group with that groupId.
   It should be the same for all racks within that group. The reasoning for this is because
   if we have two racks that become connected the rack x and y coords can be added to this group x and y coords to find
   their layout grid positioning, similar to how cages behave in racks.
*/
export interface RackGroupInfo {
    groupId: GroupId;
    x: number;
    y: number;
}

export interface Rack {
    itemId: string; // rack id
    groupInfo: RackGroupInfo;
    type: RackTypes;
    cages: Cage[];
    x: number; // x coordinate of rack relative to the rack group
    y: number; // y coordinate of rack relative to the rack group
    scale: number; // k scaling vector in layout coordinate plane
    isActive: boolean;
}

export interface RoomObject {
    itemId: string; // object id
    type: RoomObjectTypes
    x: number;
    y: number;
    scale: number;
}

export type RoomItem = Rack | RoomObject;

//export type RoomItemType = RoomObjectTypes | RackTypes;


export enum RoomObjectTypes {
    RoomDivider = "roomDivider",
    Drain = "drain",
    Door = "door",
    Connector = 'penConnector'
}

// these string names are used to id divs in the svgs
export enum RackTypes {
    Cage = "cage",
    Pen = "pen",
    TempCage = "tempCage",
    PlayCage = "attachedPlayCage"
}

export enum CageType {
    Allentown = "allentown",
    Suburban = "suburban",
    Lenderking = "lenderking",
    Nursury = "nursury",
    Pen = "pen",
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

export type CageNumber = `${RackTypes}-${number}`

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

export const DEFAULT_CAGE_TYPE: EHRCageType = {
    rowid: 1,
    abbreviation: 'uk', // abbreviation of manufacturer
    cagetype: 'cage-uk-0.0', // naming convention is 'type-abbreviation-sqft'
    description: 'unknown default cage',
    height: 0.0,
    length: 0.0,
    manufacturer: 'unknown',
    sqft: 0.0,
    supportsTunnel: false,
    type: 'cage',
    width: 0.0
}

export const DEFAULT_PEN_TYPE: EHRCageType = {
    rowid: 2,
    abbreviation: 'uk',
    cagetype: 'pen-uk-0.0',
    description: 'unknown default pen',
    height: 0.0,
    length: 0.0,
    manufacturer: 'unknown',
    sqft: 0.0,
    supportsTunnel: false,
    type: 'pen',
    width: 0.0

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
