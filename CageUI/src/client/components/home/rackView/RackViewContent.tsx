import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import { SubViewContent } from '../SubViewContent';
import { RoomLayout } from '../roomView/RoomLayout';
import { RoomDetails } from '../roomView/RoomDetails';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';
import { CurrentRackLayout } from './CurrentRackLayout';

export const RackViewContent: FC = () => {
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();

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