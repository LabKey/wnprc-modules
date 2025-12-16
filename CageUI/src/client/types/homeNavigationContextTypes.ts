import Select from 'react-select';
import { SelectedPage, SelectedViews } from './homeTypes';
import { Cage, CageSvgId, Rack, RackGroup } from './typings';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    selectedRackGroup: RackGroup;
    selectedRack: Rack;
    selectedCage: Cage;
    navigateTo: (page: SelectedViews, data?: { room?: string
        rack?: number
        cage?: CageSvgId}) => void;
    goToHome: () => void;
    navigateToRoom: (roomName: string, roomContext) => Promise<void>;
}