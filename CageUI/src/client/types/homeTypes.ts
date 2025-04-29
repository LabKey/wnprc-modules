import { Cage, CageNumber, DefaultRackId, Rack, RealRackId, Room } from './typings';


type SelectedViews = "Home"| "Room" | "Rack" | "Cage";

type SelectedMod = {
    rack: Rack,
    cage: Cage,
    mod: { label: string, value: string }
}

export type SelectedMods = SelectedMod[];

export type Direction = "above" | "below" | "right" | "left";

export type ExpandedRooms = {
    [key: string]: boolean;
}

export type LoadedRooms = {
    [key: string]: { loaded: boolean, room?: Room };
};

export interface SelectedPage {
    selected: SelectedViews
    room?: string;
    rack?: DefaultRackId | RealRackId;
    cage?: CageNumber;
}

export interface ListCage {
    id: CageNumber;
}

export interface ListRack {
    id: DefaultRackId | RealRackId;
    cages: ListCage[];
}

export interface ListRoom {
    name: string;
    racks?: ListRack[];
}