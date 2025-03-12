import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import { SubViewContent } from '../SubViewContent';
import { RoomLayout } from '../roomView/RoomLayout';
import { RoomDetails } from '../roomView/RoomDetails';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';

export const RackViewContent: FC = () => {
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();

    useEffect(() => {
        console.log("Page: ", selectedPage);
        console.log("Room: ", selectedRoom);
        console.log("Rack: ", selectedRack);
    }, [selectedPage, selectedRack]);

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
                        name: 'Rack Modifications',
                        children:
                            <RackModifications />
                    },{
                        name: 'Details',
                        children: <RackDetails />
                    }
                    ]}
            />
        </div>
    );
}