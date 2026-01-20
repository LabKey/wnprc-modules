import {
    Cage,
    CageNumber,
    CageSvgId,
    ModDirections,
    ModIdKey,
    ModLocations,
    ModStyle,
    ModTypes,
    Rack,
    Room
} from './typings';
import { Option } from '@labkey/components';


type UpdatedMod = {
    cage: Cage,
    mod: { label: string, value: string }
}

export type SelectedViews = 'Home' | 'Room' | 'Rack' | 'Cage';

export type ConnectedModType = Partial<Option<ModTypes>> & { modId: ModIdKey, parentModId?: ModIdKey };

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
    selected: SelectedViews;
    room?: string; // room name
    rack?: string; // rack object ids
    cage?: CageSvgId; // cage object ids
}

export interface ListCage {
    id: CageSvgId;
    name: CageNumber;
}

export interface ListRack {
    id: string;
    name: string;
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
    currSubId: number;
    adjSubId: number;
    currMods?: ConnectedModType[];
    adjMods?: ConnectedModType[];
}

export type ConnectedRacks = {
    [key in ModLocations]: ConnectedRack[];
};

export interface ConnectedCage {
    currSubId: number;
    currCage: Cage;
    currMods?: ConnectedModType[];
    adjMods?: ConnectedModType[];
    adjCage: Cage;
    adjSubId: number;
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
    status: 'Success' | 'Failure';
    reason?: string[];
}
