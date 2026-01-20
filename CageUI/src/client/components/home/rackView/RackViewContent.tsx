import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';
import { CurrentRackLayout } from './CurrentRackLayout';
import { useRoomContext } from '../../../context/RoomContextManager';

export const RackViewContent: FC = () => {
    const {selectedRoom, selectedRack} = useRoomContext();

    return (
        selectedRack &&
        <div className={'room-view-container'} key={'layout-' + selectedRoom + '-rack-' + selectedRack}>
            <div className={'room-view-title'}>
                <label>
                    Rack {selectedRack.itemId}
                </label>
            </div>
            <SubViewContent
                    tabs={[{
                        name: 'Details',
                        children: <RackDetails/>
                    }, {
                        name: 'Modifications',
                        children:
                            <>
                                <RackModifications/>
                                <CurrentRackLayout/>
                            </>

                    }
                    ]}
            />
        </div>
    );
};