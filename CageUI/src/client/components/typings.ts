export type CagePosition = "top" | "bottom";
export type CageType = "cage" | "pen";
export interface Cage {
    id: number
    name: string;
    cageState: CageState;
    position: string;
    type: CageType
}


export interface Rack {
    id: number;
    type: string;
    cages: Cage[];
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
    PopTop,
    BumpOut,
    PlayCage
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

export interface CageState {
    leftDivider: Modification | undefined;
    rightDivider: Modification | undefined;
    floor: Modification | undefined;
    extraMods: Modification[] | undefined;
}


const Schematics: SchematicRoomProps = {
    "AB140-167.svg": {
        rackNum: 6,
        cageNum: 4,
        rackTypes: [RackTypes.TwoOfTwo], // rack types starting at cage 1 going up (single value means all racks the same)
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
    meshFloorX2: { // TODO figure out styling for this double mesh
        name: "Mesh Floor x2",
        mod: ModTypes.MeshFloorX2,
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
        styles: []
    },
    vcDivider: {
        name: "Visual Contact Divider",
        mod: ModTypes.VCDivider,
        styles: []
    },
    privacyDivider: {
        name: "Privacy Divider",
        mod: ModTypes.PrivacyDivider,
        styles: []
    },
    noDivider: {
        name: "No Divider",
        mod: ModTypes.NoDivider,
        styles: [{
            property: "stroke",
            value: "none"
        }]
    },
    cTunnel: {
        name: "C-Tunnel",
        mod: ModTypes.CTunnel,
        styles: []
    },
    popTop: {
        name: "Pop Top",
        mod: ModTypes.PopTop,
        styles: []
    },
    bumpOut: {
        name: "Bump Out",
        mod: ModTypes.BumpOut,
        styles: []
    },
    playCage: {
        name: "Play Cage",
        mod: ModTypes.PlayCage,
        styles: []
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
export const RackSeparators = {
    rackTwoOfTwo: {
        topDivider: Modifications.solidDivider,
        bottomDivider: Modifications.solidDivider,
        leftFloor: Modifications.standardFloor,
        rightFloor: Modifications.standardFloor
    },
    rackOneOfOne: {
        floor: Modifications.standardFloor
    },
    pen: {

    },
    penRack: {

    },
    rackHorizontal: {
        topDivider: Modifications.solidDivider,
        bottomDivider: Modifications.solidDivider,
        floor: Modifications.standardFloor,
    }
}

export const DefaultCageState = {
    rackTwoOfTwo: {
        posA: {
            rightDivider: {modData: RackSeparators.rackTwoOfTwo.topDivider, affCage: []},
            leftFloor: {modData: RackSeparators.rackTwoOfTwo.leftFloor, affCage: []},
            extraMods: [{modData: Modifications.popTop, affCage: ["#0001", "#0002"]}]
        },
        posB: {
            leftDivider: {modData: RackSeparators.rackTwoOfTwo.topDivider, affCage: []},
            rightFloor: {modData: RackSeparators.rackTwoOfTwo.rightFloor, affCage: []},
            extraMods: []
        },
        posC: {
            rightDivider: {modData: RackSeparators.rackTwoOfTwo.bottomDivider, affCage: []},
            extraMods: []
        },
        posD: {
            leftDivider: {modData: RackSeparators.rackTwoOfTwo.bottomDivider, affCage: []},
            extraMods: []
        },
    }
}
