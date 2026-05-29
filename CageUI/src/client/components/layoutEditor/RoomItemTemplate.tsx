/*
 *
 *  * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
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
import { FC, useEffect, useRef, useState } from 'react';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';

interface RoomItemTemplateProps {
    fileName: string,
    className?: string
}

export const RoomItemTemplate: FC<RoomItemTemplateProps> = (props) => {
    const {fileName, className} = props;
    const imgRef = useRef(null);
    const [width, setWidth] = useState<string>('100%');
    const [height, setHeight] = useState<string>('100%');

    // Effect reloads the svg to change the height and width of the wrapper for the requested svg after it is injected.
    // This ensures that it doesn't have a lot of empty space in between the svgs
    useEffect(() => {
        if (!imgRef.current) {
            return;
        }
        // Wait briefly for the nested SVG to render (adjust delay if needed)
        const timer = setTimeout(() => {
            const nestedSvg = imgRef.current?.reactWrapper.children[0].children[0];
            if (!nestedSvg) {
                return;
            }

            // Method 1: Use explicit width/height (if nested SVG has them)
            const tempWidth = nestedSvg.getAttribute('width');
            const tempHeight = nestedSvg.getAttribute('height');

            if (tempWidth && tempHeight) {
                setWidth(tempWidth);
                setHeight(tempHeight);
            }
            // Method 2: Fallback to rendered dimensions
            else {
                const rect = nestedSvg.getBoundingClientRect();
                setWidth(rect.width.toString());
                setHeight(rect.height.toString());
            }
        }, 100); // Short delay to ensure rendering

        return () => clearTimeout(timer);
    }, []); // Empty dependency array = runs once after mount


    return (
        <div id={`${fileName}-template`}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/${fileName}.svg`}
                id={`${fileName}_template_wrapper`}
                wrapper={'svg'}
                ref={imgRef}
                height={height}
                width={width}
                className={className + " util-svg-template-wrapper"}
            />
        </div>
    );
}