import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';
import { RoomViewContent } from './RoomViewContent';
import { CageViewContent } from './CageViewContent';
import { RackViewContent } from './RackViewContent';
import { HomeViewContent } from './HomeViewContent';

export const RoomContent: FC = () => {
    const {selectedPage} = useHomeContext();

    useEffect(() => {
        console.log("Page: ", selectedPage);
    }, [selectedPage]);

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