import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';

export const RoomNavbar: FC = () => {
    const {selectedPage, setSelectedPage} = useHomeContext();

    const handleHomeClick = () => {
        console.log("Home clicked");
        setSelectedPage(prevState => ({
            selected: "Home"
        }));
    }

    const handleRoomClick = () => {
        console.log("Room clicked");
        setSelectedPage(prevState => ({
            room: prevState.room,
            selected: "Room"
        }));
    }

    const handleRackClick = () => {
        console.log("Rack clicked");
        setSelectedPage(prevState => ({
            room: prevState.room,
            rack: prevState.rack,
            selected: "Rack"
        }));
    }
    const handleCageClick = () => {
        console.log("Cage clicked");
        setSelectedPage(prevState => ({
            ...prevState,
            selected: "Cage"
        }));
    }
    // TODO add cage type for cage instead of 'Cage'
    return (
        <div className="page-map">
            <div className={"page-map-url"}>
                <span className={'page-map-link'} onClick={handleHomeClick}> Home </span>
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
                        {`Rack ${selectedPage.rack}`}
                    </span>
                }
                {selectedPage.cage && <div>/</div>}
                {selectedPage.cage &&
                        <span
                                className={'page-map-link'}
                                onClick={handleCageClick}
                        >
                        {`Cage ${selectedPage.cage}`}
                    </span>
                }
            </div>

        </div>
    );
}