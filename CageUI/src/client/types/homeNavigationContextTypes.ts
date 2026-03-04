import { SelectedPage } from './homeTypes';
import { Cage, Rack, RackGroup, Room, RoomMods } from './typings';
import { SetStateAction } from 'react';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    selectedRoom: Room;
    setSelectedRoom: React.Dispatch<SetStateAction<Room>>;
    selectedRoomMods: RoomMods;
    selectedRackGroup: RackGroup;
    selectedRack: Rack;
    selectedCage: Cage;
    navigateTo: (page: SelectedPage) => void;
}