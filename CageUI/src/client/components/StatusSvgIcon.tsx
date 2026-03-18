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
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';

interface StatusSvgIconProps {
    status: 'valid' | 'invalid' | 'warning';
}

export const StatusSvgIcon: FC<StatusSvgIconProps> = (props) => {
    const { status } = props;

    switch (status) {
        case 'valid':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/validStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        case 'invalid':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/invalidStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        case 'warning':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/warningStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        default:
            return null;
    }
};
