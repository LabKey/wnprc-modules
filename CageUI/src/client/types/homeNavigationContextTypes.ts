import { SelectedPage, SelectedViews } from './homeTypes';
import { Cage, Rack, RackGroup, Room, RoomMods } from './typings';
import { SetStateAction } from 'react';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    switchToRoom: (roomName: string) => Promise<void>;
    selectedRoom: Room;
    setSelectedRoom: React.Dispatch<SetStateAction<Room>>;
    selectedRoomMods: RoomMods;
    selectedRackGroup: RackGroup;
    selectedRack: Rack;
    selectedCage: Cage;
    navigateTo: (page: SelectedViews, data?: {
        room?: string
        rack?: string
        cage?: string
    }) => void;
    goToHome: () => void;
    navigateToRoom: (roomName: string, roomContext) => Promise<void>;
}