import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import '../../../cageui.scss';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import {
    CageModification,
    CageModifications,
    CageWithMods,
    ModData,
    ModLocations,
    ModTypes, Rack
} from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';
import { ModificationEditorTable } from './ModificationEditorTable';
import { findNextModId, fixModIds } from '../../../utils/homeHelpers';
import { ConfirmationPopup } from '../../ConfirmationPopup';
import { useHomeContext } from '../../../context/HomeContextManager';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { EHRCageMods } from '../../../types/homeTypes';
import { Filter } from '@labkey/api';
import { parseRoomItemNum } from '../../../utils/helpers';
import { findCageInGroup } from '../../../utils/LayoutEditorHelpers';

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

    const {saveCageMods, selectedRoom} = useHomeContext();

    const [currCage, setCurrCage] = useState<CageWithMods>(selectedObj as CageWithMods);
    const [currRack, setCurrRack] = useState<Rack>(null);
    const [prevCageMods, setPrevCageMods] = useState<ModData[]>(null);
    const [showErrorPopup, setShowErrorPopup] = useState<string>(null);
    const [showSavePopup, setShowSavePopup] = useState<string>(null); // if save is successful


    const menuRef = useRef(null);

    useEffect(() => {
        console.log("Current Cage: ", currCage, selectedObj);
        console.log("Show Menu: ", showEditor);
    }, [currCage, showEditor]);

    useEffect(() => {
        const tempCage = selectedObj as CageWithMods;
        console.log("Selected Menu Obj: ", selectedObj);
        if(tempCage?.mods){
            const cageRack = findCageInGroup(tempCage.cageNum, selectedRoom.rackGroups).rack;
            const config: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'cage_modifications',
                columns: [],
                filterArray: [
                    Filter.create('room', selectedRoom.name, Filter.Types.EQUALS),
                    Filter.create('rack', cageRack.rowid, Filter.Types.EQUALS),
                    Filter.create('cage', parseRoomItemNum(tempCage.cageNum), Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK),
                ]
            }
            labkeyActionSelectWithPromise(config).then((result) => {
                const prevMods: ModData[] = [];
                if(result.rowCount > 0){
                    result.rows.forEach((row) => {
                        console.log("Row: ", row);
                        prevMods.push({
                            locationId: row.locationid,
                            cage: row.cage,
                            endDate: row.endDate,
                            location: row.location,
                            modification: row.modification,
                            rack: row.rack,
                            room: row.room,
                            rowid: row.rowid,
                            startDate: row.startDate,
                            subsectionId: row.subsectionid
                        })
                    })
                    setPrevCageMods(prevMods);
                }
                setCurrCage(tempCage);
                setCurrRack(cageRack);
            });


        }
    }, [selectedObj]);

    useEffect(() => {
        // Check if the click was outside the menu
        const handleClickOutside = (event) => {
            // Ignore dropdowns that disappear causing them to no longer be in menuRef
            if(event.target.closest('[class*="indicatorContainer"]')) return;
            // Ignore popup buttons that are an additional popup but shouldn't close the original popup
            if(event.target.tagName.toLowerCase() === "button") return;
            // if the target is outside the modification editor menu ref close the editor
            if (menuRef.current && !menuRef.current.contains(event.target)){
                setShowErrorPopup(null);
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

    const handleModAdd = (location: ModLocations, subsectionId: number) => {
        console.log("Adding Mod: ", subsectionId)
        setCurrCage((cage) => {
            if(cage.cageNum === currCage.cageNum){
                const newCage = {
                    ...cage,
                    mods: {
                        ...cage.mods,
                        [location]: cage.mods[location].find((subLoc) => subLoc.subId === subsectionId)
                            ? cage.mods[location].map(mods => {
                            // Find subsection and then location in the subsection on where to add the mod
                            if(mods.subId === subsectionId){
                                if(mods.mods.length > 0){
                                    return {
                                        ...mods,
                                        mods: [...mods.mods, {
                                            id: findNextModId(mods.mods),
                                            mod: 'newMod'
                                        }]
                                    }
                                }else{
                                    return {
                                        ...mods,
                                        mods: [{
                                            id: findNextModId(mods.mods),
                                            mod: 'newMod'
                                        }]
                                    }
                                }
                            }else{
                                return mods;
                            }
                        }) : [...cage.mods[location], {
                            subId: subsectionId,
                            mods: [{
                                id: 1,
                                mod: 'newMod'
                            }]
                        }]

                    }
                };
                console.log(newCage);
                return newCage;
            }else{
                return cage;
            }
        })
    }

    const handleModDelete = (location: ModLocations, locId: number, subId: number) => {

        // removes the id and remaps ids so there are no gaps, and it starts at 1
        setCurrCage((cage) => {
            let newCage = cage;
            if(newCage.cageNum === currCage.cageNum){
                newCage = {
                    ...newCage,
                    mods: {
                        ...newCage.mods,
                        [location]: newCage.mods[location].map((subMods)=> {
                            if(subId === subMods.subId){
                                return {
                                    ...subMods,
                                    mods: subMods.mods.filter((mods) => mods.id !== locId)
                                        .sort((a, b) => a.id - b.id)
                                        .map((m, idx) => ({
                                            ...m,
                                            id: idx + 1
                                    }))
                                }
                            }else{
                                return subMods;
                            }
                        })
                    }
                };
            }
            console.log("Delete After: ", newCage)
            return newCage;
        })
    }

    const handleModChange = (location: ModLocations, locId: number, subId: number, newMod: ModTypes) => {

        setCurrCage((cage) => {
            let newCage = cage;
            if(newCage.cageNum === currCage.cageNum){
                newCage = {
                    ...newCage,
                    mods: {
                        ...newCage.mods,
                        [location]: cage.mods[location].map(mods => {
                            console.log("mods: ", mods)
                            if(mods.subId === subId) {
                                return {
                                    ...mods,
                                    mods: mods.mods.map((mod) => {
                                        if(mod.id === locId){
                                            return {
                                                ...mod,
                                                mod: newMod,
                                            }
                                        }else{
                                            return mod;
                                        }
                                    })
                                };
                            }else{
                                return mods;
                            }
                        })
                    }
                };
            }
            return newCage;
        })
    }

    const handleSubmit = async () => {
        let submit: boolean = true;
        Object.entries(currCage.mods).forEach(([key, value]) => {
            console.log("Key: ", ModLocations[key], " value: ", value);
            if(value.length > 0){
                value.forEach((subsection) => {
                    subsection.mods.forEach((mod) => {
                        if(mod.mod === "newMod"){
                            setShowErrorPopup("Please do not submit a new mod without first assigning it to a real mod");
                            submit = false;
                        }
                    })
                })
            }
        })
        // if data is correct then continue with submission
        if(submit){
            const result = await saveCageMods(currCage, prevCageMods);
            if(result.status === "Success"){
                setShowSavePopup("Success");
            }else{
                setShowErrorPopup(result.reason.map((err, index) => `${index + 1}. ${err}`).join("\n"));
            }
        }

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
                            rack={currRack}
                        />
                    </div>
                    <div className="modification-editor-popup-actions">
                        <button className="modification-editor-popup-button modification-editor-popup-cancel" onClick={closeMenu}>Cancel</button>
                        <button className="modification-editor-popup-button modification-editor-popup-save" onClick={handleSubmit}>Save</button>
                    </div>
                </div>
                {showErrorPopup &&
                    <ConfirmationPopup message={showErrorPopup} onClose={() => setShowErrorPopup(null)} />
                }
                {showSavePopup &&
                    <ConfirmationPopup message={showSavePopup} onClose={() => {setShowSavePopup(null); closeMenu();}} />
                }
            </div>
    );
};