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
import { ActionURL } from '@labkey/api';
//import { changeStyleProperty, getRackSeparators, parseSeparator } from './helpers';
import { ReactSVG } from 'react-svg';

export const RoomLegend: FC<any> = () => {
    const [showLegend, setShowLegend] = useState<boolean>(true);

    const [legendStyle, setLegendStyle] = useState('room-legend-open');
    useEffect(() => {
        if (showLegend) {
            setLegendStyle('room-legend-open');
        } else {
            setLegendStyle('room-legend-close');
        }
    }, [showLegend]);


    return (
        <div className={"room-legend"}>
            <h2 className={"legend-header"}>Legend</h2>
            {showLegend && (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/legend.svg`}
                    wrapper={'div'}
                    className={'legend-svg'}
                />
            )}
        </div>
    );
};