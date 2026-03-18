/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { RackConditions } from '../../../types/typings';
import { StatusSvgIcon } from '../../StatusSvgIcon';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const RackDetails: FC = () => {
    const {selectedRack} = useHomeNavigationContext();

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