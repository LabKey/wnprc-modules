import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { useRoomContext } from '../../../context/RoomContextManager';
import { CageDimensions, RackTypes } from '../../../types/typings';
import { RackModifications } from '../rackView/RackModifications';
import { CurrentRackLayout } from '../rackView/CurrentRackLayout';
import { RackDetails } from '../rackView/RackDetails';
import { SubViewContent } from '../SubViewContent';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface CageDetailsProps {
    cageDimensions: CageDimensions;
}

export const CageDetails: FC<CageDetailsProps> = (props) => {
    const {selectedRack} = useHomeNavigationContext();
    const {cageDimensions} = props;

    return (
        <div className="cage-display">
            <div className="cage-main-display">
                {cageDimensions && (
                    <div>
                        <div className="dimension-item">
                            <span className="dimension-label">Type:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text">{RackTypes[selectedRack.type.type]}</span>
                            </div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Manufacturer:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text">{selectedRack.type.manufacturer.title}</span>
                            </div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Length:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text">{cageDimensions.length} in</span>
                            </div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Width:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text">{cageDimensions.width} in</span>
                            </div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Height:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text">{cageDimensions.height} in</span>
                            </div>
                        </div>
                        <div className="dimension-item">
                            <span className="dimension-label">Sqft:</span>
                            <div className="dimension-value-container">
                                <span className="dimension-value-text" data-unit={'ft'}>
                                    {Math.round((cageDimensions.sqft) * 100) / 100}
                                    <span className="unit-with-squared"> ft</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};