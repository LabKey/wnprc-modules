import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { findAffCages, findDetails, getModOptions } from './helpers';
import { ModificationRow } from './ModificationRow';
import { useCurrentContext } from './ContextManager';
import {ConfirmationPopup} from './ConfirmationPopup';
import { Cage } from './typings';

interface CageDetailsModificationsProps {
    closeDetails: () => void;
}
export const CageDetailsModifications: FC<CageDetailsModificationsProps> = (props) => {
    const {closeDetails} = props;
    const {saveMod, setRoom, clickedRack, clickedCagePartners, setIsEditing, isEditing, modRows, setModRows, cageDetails} = useCurrentContext();
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    useEffect(() => {
        console.log("I Render");
    }, []);
    // Toggles editing mode for cage mods
    const editMode = () => {
        console.log("Add Mod");
        setIsEditing(prevState => !prevState);
    }


    useEffect(() => {
        console.log("Load Details: ", cageDetails);
        cageDetails.forEach((cage) => {
            const newModRows = Object.keys(cage.cageState).map((key, idx) => {
                const modOptions = getModOptions(key);
                if (Array.isArray(cage.cageState[key])) { // finds extra mods
                    return(
                        cage.cageState[key].map((mod, idx) => {
                            if (mod.name === "") return;
                            return(
                                <ModificationRow
                                    key={`extraMod-${cage.id}-${idx}`}
                                    extraModId={cage.cageState[key][idx].modData.id}
                                    modKey={key}
                                    cageId={cage.id}
                                    defaultMod={cage.cageState[key][idx].modData.mod.mod}
                                    modOptions={modOptions}
                                    affectedCage={findAffCages(mod.modData.mod.mod, cage)}
                                />
                            );
                        }));
                } else { // finds separators
                    return(
                        <ModificationRow
                            key={`separator-${cage.id}-${idx}`}
                            cageId={cage.id}
                            modKey={key}
                            defaultMod={cage.cageState[key].modData.mod.mod}
                            modOptions={modOptions}
                            affectedCage={findAffCages(key, cage)}
                        />
                    );
                }
            });
            setModRows(() => [...newModRows]);
        })
    }, [cageDetails]);

    useEffect(() => {
        console.log("MR: ", modRows);
    }, [modRows]);


    return (
        <div className={"details-modifications"}>
            {isPopupOpen && (
                <ConfirmationPopup
                    message="Are you sure you want to save the data?"
                    onConfirm={() => {saveMod();closeDetails();}}
                    onCancel={() => setIsPopupOpen(false)}
                />
            )}
            <div className={'details-mod-header'}>
                <h2>Modifications</h2>
                <button className="details-add-mod" onClick={editMode}>
                    Add/Delete &#43;
                </button>
                <button className="details-add-mod" onClick={() => setIsPopupOpen(true)}>
                    Save
                </button>
            </div>
            <table className={'details-table'}>
                <thead>
                <tr>
                    {isEditing && (<th> </th>)}
                    <th>Location</th>
                    <th>Mod</th>
                    <th>Affected Cages</th>
                </tr>
                </thead>
                <tbody>
                    {modRows.map(row => row)}
                </tbody>
            </table>
        </div>
    );
}