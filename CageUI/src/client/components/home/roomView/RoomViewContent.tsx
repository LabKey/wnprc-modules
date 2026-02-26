import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { SubViewContent } from '../SubViewContent';
import { RoomDetails } from './RoomDetails';
import { RoomLayout } from './RoomLayout';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../../context/RoomContextManager';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage, selectedRoom} = useHomeNavigationContext();
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
                <input
                        type="checkbox"
                        className="room-view-checkbox"
                        disabled={true}
                        checked={selectedRoom?.valid ?? false}
                />
                <span>
                    {roomName}
                </span>
            </div>
            <SubViewContent
                    tabs={[{
                        name: 'Layout',
                        children:
                            selectedRoom ?
                                <RoomLayout/>
                                :
                                <div className={'labkey-error'}>
                                    {roomName} does not have an existing layout.
                                </div>
                    }, {
                        name: 'Details',
                        children: <RoomDetails/>
                    }
                    ]}
            />
        </div>
    );
};