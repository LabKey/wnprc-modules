import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { Cage, ModTypes } from './typings';
import { CageDetailsModifications } from './CageDetailsModifications';
import { useCurrentContext } from './ContextManager';
import { findDetails } from './helpers';
import { ConfirmationPopup } from './ConfirmationPopup';

interface CageDetailsProps {
    isOpen: boolean;
    onClose: () => any;
}
export const CageDetails: FC<CageDetailsProps> = (props) => {
    const { isOpen, onClose } = props;
    const modalRef = useRef(null);
    const {clickedCage, clickedRack, cageDetails, isDirty} = useCurrentContext();
    const [showSave, setShowSave] = useState<boolean>(false);
    if(!clickedCage) return;

    // close modal if user clicks outside its bounds
    useEffect(() => {
        const handleClickOutside = (event) => {
            if(isDirty){
                setShowSave(true);
            }
            else if (modalRef.current && !modalRef.current.contains(event.target)) {
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

    useEffect(() => {
        console.log("cage details: ", cageDetails)
    }, [cageDetails]);
    return (
        <div className="details-overlay">
            {showSave && (<ConfirmationPopup
                message="You have unsaved data, are you sure you want to exit?"
                onConfirm={onClose}
                onCancel={() => setShowSave(false)}
            />)}
            <div className="details-content" ref={modalRef}>
                <div className={'details-header'}>
                    <h1>Cage {cageDetails.map((cage) => cage.name).join(", ")}</h1>
                    <button className="details-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className={"details-subheader"}>
                    <h4>Total: 2</h4>
                    <h4>Status: OK</h4>
                </div>
                <div className={"details-divider"} />
                <CageDetailsModifications
                    closeDetails={onClose}
                />
            </div>
        </div>
    );
};
