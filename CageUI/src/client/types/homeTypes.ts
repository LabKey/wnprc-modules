/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

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


export type SelectedViews = 'Home' | 'Room' | 'Rack' | 'Cage';

export type ConnectedModType = Partial<EHRCageMods> & { modId: ModIdKey, parentModId?: ModIdKey };

export type ExpandedRooms = {
    [key: string]: boolean;
}


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

export interface ModificationSaveResult {
    status: 'Success' | 'Failure';
    reason?: string[];
}

export interface RackSwitchOption {
    value: {
        objectId: string;
        rackId: number;
        typeRowId: number;
    };
    label: string;
}

export interface AnimalInCage {
    id: string;
}
