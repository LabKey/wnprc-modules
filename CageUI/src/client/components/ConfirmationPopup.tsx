import * as React from 'react';
import {FC} from 'react';
import "../cageui.scss";

interface ConfirmationPopupProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    error?: boolean; // if error is true then show an error msg popup instead
}
export const ConfirmationPopup: FC<ConfirmationPopupProps> = (props) => {
    const { message, onConfirm, onCancel, error } = props
    return (
        <div className="popup-overlay">
            <div className="popup">
                <p dangerouslySetInnerHTML={{__html: message}}/>
                {error &&
                        <div className="popup-buttons">
                            <button onClick={onCancel}>Close</button>
                        </div>
                }
                {!error &&
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