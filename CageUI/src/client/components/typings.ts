export interface Cage {
    id: number
    name: string;
}

export interface Rack {
    id: number
    cages: Cage[]
}

interface SchematicRoomProps {
    [key: string]: {
        rackNum: number;
        cageNum: number;
    }
}
const Schematics: SchematicRoomProps = {
    "AB140-167.svg": {
        rackNum: 6,
        cageNum: 4
    }
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
