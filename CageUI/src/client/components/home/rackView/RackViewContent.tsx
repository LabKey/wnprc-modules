import * as React from 'react';
import { FC, useState } from 'react';
import '../../../cageui.scss';
import { SubViewContent } from '../SubViewContent';
import { RackDetails } from './RackDetails';
import { CagesOverview } from './CagesOverview';
import { ChangeRackPopup } from './ChangeRackPopup';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const RackViewContent: FC = () => {
    const {selectedRoom, selectedRack} = useHomeNavigationContext();
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