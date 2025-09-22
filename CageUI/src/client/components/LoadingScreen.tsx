import * as React from 'react';
import {FC, useEffect, useState} from "react";
import {createPortal} from 'react-dom';

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

    if (!isVisible || !container) return null;

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