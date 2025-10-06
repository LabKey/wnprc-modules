import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { useHomeContext } from '../../../context/HomeContextManager';
import { SubViewContent } from '../SubViewContent';
import { RoomDetails } from './RoomDetails';
import { RoomLayout } from './RoomLayout';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage, selectedRoom} = useHomeContext();
    const roomName = selectedPage?.room;

    const handleLayoutEdit = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), "editLayout" , ActionURL.getContainer(), {
            room: roomName,
            returnUrl: window.location.href
        });
    };


    return (
        selectedRoom &&
            <div className={"room-view-container"} key={'layout-' + selectedRoom}>
                <div className={'room-view-title'}>
                    <input
                        type="checkbox"
                        className="room-view-checkbox"
                        disabled={true}
                        checked={selectedRoom?.valid ?? false}
                    />
                    <label>
                        {roomName}
                    </label>
                </div>
                <SubViewContent
                    tabs={[{
                        name: 'Layout',
                        children:
                            <RoomLayout />
                    },{
                        name: 'Details',
                        children: <RoomDetails />
                    }
                    ]}
                />
            </div>
    );
}