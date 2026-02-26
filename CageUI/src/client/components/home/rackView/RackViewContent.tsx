import * as React from 'react';
import { FC, useState } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RackModifications } from './RackModifications';
import { RackDetails } from './RackDetails';
import { CurrentRackLayout } from './CurrentRackLayout';
import { useRoomContext } from '../../../context/RoomContextManager';
import { CagesOverview } from './CagesOverview';
import { ChangeRackPopup } from './ChangeRackPopup';

export const RackViewContent: FC = () => {
    const {selectedRoom, selectedRack} = useRoomContext();
    const [showChangeRackPopup, setShowChangeRackPopup] = useState(false);

    const handleRackChange = () => {
        setShowChangeRackPopup(true);
    }

    return (
        selectedRack &&
        <div className={'room-view-container'} id={"rack-view-container"} key={'layout-' + selectedRoom + '-rack-' + selectedRack}>
            <div className={'room-view-title'}>
                <span>
                    Rack {selectedRack.itemId}
                </span>
                <button type={'button'} className={'layout-toolbar-btn'} onClick={handleRackChange}>
                    Change Rack
                </button>
            </div>
            <SubViewContent
                tabs={[{
                    name: 'Details',
                    children: <RackDetails/>
                },{
                    name: 'Cages Overview',
                    children: <CagesOverview/>
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
            {showChangeRackPopup &&
                <ChangeRackPopup
                    showChangeRackPopup={setShowChangeRackPopup}
                />
            }
        </div>
    );
};