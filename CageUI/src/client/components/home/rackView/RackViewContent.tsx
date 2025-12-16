import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';
import { CurrentRackLayout } from './CurrentRackLayout';
import { useRoomContext } from '../../../context/RoomContextManager';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const RackViewContent: FC = () => {
    const {selectedRoom} = useRoomContext();

    const {selectedRack} = useHomeNavigationContext();

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