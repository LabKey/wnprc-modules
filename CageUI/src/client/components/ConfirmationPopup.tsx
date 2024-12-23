import * as React from 'react';
import {FC} from 'react';
import "../cageui.scss";

interface ConfirmationPopupProps {
    message: string;
    onConfirm?: () => void; // if confirm exists, give popup confirmation with option to cancel
    onCancel?: () => void; // if cancel exists, run function before closing popup Ex (resetting states)
    onClose: () => void; // function to close popup, usually a boolean state going to false
}
export const ConfirmationPopup: FC<ConfirmationPopupProps> = (props) => {
    const { message, onConfirm, onCancel, onClose } = props
    return (
        <div className="popup-overlay">
            <div className="popup">
                <p dangerouslySetInnerHTML={{__html: message}}/>
                {!onConfirm &&
                        <div className="popup-buttons">
                            <button onClick={onClose}>Close</button>
                        </div>
                }
                {onConfirm &&
                        <div className="popup-buttons">
                            <button onClick={() => {
                                onConfirm();
                                onClose();
                            }}>Yes
                            </button>
                            <button onClick={() => {
                                if(onCancel) {
                                    onCancel();
                                }
                                onClose();
                            }}>No</button>
                        </div>
                }
            </div>
        </div>
    );
}