import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { findAffCages, getModOptions } from './helpers';
import { ModificationRow } from './ModificationRow';
import { useCurrentContext } from './ContextManager';
import { ConfirmationPopup } from './ConfirmationPopup';

interface CageDetailsModificationsProps {
    closeDetails: () => void;
}
export const CageDetailsModifications: FC<CageDetailsModificationsProps> = (props) => {
    const {closeDetails} = props;
    const {saveMod, modRows, setModRows, cageDetails} = useCurrentContext();
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    useEffect(() => {
        const newModRows = [];
        cageDetails.forEach((cage) => {
            const tempModRows = Object.keys(cage.cageState).map((key, idx) => {
                const modOptions = getModOptions(key);
                return(
                    <ModificationRow
                        key={key !== "extraMod" ? `separator-${cage.id}-${idx}` : `extraMod-${cage.id}-${idx}`}
                        cageId={cage.id}
                        modKey={key}
                        defaultMod={cage.cageState[key].modData.mod.mod}
                        modOptions={modOptions}
                        affectedCage={findAffCages(key, cage)}
                    />
                );
            });
            newModRows.push(...tempModRows);
        });
        setModRows(() => [...newModRows]);

    }, [cageDetails]);

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