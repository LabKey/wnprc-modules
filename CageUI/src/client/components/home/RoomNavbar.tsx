import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../context/RoomContextManager';

export const RoomNavbar: FC = () => {
    const {selectedPage, goToHome, navigateTo} = useHomeNavigationContext();
    const {selectedRack, selectedCage} = useRoomContext();

    const handleRoomClick = () => {
        console.log('Room clicked');
        navigateTo('Room', {room: selectedPage.room});
    };

    const handleRackClick = () => {
        console.log('Rack clicked');
        navigateTo('Rack', {room: selectedPage.room, rack: selectedPage.rack});
    };
    const handleCageClick = () => {
        console.log('Cage clicked');
        navigateTo('Room', {room: selectedPage.room, rack: selectedPage.rack, cage: selectedPage.cage});
    };

    // TODO add cage type for cage instead of 'Cage'
    return (
        <div className="page-map">
            <div className={'page-map-url'}>
                <span className={'page-map-link'} onClick={goToHome}> Home </span>
                {selectedPage.room && <div>/</div>}
                {selectedPage.room &&
                        <span
                                className={'page-map-link'}
                                onClick={handleRoomClick}
                        >
                        {`${selectedPage.room}`}
                    </span>
                }
                {selectedPage.rack && <div>/</div>}
                {selectedPage.rack &&
                        <span
                                className={'page-map-link'}
                                onClick={handleRackClick}
                        >
                        {`Rack ${selectedRack?.itemId}`}
                    </span>
                }
                {selectedPage.cage && <div>/</div>}
                {selectedPage.cage &&
                        <span
                                className={'page-map-link'}
                                onClick={handleCageClick}
                        >
                        {`${selectedCage?.cageNum}`}
                    </span>
                }
            </div>

        </div>
    );
};