import { Cage, CurrCageMods, Rack, RackGroup, Room, RoomMods } from './typings';
import { ModificationSaveResult, RackSwitchOption } from './homeTypes';
import { LayoutSaveResult } from './layoutEditorTypes';

export interface RoomContextType {
    switchToRoom: (roomName: string) => Promise<void>;
    selectedRoom: Room;
    selectedRoomMods: RoomMods;
    selectedRackGroup: RackGroup;
    selectedRack: Rack;
    selectedCage: Cage;
    saveCageMods: (currCage: Cage, currCageMods: CurrCageMods) => ModificationSaveResult;
    submitLayoutMods: () => Promise<LayoutSaveResult>;
    submitRackChange: (newRack: RackSwitchOption, prevRack: Rack) => Promise<LayoutSaveResult>
}