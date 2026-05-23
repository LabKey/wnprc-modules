/*
 *
 *  * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC } from 'react';
import '../cageui.scss';

interface ConfirmationPopupProps {
    message: string;
    onConfirm?: () => void; // if confirm exists, give popup confirmation with option to cancel
    onCancel?: () => void; // if cancel exists, run function before closing popup Ex (resetting states)
    onClose: () => void; // function to close popup, usually a boolean state going to false
}

export const ConfirmationPopup: FC<ConfirmationPopupProps> = (props) => {
    const {message, onConfirm, onCancel, onClose} = props;
    return (
        <div className="popup-overlay">
            <div className="popup">
                <p className={'popup-paragraph'} dangerouslySetInnerHTML={{__html: message.replace(/\n/g, '<br />')}}/>
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
                                if (onCancel) {
                                    onCancel();
                                }
                                onClose();
                            }}>No
                            </button>
                        </div>
                }
            </div>
        </div>
    );
};