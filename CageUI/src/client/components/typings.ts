
export interface Cage {
    id: number
    name: string;
    cageState: CageState;
    position: string;
}

interface RackTwoOfTwo {
    topDivider: Modification,
    bottomDivider: Modification,
    leftFloor: Modification,
    rightFloor: Modification
}

export interface Rack {
    id: number;
    type: string;
    cages: Cage[];
    separators: RackTwoOfTwo; //TODO add additional rack interfaces
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
        mod: ModTypes.PCDivider
    },
    vcDivider: {
        name: "Visual Contact Divider",
        mod: ModTypes.VCDivider
    },
    privacyDivider: {
        name: "Privacy Divider",
        mod: ModTypes.PrivacyDivider
    },
    noDivider: {
        name: "No Divider",
        mod: ModTypes.NoDivider,
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    cTunnel: {
        name: "C-Tunnel",
        mod: ModTypes.CTunnel
    },
    popTop: {
        name: "Pop Top",
        mod: ModTypes.PopTop,
        styles: []
    },
    bumpOut: {
        name: "Bump Out",
        mod: ModTypes.BumpOut
    },
    playCage: {
        name: "Play Cage",
        mod: ModTypes.PlayCage
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
        topDivider: Modifications.noDivider,
        bottomDivider: Modifications.noDivider,
        leftFloor: Modifications.standardFloor,
        rightFloor: Modifications.standardFloor
    },
    rackOneOfOne: {
        floor: Modifications.standardFloor
    }
}

export const DefaultCageState = {
    rackTwoOfTwo: {
        posA: {
            rightDivider: Modifications.noDivider,
            floor: Modifications.standardFloor,
            extraMods: [Modifications.popTop]
        },
        posB: {
            leftDivider: Modifications.noDivider,
            floor: Modifications.standardFloor,
            extraMods: []
        },
        posC: {
            rightDivider: Modifications.noDivider,
            extraMods: []
        },
        posD: {
            leftDivider: Modifications.noDivider,
            extraMods: []
        },
    }
}
