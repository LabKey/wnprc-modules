import {
    Cage,
    CageModificationsType, CurrRoomMods,
    ModHistoryData,
    ModLocations,
    Rack,
    RackGroup,
    Room,
    RoomItem, RoomMods
} from './typings';
import { LoadedRooms, UpdatedMods, SelectedPage, ModificationSaveResult } from './homeTypes';
import * as React from 'react';
import { SelectedObj } from './layoutEditorTypes';

export interface HomeContextType {
    selectedPage: SelectedPage;
    setSelectedPage: React.Dispatch<React.SetStateAction<SelectedPage>>;
    loading: boolean;
    error: string;
    selectedRoom: Room;
    loadedRooms: LoadedRooms,
    setLoadedRooms: React.Dispatch<React.SetStateAction<LoadedRooms>>,
    selectedRackGroup: RackGroup,
    selectedRack: Rack,
    selectedCage: Cage,
    selectedContextObj: SelectedObj,
    setSelectedContextObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    saveCageMods: (currCage: Cage, currCageMods: CurrRoomMods) => ModificationSaveResult;
    submitCageMods: (currCage: Cage, currCageMods: CurrRoomMods) => Promise<ModificationSaveResult>;
    roomMods: RoomMods;
}