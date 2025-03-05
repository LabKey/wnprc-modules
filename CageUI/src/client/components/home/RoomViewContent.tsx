import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { ActionURL } from '@labkey/api';
import { useHomeContext } from '../../context/HomeContextManager';
import { SubViewContent } from './SubViewContent';
import { RoomDetailsSubView } from './RoomDetailsSubView';
import { RoomLayout } from '../homeRoom/RoomLayout';

interface RoomViewContentProps {
}

export const RoomViewContent: FC<RoomViewContentProps> = (props) => {
    const {selectedPage, localRoom} = useHomeContext();
    const roomName = selectedPage?.room;


    useEffect(() => {
        console.log("LocalRoom: ", localRoom);
    }, [localRoom]);

    const handleLayoutEdit = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), "editLayout" , ActionURL.getContainer(), {
            room: roomName,
            returnUrl: window.location.href
        });
    };

    return (
        localRoom &&
            <div className={"room-view-container"} key={'layout-' + localRoom}>
                <div className={'room-view-title'}>
                    <input
                        type="checkbox"
                        className="room-view-checkbox"
                        disabled={true}
                        checked={localRoom?.layoutData.status ?? false}
                    />
                    <label>
                        {roomName}
                    </label>
                </div>
                <SubViewContent
                    tabs={[{
                        name: 'Layout',
                        children:
                            <RoomLayout
                                roomName={roomName}
                                borderSize={localRoom?.layoutData}
                            />
                    },{
                        name: 'Details',
                        children: <RoomDetailsSubView />
                    }
                    ]}
                />
            </div>
    );
}

// <button onClick={handleLayoutEdit}>Edit Layout</button>