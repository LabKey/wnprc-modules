import { Cage, CurrCageMods, Rack, RackGroup, Room, RoomMods, RoomWithMods } from './typings';
import { LoadedRooms, ModificationSaveResult, SelectedPage } from './homeTypes';
import * as React from 'react';
import { SelectedObj } from './layoutEditorTypes';

export interface HomeContextType {
    selectedPage: SelectedPage;
    setSelectedPage: React.Dispatch<React.SetStateAction<SelectedPage>>;
    loading: boolean;
    error: string;
    selectedRoom: RoomWithMods;
    loadedRooms: LoadedRooms,
    setLoadedRooms: React.Dispatch<React.SetStateAction<LoadedRooms>>,
    selectedRackGroup: RackGroup,
    selectedRack: Rack,
    selectedCage: Cage,
    selectedContextObj: SelectedObj,
    setSelectedContextObj: React.Dispatch<React.SetStateAction<SelectedObj>>;
    saveCageMods: (currCage: Cage, currCageMods: CurrCageMods) => ModificationSaveResult;
    submitCageMods: (currCage: Cage, currCageMods: CurrCageMods) => Promise<ModificationSaveResult>;
    roomMods: RoomMods;
    prevRoomMods: RoomMods;
    setPrevRoomMods: React.Dispatch<React.SetStateAction<RoomMods>>;
}