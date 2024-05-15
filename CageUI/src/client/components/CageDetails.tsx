import * as React from 'react';
import { useState, FC, useRef, useEffect } from 'react';
import { Cage } from './typings';
import { CageDetailsModifications } from './CageDetailsModifications';
import { useCurrentContext } from './ContextManager';

interface CageDetailsProps {
    isOpen: boolean;
    onClose: () => any;
}
export const CageDetails: FC<CageDetailsProps> = (props) => {
    const { isOpen, onClose } = props;
    const modalRef = useRef(null);
    const {clickedCage} = useCurrentContext();
    if(!clickedCage) return;

    // close modal if user clicks outside its bounds
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div className="details-overlay">
            <div className="details-content" ref={modalRef}>
                <div className={'details-header'}>
                    <h1>Cage #{clickedCage.name}</h1>
                    <button className="details-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className={"details-subheader"}>
                    <h4>Total: 2</h4>
                    <h4>Status: OK</h4>
                </div>
                <div className={"details-divider"} />
                <CageDetailsModifications />
            </div>
        </div>
    );
};
