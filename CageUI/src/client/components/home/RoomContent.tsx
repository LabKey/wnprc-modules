import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { RoomViewContent } from './roomView/RoomViewContent';
import { CageViewContent } from './cageView/CageViewContent';
import { RackViewContent } from './rackView/RackViewContent';
import { HomeViewContent } from './HomeViewContent';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';

export const RoomContent: FC = () => {
    const {selectedPage} = useHomeNavigationContext();

    const renderContent = () => {
        console.log("Render Content: ", selectedPage);
        switch (selectedPage?.selected) {
            case 'Room':
                return <RoomViewContent/>;
            case 'Rack':
                return <RackViewContent/>;
            case 'Cage':
                return <CageViewContent/>;
            default:
                return <HomeViewContent/>;
        }
    };

    return (
        <div className={'view-content'}>
            {renderContent()}
        </div>
    );
};