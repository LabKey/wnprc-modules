import * as React from 'react';
import { FC, useState } from 'react';

export const LayoutTooltip: FC<any> = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={"layout-tooltip-container"}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={"layout-tooltip"}>
                    {text}
                </div>
            )}
        </div>
    );
};