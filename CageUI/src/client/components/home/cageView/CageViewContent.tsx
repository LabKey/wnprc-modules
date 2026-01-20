import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../../context/RoomContextManager';
import { CageDimensions } from '../../../types/typings';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { Filter } from '@labkey/api';
import { parseRoomItemNum, parseRoomItemType } from '../../../utils/helpers';
import { RackModifications } from '../rackView/RackModifications';
import { CurrentRackLayout } from '../rackView/CurrentRackLayout';
import { RackDetails } from '../rackView/RackDetails';
import { SubViewContent } from '../SubViewContent';
import { CageDetails } from './CageDetails';

export const CageViewContent: FC = () => {
    const {selectedPage} = useHomeNavigationContext();
    const {selectedCage, selectedRoom, selectedRack} = useRoomContext();
    const [cageDimensions, setCageDimensions] = useState<CageDimensions>(null);

    useEffect(() => {
        console.log('Cage View: ', selectedCage);
    }, [selectedCage]);

    useEffect(() => {
        if (!selectedCage) {
            return;
        }
        const opts = {
            schemaName: 'cageui',
            queryName: 'cages',
            filterArray: [Filter.create('objectid', selectedCage.objectId, Filter.Types.EQUAL)]
        };

        labkeyActionSelectWithPromise(opts).then(res => {
            if (res.rowCount === 1) {
                const cage = res.rows[0];
                setCageDimensions({
                    length: cage.length,
                    width: cage.width,
                    height: cage.height,
                    sqft: cage.sqft,
                });
            }
        });
    }, [selectedCage]);


    return (
        selectedCage &&
        <div className={'room-view-container'}
             key={'layout-' + selectedRoom + '-rack-' + selectedRack.itemId + '-' + selectedCage.cageNum}>
            <div className={'room-view-title'}>
                <label>
                    {parseRoomItemType(selectedCage.cageNum).charAt(0).toUpperCase() + parseRoomItemType(selectedCage.cageNum).slice(1)} {parseRoomItemNum(selectedCage.cageNum)}
                </label>
            </div>
            <SubViewContent
                    tabs={[{
                        name: 'Details',
                        children: <CageDetails cageDimensions={cageDimensions}/>
                    }
                    ]}
            />
        </div>
    );
}