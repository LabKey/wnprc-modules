import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RoomLayout } from '../roomView/RoomLayout';
import { RoomDetails } from '../roomView/RoomDetails';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';
import { CurrentRackLayout } from './CurrentRackLayout';
import { useRoomContext } from '../../../context/RoomContextManager';
import { useHomeContext } from '../../../context/HomeContextManager';

export const RackViewContent: FC = () => {
    const {selectedRoom} = useRoomContext();

    const {selectedRack} = useHomeContext();

    return (
        selectedRack &&
        <div className={"room-view-container"} key={'layout-' + selectedRoom + '-rack-' + selectedRack}>
            <div className={'room-view-title'}>
                <label>
                    {selectedRack.itemId}
                </label>
            </div>
            <SubViewContent
                    tabs={[{
                        name: 'Modifications',
                        children:
                            <>
                                <RackModifications />
                                <CurrentRackLayout />
                            </>

                    },{
                        name: 'Details',
                        children: <RackDetails />
                    }
                    ]}
            />
        </div>
    );
}