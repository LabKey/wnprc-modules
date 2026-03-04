import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { CageDimensions } from '../../../types/typings';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { Filter } from '@labkey/api';
import { SubViewContent } from '../SubViewContent';
import { CageDetails } from './CageDetails';
import { getCageNumDisplay } from '../../../utils/homeHelpers';

export const CageViewContent: FC = () => {
    const {selectedCage, selectedRoom, selectedRack} = useHomeNavigationContext();
    const [cageDimensions, setCageDimensions] = useState<CageDimensions>(null);

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
                <span>
                    {getCageNumDisplay(selectedCage.cageNum)}
                </span>
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