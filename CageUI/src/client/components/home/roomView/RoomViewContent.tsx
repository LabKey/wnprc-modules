import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../../cageui.scss';
import { ActionURL, Filter } from '@labkey/api';
import { SubViewContent } from '../SubViewContent';
import { RoomDetails } from './RoomDetails';
import { RoomLayout } from './RoomLayout';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import {
    AllHistoryData,
    FullObjectHistoryData,
    LayoutData,
    LayoutHistoryData,
    TemplateHistoryData
} from '../../../types/typings';
import { SVG_HEIGHT, SVG_WIDTH } from '../../../utils/constants';
import { processRealLayoutHistory } from '../../../utils/LayoutEditorHelpers';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../../context/RoomContextManager';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage} = useHomeNavigationContext();
    const {selectedRoom} = useRoomContext();
    const roomName = selectedPage?.room;

    const handleLayoutEdit = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), "editLayout" , ActionURL.getContainer(), {
            room: roomName,
            returnUrl: window.location.href
        });
    };

    return (
        selectedPage &&
            <div className={"room-view-container"} key={'layout-' + roomName}>
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
                            selectedRoom ?
                                <RoomLayout />
                                :
                                <div className={"labkey-error"}>
                                    {roomName} does not have an existing layout.
                                </div>
                    },{
                        name: 'Details',
                        children: <RoomDetails />
                    }
                    ]}
                />
            </div>
    );
}