import { Cage, CurrCageMods, Room, RoomMods } from './typings';
import { ModificationSaveResult } from './homeTypes';
import { LayoutSaveResult } from './layoutEditorTypes';

export interface RoomContextType {
    switchToRoom: (roomName: string) => Promise<void>;
    selectedRoom: Room;
    selectedRoomMods: RoomMods;
    saveCageMods: (currCage: Cage, currCageMods: CurrCageMods) => ModificationSaveResult;
    submitLayoutMods: () => Promise<LayoutSaveResult>;
}