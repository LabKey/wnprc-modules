import { Cage } from './typings';


type SelectedViews = "Home"| "Room" | "Rack" | "Cage";

export type CagePosition = "top" | "bottom" | "none";

export type ExpandedRooms = {
    [key: string]: boolean;
}

export interface SelectedPage {
    selected: SelectedViews
    room?: string;
    rack?: string;
    cage?: string;
}

export interface RoomCage {
    id: number;
}

export interface RoomRack {
    id: number;
    cages: RoomCage[];
}

export interface Room {
    name: string;
    racks?: RoomRack[];
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

export type SeparatorType = "divider" | "floor";

export type SeparatorPosition = `F${number}` | `T${number}` | `B${number}`;

export interface SeparatorMod {
    type: SeparatorType,
    mod: Modification,
    position: SeparatorPosition
}

export interface ExtraMod {
    mod: Modification
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