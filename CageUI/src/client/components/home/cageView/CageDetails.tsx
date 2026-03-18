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
import { CageDimensions, RackTypes } from '../../../types/typings';
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