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
import '../../../cageui.scss';
import { ModificationEditor } from './ModificationEditor';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { Cage, CurrCageMods, Rack } from '../../../types/typings';
import { findCageInGroup } from '../../../utils/LayoutEditorHelpers';
import { useRoomContext } from '../../../context/RoomContextManager';
import { Button } from 'react-bootstrap';
import { AnimalEditor } from './AnimalEditor';
import { formatCageNum, isCageModifier } from '../../../utils/helpers';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface CagePopupProps {
    selectedObj: SelectedObj;
    closeMenu: () => void;
}

export const CagePopup: FC<CagePopupProps> = (props) => {
    const {
        closeMenu,
        selectedObj,
    } = props;
    const {saveCageMods} = useRoomContext();
    const {selectedLocalRoom, userProfile} = useHomeNavigationContext();

    const [prevCage, setPrevCage] = useState<Cage>(null);
    const [currCage, setCurrCage] = useState<Cage>(null);
    const [currRack, setCurrRack] = useState<Rack>(null);
    const [currCageMods, setCurrCageMods] = useState<CurrCageMods>(null);
    const [showError, setShowError] = useState<string>(null);

    const menuRef = useRef(null);

    useEffect(() => {
        const tempCage = selectedObj as Cage;
        if (tempCage) {
            const cageRack = findCageInGroup(tempCage.svgId, selectedLocalRoom.rackGroups).rack;
            setPrevCage(tempCage);
            setCurrRack(cageRack);
        }
    }, [selectedObj]);

    useEffect(() => {
        setCurrCage(prevCage);
    }, [prevCage]);

    /*useEffect(() => {
        if(currCage && currCageMods){
            const newMods = buildUpdatedCageAndRoomMods(selectedLocalRoom, currCage, currCageMods);
            console.log("newMods: ", newMods);
            setCurrCage({...currCage, mods:  newMods.cageModsByCage[currCage.objectId]});
        }
    }, [currCageMods]);*/


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
        setCurrCage(null);
        setCurrRack(null);
        closeMenu();
    };

    // This submission updates the room mods with the current selections.
    const handleSaveMods = () => {
        const result = saveCageMods(prevCage, currCageMods);

        if (result) {
            if (result.status === 'Success') {
                handleCleanup();
            } else {
                setShowError(result.reason.map((err, index) => `${index + 1}. ${err}`).join('\n'));
            }
        }
    };

    return (
        currCage &&
        <div className="room-display-popup-overlay">
            <div className={"room-display-popup"} ref={menuRef}>
                <div className="room-display-popup-header">
                    <h1 className="room-display-popup-title">{formatCageNum(currCage.cageNum)}</h1>
                    <button className="room-display-popup-close" onClick={handleCleanup}>&times;</button>
                </div>
                <ModificationEditor
                    currCage={currCage}
                    currRack={currRack}
                    updateCageMods={(mods: CurrCageMods) => setCurrCageMods(mods)}
                />
                <AnimalEditor
                />
                <div className="room-display-popup-content" style={{alignItems: 'flex-end'}}>
                    <div className="room-display-popup-error">
                        {showError}
                    </div>
                    <div className="room-display-popup-actions">
                        <Button className="room-display-popup-button room-display-popup-cancel"
                                onClick={handleCleanup}>Cancel</Button>
                        {isCageModifier(userProfile) &&
                            <Button
                                className="room-display-popup-button room-display-popup-save"
                                onClick={handleSaveMods}
                            >
                                Save Mods
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );


}