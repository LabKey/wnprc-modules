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
import { FC, useState } from 'react';
import '../../cageui.scss';

interface SubViewContentProps {
    tabs?: {
        name: string;
        children?: React.ReactNode;
    }[];
}

export const SubViewContent: FC<SubViewContentProps> = (props) => {
    const [activeTab, setActiveTab] = useState(0); // State to track the active tab
    const {tabs} = props;

    // Each subview for room/rack/cage should have a details page
    return (
        <div className="page-tab-container">
            <div className="tab-buttons">
                {tabs.map((view, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={index === activeTab ? 'active' : ''}
                    >
                        {view.name}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab].children}
            </div>
        </div>
    );
};