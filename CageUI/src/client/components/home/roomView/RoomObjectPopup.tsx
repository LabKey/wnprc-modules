/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import { FC, useEffect, useRef, useState } from 'react';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { formatRoomObj, isRoomModifier } from '../../../utils/helpers';
import { RoomObject, RoomObjectTypes } from '../../../types/typings';
import { Button } from 'react-bootstrap';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { GateEditor } from './GateEditor';
import { useRoomContext } from '../../../context/RoomContextManager';

interface CagePopupProps {
    selectedObj: SelectedObj;
    closeMenu: () => void;
}

export const RoomObjectPopup: FC<CagePopupProps> = (props) => {
    const {
        closeMenu,
        selectedObj,
    } = props;

    const {userProfile} = useHomeNavigationContext();
    const {saveRoomObj} = useRoomContext();

    const [roomObj, setRoomObj] = useState<RoomObject>(selectedObj as RoomObject);
    const [prevRoomObjId, setPrevRoomObjId] = useState<string>((selectedObj as RoomObject).itemId);
    const menuRef = useRef(null);

    useEffect(() => {
        // Check if the click was outside the menu
        const handleClickOutside = (event) => {
            // Ignore dropdowns that disappear causing them to no longer be in menuRef
            if (event.target.closest('[class*="indicatorContainer"]')) {
                return;
            }
            // Ignore popup buttons that are an additional popup but shouldn't close the original popup
            if (event.target.tagName.toLowerCase() === 'button') {
                return;
            }
            // if the target is outside the modification editor menu ref close the editor
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        // Add event listener to detect clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);


    const handleCleanup = () => {
        closeMenu();
    };

    // This submission updates the room mods with the current selections.
    const handleSave = () => {
        saveRoomObj(prevRoomObjId, roomObj);
        handleCleanup();
    };

    return (
        <div className="room-display-popup-overlay">
            <div className={"room-display-popup"} ref={menuRef}>
                <div className="room-display-popup-header">
                    <h1 className="room-display-popup-title">{formatRoomObj(roomObj.itemId)}</h1>
                    <button className="room-display-popup-close" onClick={handleCleanup}>&times;</button>
                </div>
                {(roomObj.type === RoomObjectTypes.GateOpen || roomObj.type === RoomObjectTypes.GateClosed) &&
                    <GateEditor
                            roomObj={roomObj}
                            setRoomObj={setRoomObj}
                    />
                }
                <div className="room-display-popup-content" style={{alignItems: 'flex-end'}}>
                    <div className="room-display-popup-error">
                    </div>
                    <div className="room-display-popup-actions">
                        <Button className="room-display-popup-button room-display-popup-cancel"
                                onClick={handleCleanup}>Cancel</Button>
                        {isRoomModifier(userProfile) &&
                                <Button
                                        className="room-display-popup-button room-display-popup-save"
                                        onClick={handleSave}
                                >
                                    Save
                                </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}