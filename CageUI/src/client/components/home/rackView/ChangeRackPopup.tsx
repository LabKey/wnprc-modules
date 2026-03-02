import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import { Rack, RackChangeOption, RackChangeValue, RackConditions } from '../../../types/typings';
import { useRoomContext } from '../../../context/RoomContextManager';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { Filter } from '@labkey/api';
import { RackSwitchOption } from '../../../types/homeTypes';
import { LayoutErrors } from '../../LayoutErrors';
import { LoadingScreen } from '../../LoadingScreen';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface ChangeRackPopupProps {
    showChangeRackPopup: React.Dispatch<React.SetStateAction<boolean>>;

}

export const ChangeRackPopup: FC<ChangeRackPopupProps> = (props) => {
    const {showChangeRackPopup} = props;
    const {submitRackChange} = useRoomContext();
    const {selectedRack, selectedRoom, navigateTo} = useHomeNavigationContext();
    const [rackOptions, setRackOptions] = useState<RackSwitchOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedOption, setSelectedOption] = useState<RackSwitchOption>({
        value: {
            objectId: selectedRack.objectId,
            rackId: selectedRack.itemId,
            typeRowId: selectedRack.type.rowid,
        },
        label: `${selectedRack.itemId} - ${selectedRack.type.displayName}`
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const popupRef = useRef(null);
    const [showLayoutErrors, setShowLayoutErrors] = useState<string[]>([]);

    useEffect(() => {
        const racksConfig: SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'racks',
            columns: ['room','objectid', 'rack_type/displayName', 'rackid', 'rack_type/stationary', 'rack_type/rowid', 'condition'],
            filterArray: [
                Filter.create('rack_type/stationary', false, Filter.Types.EQUAL),
                Filter.create('condition', RackConditions.Operational, Filter.Types.EQUAL),
                Filter.create('room', null, Filter.Types.ISBLANK),
            ]
        };
        labkeyActionSelectWithPromise(racksConfig).then((racksResult) => {
            if (racksResult.rowCount > 0) {
                const options = racksResult.rows.reduce((acc, row) => {
                    acc.push({
                        value: {
                            objectId: row.objectid,
                            rackId: row.rackid,
                            typeRowId: row['rack_type/rowid'],
                        },
                        label: `${row.rackid} - ${row['rack_type/displayName']}`
                    });
                    return acc;
                }, [] as RackSwitchOption[]);
                setRackOptions(options);
            }
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (popupRef.current && !popupRef.current.contains(event.target) && !isSaving) {
                showChangeRackPopup(false);
            }
        };

        // Add event listener to detect clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef]);

    const handleRackChange = (rackOption: RackSwitchOption) => {
        setSelectedOption(rackOption);
    }

    const handleSave = async () => {
        // First time it saves confirm, second time start save api call
        if(!showConfirmation){
            setShowConfirmation(true);
        }else{
            setShowConfirmation(false);
            setIsSaving(true);
            const res = await submitRackChange(selectedOption, selectedRack);

            if (res.success) {
                // succssesful save
                setIsSaving(false);
                showChangeRackPopup(false);
                navigateTo({selected: 'Room', room: selectedRoom.name});
            } else {
                setIsSaving(false);
                if (res?.reason) {
                    setShowLayoutErrors(res.reason);
                } else {
                    setShowLayoutErrors(['Unknown error occurred. Please try again or submit a ticket.']);
                }
            }
        }
    }

    return (
        <div className="popup-overlay">
            {isSaving &&
                <LoadingScreen
                    isVisible={isSaving}
                    targetElement={document.getElementById('rack-view-container')}
                />
            }
            <div className="popup" ref={popupRef}>
                <div className={'popup-row'}>
                    {!showConfirmation && showLayoutErrors.length === 0 &&
                        <div className="context-menu-input menu-item">
                            <label>Racks</label>
                            <Select
                                options={rackOptions}
                                defaultValue={selectedOption}
                                className={'select-menu'}
                                classNamePrefix={'select'}
                                onChange={handleRackChange}
                            />
                        </div>
                    }
                    {showConfirmation &&
                    <div className="context-menu-input menu-item">
                        Are you sure you want to change this rack to <span style={{fontWeight: 'bold'}}>{selectedOption.label}</span> ?
                    </div>}
                    {showLayoutErrors && showLayoutErrors.length > 0 &&
                        <LayoutErrors
                                errors={showLayoutErrors}
                        />
                    }
                </div>

                <div className={'popup-row menu-item-group'}>
                    {showLayoutErrors.length === 0 &&
                        <Button
                            variant={'secondary'}
                            onClick={() => {
                                handleSave();
                            }}
                        >
                            {!showConfirmation ? 'Save' : 'Yes'}
                        </Button>
                    }
                    <Button
                        variant={'secondary'}
                        onClick={() => showChangeRackPopup(false)}
                    >
                        {!showConfirmation ? 'Close' : 'No'}
                    </Button>
                </div>
            </div>
        </div>
    );
}