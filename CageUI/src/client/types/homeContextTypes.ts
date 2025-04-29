import { Cage, Rack, RackGroup, Room, RoomItem } from './typings';
import { LoadedRooms, SelectedMods, SelectedPage } from './homeTypes';
import * as React from 'react';

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
    selectedRackMods: SelectedMods,
    setSelectedRackMods: React.Dispatch<React.SetStateAction<SelectedMods>>,
}