import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { getModOptions } from './helpers';
import { ModificationRow } from './ModificationRow';
import { useCurrentContext } from './ContextManager';
import {ConfirmationPopup} from './ConfirmationPopup';

interface CageDetailsModificationsProps {
    closeDetails: () => void;
}
export const CageDetailsModifications: FC<CageDetailsModificationsProps> = (props) => {
    const {closeDetails} = props;
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);
    const {clickedCage, setRoom, clickedRack, clickedCagePartner, cageDetails} = useCurrentContext();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const addMod = () => {
        console.log("Add Mod");
    }
    const saveMod = () => {
        console.log("UPDATE: ", clickedCage, clickedCagePartner);
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = clickedRack.id - 1;
            if (updatedRoom[clickedRackIndex]) {
                // Create a deep copy of the cage state object
                updatedRoom[clickedRackIndex].cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;

                updatedRoom[clickedRackIndex].cages.find(
                    (cage) => cage.id === clickedCagePartner.id
                ).cageState = clickedCagePartner.cageState;
            }
            return updatedRoom;
        });
        closeDetails();
    }

    useEffect(() => {
        cageDetails.forEach((cage) => {
            console.log("Cage: ", cage);
            const newModRows = Object.keys(cage.cageState).map((key, idx) => {
                const modOptions = getModOptions(key);
                if (Array.isArray(cage.cageState[key])) { // finds extra mods
                    return(
                        cage.cageState[key].map((mod, idx) => {
                            if (mod.name === "") return;
                            return(
                                <ModificationRow
                                    key={`extraMod-${cage.id}-${idx}`}
                                    modKey={key}
                                    defaultMod={cage.cageState[key][idx].modData.mod}
                                    modOptions={modOptions}
                                    affectedCages={cage.cageState[key][idx].affCage}
                                />
                            );
                        }));
                } else { // finds separators
                    return(
                        <ModificationRow
                            key={`separator-${cage.id}-${idx}`}
                            modKey={key}
                            defaultMod={cage.cageState[key].modData.mod.mod}
                            modOptions={modOptions}
                            affectedCages={cage.cageState[key].affCage}
                        />
                    );
                }
            });
            setModRows((prevState) => [...prevState, ...newModRows]);
        })
    }, []);

    return (
        <div className={"details-modifications"}>
            {isPopupOpen && (
                <ConfirmationPopup
                    message="Are you sure you want to save the data?"
                    onConfirm={saveMod}
                    onCancel={() => setIsPopupOpen(false)}
                />
            )}
            <div className={'details-mod-header'}>
                <h2>Modifications</h2>
                <button className="details-add-mod" onClick={addMod}>
                    Add/Edit &#43;
                </button>
                <button className="details-add-mod" onClick={() => setIsPopupOpen(true)}>
                    Save
                </button>
            </div>
            <table className={'details-table'}>
                <thead>
                <tr>
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