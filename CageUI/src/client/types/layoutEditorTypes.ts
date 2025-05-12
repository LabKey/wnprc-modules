import { Cage, CageNumber, Rack, RackGroup, Room, RoomItem, RoomItemType } from './typings';
import * as d3 from 'd3';
import * as React from 'react';
import { MutableRefObject } from 'react';
import {RoomItemClass} from './typings';

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
    status: string;
    roomName: string // redirect room
    reason?: any;
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
    itemId: string;
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
    targetCageNum: CageNumber;
    draggedRack: Rack;
    dragCageNum: CageNumber;
    targetRackGroup: RackGroup;
    dragRackGroup: RackGroup;
    doRackAction: (action: RackActions, targetId: string, dragId: string, targetCageNum: CageNumber, dragCageNum: CageNumber, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    layoutDrag: d3.DragBehavior<any, any, any>;
    cageActionProps: CageActionProps;
}

export interface StartDragProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    localRoomRef: MutableRefObject<Room>;
}


