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
import { createPortal } from 'react-dom';

interface LoadingScreenProps {
    isVisible: boolean;
    targetElement?: HTMLElement | null;
}

export const LoadingScreen: FC<LoadingScreenProps> = (props) => {
    const {isVisible, targetElement} = props;

    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (targetElement) {
            setContainer(targetElement);
        }
    }, [targetElement]);

    if (!isVisible || !container) {
        return null;
    }

    return createPortal(
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="spinner"></div>
                <p className="loading-message">Saving...</p>
            </div>
        </div>,
        container
    );
};