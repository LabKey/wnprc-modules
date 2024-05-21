import * as React from 'react';
import {FC} from 'react';

interface ConfirmationPopupProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}
export const ConfirmationPopup: FC<ConfirmationPopupProps> = (props) => {
    const { message, onConfirm, onCancel } = props
    return (
        <div className="popup-overlay">
            <div className="popup">
                <p>{message}</p>
                <div className="popup-buttons">
                    <button onClick={() => { onConfirm(); onCancel(); }}>Yes</button>
                    <button onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
}