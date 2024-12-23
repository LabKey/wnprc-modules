import * as React from 'react';
import {FC} from 'react';
import "../cageui.scss";

interface ConfirmationPopupProps {
    message: string;
    onConfirm?: () => void;
    onCancel: () => void;
}
export const ConfirmationPopup: FC<ConfirmationPopupProps> = (props) => {
    const { message, onConfirm, onCancel } = props
    return (
        <div className="popup-overlay">
            <div className="popup">
                <p dangerouslySetInnerHTML={{__html: message}}/>
                {!onConfirm &&
                        <div className="popup-buttons">
                            <button onClick={onCancel}>Close</button>
                        </div>
                }
                {onConfirm &&
                        <div className="popup-buttons">
                            <button onClick={() => {
                                onConfirm();
                                onCancel();
                            }}>Yes
                            </button>
                            <button onClick={onCancel}>No</button>
                        </div>
                }
            </div>
        </div>
    );
}