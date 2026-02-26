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
import { formatCageNum } from '../../../utils/helpers';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface CagePopupProps {
    showEditor: boolean;
    selectedObj: SelectedObj;
    closeMenu: () => void;
}

export const CagePopup: FC<CagePopupProps> = (props) => {
    const {
        showEditor,
        closeMenu,
        selectedObj,
    } = props;
    const {saveCageMods} = useRoomContext();
    const {selectedRoom} = useHomeNavigationContext();

    const [currCage, setCurrCage] = useState<Cage>(null);
    const [currRack, setCurrRack] = useState<Rack>(null);
    const [currCageMods, setCurrCageMods] = useState<CurrCageMods>(null);
    const [showError, setShowError] = useState<string>(null);

    const menuRef = useRef(null);

    useEffect(() => {
        const tempCage = selectedObj as Cage;
        if (tempCage) {
            const cageRack = findCageInGroup(tempCage.svgId, selectedRoom.rackGroups).rack;
            setCurrCage(tempCage);
            setCurrRack(cageRack);
        }
    }, [selectedObj]);


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
        const result = saveCageMods(currCage, currCageMods);
        console.log('Submit result: ', result);

        if (result) {
            if (result.status === 'Success') {
                handleCleanup();
            } else {
                setShowError(result.reason.map((err, index) => `${index + 1}. ${err}`).join('\n'));
            }
        }
    };

    return (
        showEditor &&
        <div className="cage-popup-overlay">
            <div className={"cage-popup"} ref={menuRef}>
                <div className="cage-popup-header">
                    <h1 className="cage-popup-title">{formatCageNum(currCage.cageNum)}</h1>
                    <button className="cage-popup-close" onClick={handleCleanup}>&times;</button>
                </div>
                <ModificationEditor
                    currCage={currCage}
                    currRack={currRack}
                    updateCageMods={(mods: CurrCageMods) => setCurrCageMods(mods)}
                />
                <AnimalEditor
                />
                <div className="cage-popup-content" style={{alignItems: 'flex-end'}}>
                    <div className="cage-popup-error">
                        {showError}
                    </div>
                    <div className="cage-popup-actions">
                        <Button className="cage-popup-button cage-popup-cancel"
                                onClick={handleCleanup}>Cancel</Button>
                        <Button className="cage-popup-button cage-popup-save"
                                onClick={handleSaveMods}>Save Mods</Button>
                    </div>
                </div>
            </div>
        </div>
    );


}