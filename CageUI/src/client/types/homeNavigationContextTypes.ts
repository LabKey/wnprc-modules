import Select from 'react-select';
import { SelectedPage, SelectedViews } from './homeTypes';
import { CageSvgId } from './typings';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    navigateTo: (page: SelectedViews, data?: { room?: string
        rack?: number
        cage?: CageSvgId}) => void;
    goToHome: () => void;
    navigateToRoom: (roomName: string, roomContext) => Promise<void>;
}