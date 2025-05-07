import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import '../../../cageui.scss';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { CageWithMods, ModLocations, ModTypes } from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';
import { ModificationEditorTable } from './ModificationEditorTable';
import { findNextModId, fixModIds } from '../../../utils/homeHelpers';

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

    const [currCage, setCurrCage] = useState<CageWithMods>(selectedObj as CageWithMods);

    const menuRef = useRef(null);

    useEffect(() => {
        console.log("Current Cage: ", currCage);
    }, [currCage]);

    useEffect(() => {
        if((selectedObj as CageWithMods)?.mods){
            setCurrCage(selectedObj as CageWithMods);
        }
    }, [selectedObj]);

    useEffect(() => {
        // Check if the click was outside the menu
        const handleClickOutside = (event) => {
            // Ignore dropdowns that disappear causing them to no longer be in menuRef
            if(event.target.closest('[class*="indicatorContainer"]')) return;
            if (menuRef.current && !menuRef.current.contains(event.target)){
                console.log("Close Menu", menuRef.current);
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

    const handleModAdd = (location: ModLocations) => {
        setCurrCage((cage) => {
            if(cage.cageNum === cage.cageNum){
                return {
                    ...cage,
                    mods: {
                        ...cage.mods,
                        [location]: [...cage.mods[location], {id: findNextModId(cage.mods[location]), mod: 'newMod'}]
                    }
                };
            }else{
                return cage;
            }
        })
    }

    const handleModDelete = (location: ModLocations, locId: number) => {

        setCurrCage((cage) => {
            let newCage = cage;
            if(newCage.cageNum === newCage.cageNum){
                newCage = {
                    ...newCage,
                    mods: {
                        ...newCage.mods,
                        [location]: newCage.mods[location].filter((mod) => mod.id !== locId)
                    }
                };
            }
            return newCage;
        })
    }

    const handleModChange = (location: ModLocations, locId: number, newMod: ModTypes) => {

        setCurrCage((cage) => {
            let newCage = cage;
            if(newCage.cageNum === newCage.cageNum){
                newCage = {
                    ...newCage,
                    mods: {
                        ...newCage.mods,
                        [location]: newCage.mods[location].map((mod) => {
                            if(mod.id === locId){
                                return {
                                    ...mod,
                                    mod: newMod
                                }
                            }else{
                                return mod;
                            }
                        })
                    }
                };
            }
            return newCage;
        })
    }

    const handleSubmit = () => {

    }

    return (
        (showEditor && currCage) &&
            <div className="modification-editor-popup-overlay" >
                <div className="modification-editor-popup" ref={menuRef}>
                    <div className="modification-editor-popup-header">
                        <h3 className="modification-editor-popup-title">{currCage.cageNum}</h3>
                        <button className="modification-editor-popup-close" onClick={closeMenu}>&times;</button>
                    </div>
                    <div className="modification-editor-popup-content">
                        <CurrentCageLayout
                            cage={currCage}
                        />
                        <ModificationEditorTable
                            onModDelete={handleModDelete}
                            onModChange={handleModChange}
                            onModAdd={handleModAdd}
                            cage={currCage}
                        />
                    </div>
                    <div className="modification-editor-popup-actions">
                        <button className="modification-editor-popup-button modification-editor-popup-cancel" onClick={closeMenu}>Cancel</button>
                        <button className="modification-editor-popup-button modification-editor-popup-save" onClick={handleSubmit}>Save</button>
                    </div>
                </div>
            </div>
    );
};