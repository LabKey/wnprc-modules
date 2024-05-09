import * as React from 'react';
import { useState, FC, useRef, useEffect } from 'react';
import { Cage } from './typings';

interface CageDetailsProps {
    isOpen: boolean;
    onClose: () => any;
    cage: Cage;
}
export const CageDetails: FC<CageDetailsProps> = (props) => {
    const { isOpen, onClose, cage } = props;

    const modalRef = useRef(null);
    console.log(cage);

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
        <>
            {isOpen && (
                <div className="details-overlay">
                    <div className="details-content" ref={modalRef}>
                        <div className={'details-header'}>
                            <h1>Cage #{cage.name}</h1>
                            <button className="details-close-button" onClick={onClose}>
                                &times;
                            </button>
                        </div>
                        <div className={"details-subheader"}>
                            <h4>Total: 2</h4>
                            <h4>Status: OK</h4>
                        </div>
                        <div className={"details-divider"} />
                    </div>
                </div>
            )}
        </>
    );
};
