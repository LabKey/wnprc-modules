import {
    Cage, CageDirection, CageMapKey,
    CageNumber,
    DefaultRackId, ModHistoryData, ModDirections,
    ModLocations,
    ModTypes,
    Rack,
    RealRackId,
    Room, ModStyle
} from './typings';
import { Option } from '@labkey/components';


type SelectedViews = "Home"| "Room" | "Rack" | "Cage";

type UpdatedMod = {
    cage: Cage,
    mod: { label: string, value: string }
}

export type ConnectedModType = Option<ModTypes> & {id: CageMapKey};

export type UpdatedMods = UpdatedMod[];

export type ExpandedRooms = {
    [key: string]: boolean;
}

export type LoadedRooms = {
    [key: string]: { loaded: boolean, room?: Room };
};

export type EHRCageMods = {
    rowid: number;
    value: ModTypes;
    title: string;
    direction: ModDirections;
    type: ModStyle;

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

export interface ConnectedRack {
    currRack: Rack;
    currCage: Cage;
    adjRack: Rack;
    adjCage: Cage;
    id: number;
    mods?: ConnectedModType[];
}

export type ConnectedRacks = {
    [key in ModLocations]: ConnectedRack[];
};

export interface ConnectedCage {
    id: number;
    currCage: Cage;
    adjCage: Cage;
    mods?: ConnectedModType[];
}

export type ConnectedCages = {
    [key in ModLocations]: ConnectedCage[];
};


/*export interface ConnectedRacks {
    currRack: Rack;
    currCage: Cage;
    direction: ModLocations;
    adjRack: Rack;
    adjCage: Cage;
    id: number;
    mods?: ConnectedModType[];
}*/

/*export interface ConnectedCages {
    id: number;
    currCage: Cage;
    direction: ModLocations;
    adjCage: Cage;
    mods?: ConnectedModType[];
}*/

export interface ModificationSaveResult {
    status: "Success" | "Failure";
    reason?: string[];
}
