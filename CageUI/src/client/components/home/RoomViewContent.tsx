import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { useHomeContext } from '../../context/HomeContextManager';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage} = useHomeContext();
    const roomName = selectedPage?.room;

    const handleLayoutEdit = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), "editLayout" , ActionURL.getContainer(), {
            room: roomName,
            returnUrl: window.location.href
        });
    };

    return (
        <div>
            Room Content {roomName}
            <button onClick={handleLayoutEdit}>Edit Layout</button>
        </div>
    );
}