/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
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

import { Cage, CageNumber, CageSvgId, Rack, RackGroup, Room, RoomItem, RoomItemClass, RoomItemType } from './typings';
import * as d3 from 'd3';
import * as React from 'react';
import { MutableRefObject } from 'react';

export type GateContext = {room: string, roomId: number}; // extra context for Gate Object, describes target room and status

export type RackActions = 'merge' | 'connect' | 'cancel';

// deletion actions for state management, cage = delete cage from rack, rack = delete rack from rack group, group = delete entire rack group
export type DeleteActions = 'cage' | 'rack' | 'group';

// For mapping cells to room items
export type CellKey = `${number},${number}`;

export type SelectedObj = RoomItem | RackGroup | Cage;


export interface ExtraContext {
    cage?: {[key: string]: any};
    rack?: {[key: string]: any};
}

export interface LayoutSaveResult {
    success: boolean;
    roomName: string // redirect room
    reason?: string[];
}

export interface OffsetProps {
    clientX: number;
    clientY: number;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
}

export interface PendingRoomUpdate {
    draggedShape: any;
    updateItemType: RoomItemType;
    cellX: number;
    cellY: number;
    itemId: number;
}

export interface CageActionProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    setCtxMenuStyle: React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>;
}

export interface LayoutDragProps {
    gridSize: number;
    moveItem: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
}

export interface MergeProps {
    contextMenuRef: MutableRefObject<Room>;
    targetRack: Rack;
    targetCageId: CageSvgId;
    draggedRack: Rack;
    dragCageId: CageSvgId;
    targetRackGroup: RackGroup;
    dragRackGroup: RackGroup;
    doRackAction: (action: RackActions, targetId: string, dragId: string, targetCageNum: CageSvgId, dragCageNum: CageSvgId, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    layoutDrag: d3.DragBehavior<any, any, any>;
    cageActionProps: CageActionProps;
}

export interface StartDragProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    localRoomRef: MutableRefObject<Room>;
}


