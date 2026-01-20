import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import '../../../cageui.scss';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { Cage, CurrCageMods, ModLocations, Rack } from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';
import { ConfirmationPopup } from '../../ConfirmationPopup';
import { findCageInGroup } from '../../../utils/LayoutEditorHelpers';
import { RackModifications } from '../rackView/RackModifications';
import { CageModifications } from './CageModifications';
import { useRoomContext } from '../../../context/RoomContextManager';
import { Button } from 'react-bootstrap';

interface ModificationEditorProps {
    showEditor: boolean;
    selectedObj: SelectedObj;
    closeMenu: () => void;
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const ModificationEditor: FC<ModificationEditorProps> = (props) => {
    const {
        showEditor,
        closeMenu,
        selectedObj,
    } = props;

    const {selectedRoom, saveCageMods} = useRoomContext();

    const [currCage, setCurrCage] = useState<Cage>(null);
    const [currRack, setCurrRack] = useState<Rack>(null);
    const [currCageMods, setCurrCageMods] = useState<CurrCageMods>({
        adjCages: {
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Direct]: []
        }, currCage: []
    });
    const [showError, setShowError] = useState<string>(null);

    const menuRef = useRef(null);

    useEffect(() => {
        console.log('currCageMods: ', currCageMods);
    }, [currCageMods]);

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
                handleCleanup();
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
        setShowError(null);
        setCurrCage(null);
        setCurrRack(null);
        setCurrCageMods({
            currCage: [], adjCages: {
                [ModLocations.Left]: [],
                [ModLocations.Right]: [],
                [ModLocations.Top]: [],
                [ModLocations.Bottom]: [],
                [ModLocations.Direct]: []
            }
        });
        closeMenu();
    };

    // This submission updates the room mods with the current selections.
    const handleSubmit = () => {
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
        (showEditor && currCage) &&
        <div className="modification-editor-popup-overlay">
            <div className="modification-editor-popup" ref={menuRef}>
                <div className="modification-editor-popup-header">
                    <h3 className="modification-editor-popup-title">{currCage.cageNum}</h3>
                    <button className="modification-editor-popup-close" onClick={handleCleanup}>&times;</button>
                </div>
                <div className="modification-editor-popup-content">
                    <CurrentCageLayout
                            cage={currCage}
                    />
                    <CageModifications
                            cage={currCage}
                            rack={currRack}
                            currCageMods={currCageMods}
                            setCurrCageMods={setCurrCageMods}
                    />
                </div>
                <div className="modification-editor-popup-content" style={{alignItems: 'flex-end'}}>
                    <div className="modification-editor-popup-error">
                        {showError}
                    </div>
                    <div className="modification-editor-popup-actions">
                        <Button className="modification-editor-popup-button modification-editor-popup-cancel"
                                onClick={handleCleanup}>Cancel</Button>
                        <Button className="modification-editor-popup-button modification-editor-popup-save"
                                onClick={handleSubmit}>Save</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};