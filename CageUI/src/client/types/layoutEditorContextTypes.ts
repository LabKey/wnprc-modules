import * as React from 'react';
import { ReactNode } from 'react';
import {
    Cage,
    LayoutHistoryData,
    Rack,
    RackGroup,
    RackStringType,
    Room,
    RoomItemClass,
    RoomItemType,
    UnitLocations
} from './typings';
import {
    DeleteActions,
    LayoutSaveResult,
    RackActions,
    SelectedObj
} from './layoutEditorTypes';
import * as d3 from 'd3';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';

export interface LayoutContextProps {
    children: ReactNode;
    prevRoom: {room: Room, locs: UnitLocations, data: LayoutHistoryData[]};
    user: GetUserPermissionsResponse;
}

export interface LayoutContextType {
    room: Room;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
    saveRoom: (templateRename?: boolean) => Promise<LayoutSaveResult>;
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    setLayoutSvg: React.Dispatch<React.SetStateAction<d3.Selection<SVGElement, {}, HTMLElement, any>>>;
    unitLocs: UnitLocations;
    localRoom: Room;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
    addRoomItem: (itemType: RoomItemType, itemId: string, x: number, y: number, scale: number) => Promise<boolean>;
    changeCageNum: (numBefore: number, numAfter: number) => void;
    cageNumChange: {before: number, after: number};
    moveObjLocation: (itemId: string, type: RoomItemClass, x: number, y: number, k: number) => void;
    doRackAction: (action: RackActions, targetId: string, dragId: string, newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => void;
    getNextCageNum: (rackType: RackStringType) => number;
    selectedObj: SelectedObj;
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    delCage: (cage: Cage, rack: Rack, rackGroup: RackGroup, action: DeleteActions) => void;
    delObject: (objId: string) => void;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    changeRack: (newType: {value: string, label: string}) => Promise<string>;
    clearGrid: () => void;
    user: GetUserPermissionsResponse;
}