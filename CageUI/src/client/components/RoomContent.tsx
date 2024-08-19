import * as React from 'react';
import { FC, useEffect } from 'react';
import '../cageui.scss';
import { useRoomContext } from './ContextManager';
import { RoomViewContent } from './RoomViewContent';
import { CageViewContent } from './CageViewContent';
import { RackViewContent } from './RackViewContent';

export const RoomContent: FC = () => {
    const {selectedPage} = useRoomContext();

    useEffect(() => {
        console.log("Page: ", selectedPage);


    }, [selectedPage]);

    const renderContent = () => {
        switch (selectedPage?.mainView) {
            case 'Room':
                return <RoomViewContent roomName={selectedPage.subViewId} />;
            case 'Rack':
                return <RackViewContent />;
            case 'Cage':
                return <CageViewContent />;
            default:
                return null;
        }
    }

    return (
        <div>
            {renderContent()}
        </div>
    );
}