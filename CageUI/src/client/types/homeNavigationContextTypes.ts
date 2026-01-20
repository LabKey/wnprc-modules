import { SelectedPage, SelectedViews } from './homeTypes';

export interface HomeNavigationContextType {
    selectedPage: SelectedPage;
    navigateTo: (page: SelectedViews, data?: {
        room?: string
        rack?: string
        cage?: string
    }) => void;
    goToHome: () => void;
    navigateToRoom: (roomName: string, roomContext) => Promise<void>;
}