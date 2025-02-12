import * as React from 'react';
import { FC, ReactNode, useState } from 'react';

interface LayoutTooltipProps {
    text: string;
    children: ReactNode;
}

export const LayoutTooltip: FC<LayoutTooltipProps> = ({ text, children }) => {
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