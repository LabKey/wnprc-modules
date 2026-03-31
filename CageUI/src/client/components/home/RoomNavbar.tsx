/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';

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