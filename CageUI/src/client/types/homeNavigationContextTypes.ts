import Select from 'react-select';
import { SelectedPage, SelectedViews } from './homeTypes';
import { Cage, CageSvgId, Rack, RackGroup } from './typings';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    navigateTo: (page: SelectedViews, data?: { room?: string
        rack?: string
        cage?: string}) => void;
    goToHome: () => void;
    navigateToRoom: (roomName: string, roomContext) => Promise<void>;
}