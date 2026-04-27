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
import '../../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { SubViewContent } from '../SubViewContent';
import { RoomDetails } from './RoomDetails';
import { RoomLayout } from './RoomLayout';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { Button } from 'react-bootstrap';
import { canEditLayout } from '../../../utils/homeHelpers';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage, selectedLocalRoom, userProfile} = useHomeNavigationContext();
    const roomName = selectedPage?.room;

    const handleLayoutEdit = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), 'editLayout', ActionURL.getContainer(), {
            room: roomName,
            returnUrl: window.location.href
        });
    };

    return (
        selectedPage &&
        <div className={'room-view-container'} key={'layout-' + roomName}>
            <div className={'room-view-title'}>
                {/* Hide room valid for now, it could be misleading until we add room validations
                <input
                        type="checkbox"
                        className="room-view-checkbox"
                        disabled={true}
                        checked={selectedRoom?.valid ?? false}
                />*/}
                <span>
                    {roomName}
                </span>

                {canEditLayout(userProfile) &&
                    <Button
                        onClick={handleLayoutEdit}
                        className={"labkey-button"}
                    >
                        Edit Room
                    </Button>
                }
            </div>
            <SubViewContent
                    tabs={[{
                        name: 'Layout',
                        children:
                            selectedLocalRoom ?
                                <RoomLayout/>
                                :
                                <div className={'labkey-error'}>
                                    {roomName} does not have an existing layout.
                                </div>
                    }, /*{ Hide RoomDetails for now since it is currently not used.
                        name: 'Details',
                        children: <RoomDetails/>
                    }*/
                    ]}
            />
        </div>
    );
};