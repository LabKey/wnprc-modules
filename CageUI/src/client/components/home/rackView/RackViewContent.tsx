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
import { FC, useState } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RackDetails } from './RackDetails';
import { CagesOverview } from './CagesOverview';
import { ChangeRackPopup } from './ChangeRackPopup';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { isRoomModifier } from '../../../utils/helpers';

export const RackViewContent: FC = () => {
    const {selectedRoom, selectedRack, userProfile} = useHomeNavigationContext();
    const [showChangeRackPopup, setShowChangeRackPopup] = useState(false);

    const handleRackChange = () => {
        setShowChangeRackPopup(true);
    }

    return (
        selectedRack &&
        <div className={'room-view-container'} id={"rack-view-container"} key={'layout-' + selectedRoom + '-rack-' + selectedRack}>
            <div className={'room-view-title'}>
                <span>
                    Rack {selectedRack.itemId}
                </span>
                {isRoomModifier(userProfile) &&
                    <button type={'button'} className={'layout-toolbar-btn'} onClick={handleRackChange}>
                        Change Rack
                    </button>
                }
            </div>
            <SubViewContent
                tabs={[{
                    name: 'Details',
                    children: <RackDetails/>
                },{
                    name: 'Cages Overview',
                    children: <CagesOverview/>
                }
                ]}
            />
            {showChangeRackPopup &&
                <ChangeRackPopup
                    showChangeRackPopup={setShowChangeRackPopup}
                />
            }
        </div>
    );
};