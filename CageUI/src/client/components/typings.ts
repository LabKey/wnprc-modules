import * as d3 from 'd3';

type CageSize = {
    width: number;
    length: number;
    height: number
}
export type CageSizeWithKey =
    { sizeKey: "8.0", dimensions: CageSize } |
    { sizeKey: "6.0", dimensions: CageSize } |
    { sizeKey: "4.3", dimensions: CageSize };

export type CagePosition = "top" | "bottom";
export type CageType = "cage" | "pen";
export type CageBuilder = "Allentown" | "Suburban" | "Lenderking";
type PageViews = "Room" | "Rack" | "Cage";

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

export interface PendingRackUpdate {
    draggedShape: any;
    cellX: number;
    cellY: number;
    id: number;
}

export interface EndDragLayoutProps {
    gridSize: number;
    gridRatio: number;
    MAX_SNAP_DISTANCE: number;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    delRack: (id: number) => void;
}
export interface Cage {
    id: number
    name: string;
    cageState: CageState;
    position: string;
    type: CageType;
    adjCages: AdjCages | undefined;
    size: CageSizeWithKey;
    manufacturer: CageBuilder
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
export interface Rack {
    id: number;
    type: RackTypes;
    cages: Cage[];
    xPos?: number;
    yPos?: number;
    isActive: boolean;
}
export enum RackTypes {
    OneOfOne,
    TwoOfTwo,
    Pen,
    MultiHorizontal
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

const Schematics: SchematicRoomProps = {
    "AB140-167.svg": {
        rackNum: 6,
        cageNum: 4,
        rackTypes: [RackTypes.TwoOfTwo], // rack types starting at cage 1 going up (single value means all racks the same)
        cageTypes: ["Suburban"],
        cageSizes: [CageSizes['8.0']]
    }
}

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

export const RoomSchematics = {
    ab140: Schematics["AB140-167.svg"],
    ab142: Schematics["AB140-167.svg"],
    ab144: Schematics["AB140-167.svg"],
    ab161: Schematics["AB140-167.svg"],
    ab163: Schematics["AB140-167.svg"],
    ab165: Schematics["AB140-167.svg"],
    ab167: Schematics["AB140-167.svg"],
}

// TODO Change mod Data to access from mod

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
