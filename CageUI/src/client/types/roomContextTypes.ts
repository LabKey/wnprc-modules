import { Cage, CurrCageMods, Rack, RackGroup, Room, RoomMods } from './typings';
import { ModificationSaveResult, RackSwitchOption } from './homeTypes';
import { LayoutSaveResult, RackChangeSaveResult } from './layoutEditorTypes';

export interface RoomContextType {
    saveCageMods: (currCage: Cage, currCageMods: CurrCageMods) => ModificationSaveResult;
    submitLayoutMods: () => Promise<LayoutSaveResult>;
    submitRackChange: (newRack: RackSwitchOption, prevRack: Rack) => Promise<RackChangeSaveResult>
}