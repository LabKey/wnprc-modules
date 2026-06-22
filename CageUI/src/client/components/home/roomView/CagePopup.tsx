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
import { Cage, CurrCageMods, ModDirections, ModLocations, ModStyle, ModTypes, Rack } from '../../../types/typings';
import { findCageInGroup } from '../../../utils/LayoutEditorHelpers';
import { useRoomContext } from '../../../context/RoomContextManager';
import { Button } from 'react-bootstrap';
import { AnimalEditor } from './AnimalEditor';
import { formatCageNum, generateUUID, isCageModifier } from '../../../utils/helpers';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { ConnectedCage, ConnectedRack } from '../../../types/homeTypes';
import { cageModLookup } from '../../../api/popularQueries';

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
        validateAndApplyDefaults(currCageMods).then((res) => {
            const result = saveCageMods(prevCage, res);

            if (result) {
                if (result.status === 'Success') {
                    handleCleanup();
                } else {
                    setShowError(result.reason.map((err, index) => `${index + 1}. ${err}`).join('\n'));
                }
            }
        });
    };

    // Function ensures that default mods are chosen if the user fails to pick any mods and the selection component is empty when saving.
    const validateAndApplyDefaults = async (mods: CurrCageMods): Promise<CurrCageMods> => {
        const cageModData = await cageModLookup([],[]);
        const fillDefaultMods = (direction: ModDirections, connections: ConnectedRack[] | ConnectedCage[]) => {
            // Define your default values here
            const defaultHorizontalMod = cageModData.find((mod) => mod.value === ModTypes.SolidDivider);
            const defaultVerticalMod = cageModData.find((mod) => mod.value === ModTypes.StandardFloor);
            const defaultModValue = direction === ModDirections.Vertical ? defaultVerticalMod : defaultHorizontalMod;


            const newConnections = connections.map((connection: ConnectedRack | ConnectedCage) => {
                const containsAdjDivider = connection.adjMods.find(mod => mod.type === ModStyle.Separator);
                const containsCurrDivider = connection.currMods.find(mod => mod.type === ModStyle.Separator);
                if(!(containsAdjDivider || containsCurrDivider)){
                    const modId = generateUUID();
                    return {
                        ...connection,
                        adjMods: [...connection.adjMods, {
                            ...defaultModValue,
                            modId: generateUUID(),
                            parentModId: modId
                        }],
                        currMods: [...connection.currMods, {
                            ...defaultModValue,
                            modId: modId,
                        }]
                    }
                }else{
                    return connection;
                }
            });
            return newConnections;
        }

        // Apply defaults to empty directions
        let modifiedMods = {
            ...mods,
            adjCages: {
                ...mods.adjCages,
                [ModLocations.Left]: fillDefaultMods(ModDirections.Horizontal, mods.adjCages[ModLocations.Left]),
                [ModLocations.Right]: fillDefaultMods(ModDirections.Horizontal, mods.adjCages[ModLocations.Right]),
                [ModLocations.Top]: fillDefaultMods(ModDirections.Vertical, mods.adjCages[ModLocations.Top]),
                [ModLocations.Bottom]: fillDefaultMods(ModDirections.Vertical, mods.adjCages[ModLocations.Bottom]),
            },
        };

        return modifiedMods;
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