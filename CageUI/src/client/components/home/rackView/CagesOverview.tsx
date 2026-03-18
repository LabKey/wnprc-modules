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
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { getCageNumDisplay, sortCagesByCageNumber } from '../../../utils/homeHelpers';
import { Cage } from '../../../types/typings';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const CagesOverview: FC = () => {
    const {selectedRack} = useHomeNavigationContext();
    const [sortedCages, setSortedCages] = useState<Cage[]>([]);

    useEffect(() => {
        setSortedCages(sortCagesByCageNumber(selectedRack.cages));
    }, [selectedRack]);

    return (
        <div className="cages-overview-container">
            {sortedCages.map((cage, idx) => (
                <div className={"cage-overview-cage"} key={`cage-overview-cage-${idx}`}>
                    <h2 key={`cage-title-${idx}`}>{getCageNumDisplay(cage.cageNum)}</h2>
                    <div>Animal Placeholder</div>
                    <div>Animal Placeholder</div>
                    <div>Animal Placeholder</div>
                </div>
            ))}
        </div>
    )
}