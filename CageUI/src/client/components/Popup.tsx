import * as React from 'react';
import { FC, JSX, useEffect, useRef, useState } from 'react';
import { useRoomContext } from './ContextManager';
import { ConfirmationPopup } from './ConfirmationPopup';

interface PopupProps {
    isOpen: boolean;
    onClose: () => any;
    header: string;
    subheader?: string[];
    mainContent: any;
}
export const Popup: FC<PopupProps> = (props) => {
    const { isOpen, onClose, header, subheader, mainContent } = props;
    const modalRef = useRef(null);
    const { isDirty} = useRoomContext();
    const [showSave, setShowSave] = useState<boolean>(false);
    //if(!clickedCage) return;

    // close modal if user clicks outside its bounds
    useEffect(() => {
        const handleClickOutside = (event) => {
            if(event.target.firstChild?.data === "Save"){
                if (modalRef.current && !modalRef.current.contains(event.target)) {
                    onClose();
                }
            }
            else if(isDirty){
                if(modalRef.current && !modalRef.current.contains(event.target)){
                    setShowSave(true);
                }
            }else{
                if(modalRef.current && !modalRef.current.contains(event.target)){
                    onClose();
                }
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
        <div className={"popup-overlay"} onClick={(e) => e.stopPropagation()}>
            {showSave && (<ConfirmationPopup
                message="You have unsaved data, are you sure you want to exit?"
                onConfirm={onClose}
                onCancel={() => setShowSave(false)}
            />)}
            <div className={"popup-content"} ref={modalRef}>
                <div className={'popup-header'}>
                    <h1>{header}</h1>
                    <button className="popup-close-button" onClick={() => {
                        if (isDirty) {
                            setShowSave(true);
                        } else {
                            onClose()
                        }
                    }}>
                        &times;
                    </button>
                </div>
                <div className={"popup-subheader"}>
                    {subheader?.map((sub, idx) => (<h4 key={idx}>{sub}</h4>))}
                </div>
                <div className={"popup-sub-content"}>
                    <div className={"divider"} />
                    {mainContent}
                </div>
            </div>
        </div>
    );
}