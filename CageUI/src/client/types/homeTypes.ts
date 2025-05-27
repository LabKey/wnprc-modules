import {
    Cage,
    CageNumber,
    DefaultRackId,
    DirectionCategory,
    ModLocations,
    ModTypes,
    Rack,
    RealRackId,
    Room
} from './typings';


type SelectedViews = "Home"| "Room" | "Rack" | "Cage";

type UpdatedMod = {
    cage: Cage,
    mod: { label: string, value: string }
}

export type UpdatedMods = UpdatedMod[];

export type ExpandedRooms = {
    [key: string]: boolean;
}

export type LoadedRooms = {
    [key: string]: { loaded: boolean, room?: Room };
};

export type EHRCageMods = {
    [key in ModTypes]: {
        category: DirectionCategory;
        rowid: number;
        title: string;
    }
}

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

export interface ModificationSaveResult {
    status: "Success" | "Failure";
    reason?: string[];
}