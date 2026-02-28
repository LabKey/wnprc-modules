import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../context/RoomContextManager';

export const RoomNavbar: FC = () => {
    const {selectedPage, navigateTo, selectedRack, selectedCage} = useHomeNavigationContext();

    const handleRoomClick = () => {
        navigateTo({selected: 'Room', room: selectedPage.room});
    };

    const handleRackClick = () => {
        navigateTo({selected: 'Rack', room: selectedPage.room, rack: selectedPage.rack});
    };
    const handleCageClick = () => {
        navigateTo({selected: 'Room', room: selectedPage.room, rack: selectedPage.rack, cage: selectedPage.cage});
    };

    // TODO add cage type for cage instead of 'Cage'
    return (
        <div className="page-map">
            <div className={'page-map-url'}>
                <span className={'page-map-link'} onClick={() => navigateTo({selected: 'Home'})}> Home </span>
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