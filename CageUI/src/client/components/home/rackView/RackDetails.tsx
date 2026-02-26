import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../../cageui.scss';
import { useRoomContext } from '../../../context/RoomContextManager';
import { RackConditions } from '../../../types/typings';
import { StatusSvgIcon } from '../../StatusSvgIcon';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const RackDetails: FC = () => {
    const {selectedRack} = useHomeNavigationContext();

    useEffect(() => {
        console.log(selectedRack);
    }, []);

    return (
        <div className="rack-details-container">
            <div className="rack-details-section">
                <div>
                    <div className="dimension-item">
                        <span className="dimension-label">Condition:</span>
                        <div className="dimension-value-container">
                            <div className="dimension-value-icon">
                                <StatusSvgIcon
                                    status={selectedRack.condition === RackConditions.Operational ? 'valid' : 'invalid'}
                                />
                            </div>
                            <span className="dimension-value-text">{RackConditions[selectedRack.condition]}</span>
                        </div>
                    </div>
                    <div className="dimension-item">
                        <span className="dimension-label">Manufacturer:</span>
                        <div className="dimension-value-container">
                            <span className="dimension-value-text">{selectedRack.type.manufacturer.title}</span>
                        </div>
                    </div>
                    <div className="dimension-item">
                        <span className="dimension-label">Size:</span>
                        <div className="dimension-value-container">
                            <span className="dimension-value-text">{selectedRack.type.size.toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="dimension-item">
                        <span className="dimension-label">Stationary:</span>
                        <div className="dimension-value-container">
                            <span className="dimension-value-text">{selectedRack.type.stationary ? 'True' : 'False'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};