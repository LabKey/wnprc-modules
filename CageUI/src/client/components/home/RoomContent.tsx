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
import '../../cageui.scss';
import { RoomViewContent } from './roomView/RoomViewContent';
import { CageViewContent } from './cageView/CageViewContent';
import { RackViewContent } from './rackView/RackViewContent';
import { HomeViewContent } from './HomeViewContent';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { LoadingScreen } from '../LoadingScreen';

export const RoomContent: FC = () => {
    const {selectedPage, isNavLoading} = useHomeNavigationContext();

    const renderContent = () => {
        switch (selectedPage?.selected) {
            case 'Room':
                return <RoomViewContent/>;
            case 'Rack':
                return <RackViewContent/>;
            case 'Cage':
                return <CageViewContent/>;
            default:
                return <HomeViewContent/>;
        }
    };

    return (
        <div className={'view-content'}>
            <LoadingScreen
                isVisible={isNavLoading}
                targetElement={document.getElementById('home-container-id')}
                message={"Loading..."}
            />
            {!isNavLoading && renderContent()}
        </div>
    );
};