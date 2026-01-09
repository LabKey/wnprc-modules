import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../../context/RoomContextManager';
import { CageDimensions, ModLocations, RackTypes } from '../../../types/typings';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { Filter } from '@labkey/api';
import { parseRoomItemNum } from '../../../utils/helpers';
import { RackModifications } from '../rackView/RackModifications';
import { CurrentRackLayout } from '../rackView/CurrentRackLayout';
import { RackDetails } from '../rackView/RackDetails';
import { SubViewContent } from '../SubViewContent';

interface CageDetailsProps {
    cageDimensions: CageDimensions;
}

export const CageDetails: FC<CageDetailsProps> = (props) => {
    const {selectedRack} = useRoomContext();
    const {cageDimensions} = props;

    return (
        <div className="cage-display">
            <div className="cage-main-display">
                {cageDimensions && (
                    <div>
                        <div className="dimension-item">
                            <span className="dimension-label">Type:</span>
                            <div className="dimension-value">{RackTypes[selectedRack.type.type]}</div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Manufacturer:</span>
                            <div className="dimension-value">{selectedRack.type.manufacturer}</div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Length:</span>
                            <div className="dimension-value">{cageDimensions.length} in</div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Width:</span>
                            <div className="dimension-value">{cageDimensions.width} in</div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Height:</span>
                            <div className="dimension-value">{cageDimensions.height} in</div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Sqft:</span>
                            <div className="dimension-value" data-unit={"ft"}>
                                {Math.round((cageDimensions.sqft) * 100) / 100}
                                <span className="unit-with-squared"> ft</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}