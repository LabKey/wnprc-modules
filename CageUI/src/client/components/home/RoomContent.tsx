import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';
import { RoomViewContent } from './roomView/RoomViewContent';
import { CageViewContent } from './cageView/CageViewContent';
import { RackViewContent } from './rackView/RackViewContent';
import { HomeViewContent } from './HomeViewContent';

export const RoomContent: FC = () => {
    const {selectedPage} = useHomeContext();

    const renderContent = () => {
        switch (selectedPage?.selected) {
            case 'Room':
                return <RoomViewContent />;
            case 'Rack':
                return <RackViewContent />;
            case 'Cage':
                return <CageViewContent />;
            default:
                return <HomeViewContent />;
        }
    }

    return (
        <div className={"view-content"}>
            {renderContent()}
        </div>
    );
}