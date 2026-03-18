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

import * as React from 'react';
import { ReactNode } from 'react';
import {
    Cage,
    CageSvgId,
    FullObjectHistoryData,
    LocationCoords,
    Rack,
    RackChangeOption,
    RackGroup,
    RackStringType,
    Room,
    RoomItemClass,
    RoomItemType,
    RoomObject,
    UnitLocations
} from './typings';
import { DeleteActions, LayoutSaveResult, RackActions, SelectedObj } from './layoutEditorTypes';
import * as d3 from 'd3';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';

export interface LayoutContextProps {
    children: ReactNode;
    prevRoom: { room: Room, locs: UnitLocations, data: FullObjectHistoryData[], isTemplate: boolean };
    user: GetUserPermissionsResponse;
}

export interface LayoutContextType {
    room: Room;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
    saveRoom: (oldTemplateName?: string) => Promise<LayoutSaveResult>;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    setLayoutSvg: React.Dispatch<React.SetStateAction<d3.Selection<SVGElement, {}, HTMLElement, any>>>;
    unitLocs: UnitLocations;
    localRoom: Room;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
    addRoomItem: (itemType: RoomItemType, itemId: number, x: number, y: number, scale: number) => Promise<Rack | RoomObject | null>;
    changeCageNum: (numBefore: number, numAfter: number) => void;
    cageNumChange: { before: number, after: number };
    moveObjLocation: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
    doRackAction: (action: RackActions, targetId: string, dragId: string, targetCageId: CageSvgId, dragCageId: CageSvgId, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    getNextCageNum: (rackType: RackStringType) => number;
    selectedObj: SelectedObj;
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    delCage: (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => void;
    delObject: (objId: string) => void;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    changeRack: (newType: RackChangeOption) => Promise<string>;
    clearGrid: () => void;
    user: GetUserPermissionsResponse;
    getAdjCages: (cage: Cage, cageLoc: LocationCoords) => LocationCoords[];
    reloadRoom: Room,
    setReloadRoom: React.Dispatch<React.SetStateAction<Room>>,
}