import * as React from 'react';
import { FC, useEffect } from 'react';
import '../cageui.scss';
import {ActionURL} from '@labkey/api';

interface RoomViewContentProps {
    roomName: string;
}
84
export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {roomName} = props;

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