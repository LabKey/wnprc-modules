import { Cage, Rack, RackGroup, Room, RoomItem, RoomItemType } from './typings';
import * as d3 from 'd3';
import * as React from 'react';
import { MutableRefObject } from 'react';
import {RoomItemClass} from './typings';

export type GateContext = {room: string, roomId: number}; // extra context for Gate Object, describes target room

export type RackActions = 'merge' | 'connect' | 'cancel';

// deletion actions for state management, cage = delete cage from rack, rack = delete rack from rack group, group = delete entire rack group
export type DeleteActions = 'cage' | 'rack' | 'group';

export type SelectedObj = RoomItem | RackGroup | Cage;



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
    draggedRack: Rack;
    targetRackGroup: RackGroup;
    dragRackGroup: RackGroup;
    doRackAction: (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    layoutDrag: d3.DragBehavior<any, any, any>;
    cageActionProps: CageActionProps;
}

export interface StartDragProps {
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    localRoomRef: MutableRefObject<Room>;
}


