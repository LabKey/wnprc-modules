import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { Cage } from './typings';
import { getModOptions } from './helpers';
import { ModificationRow } from './ModificationRow';
import { useCurrentContext } from './ContextManager';

export const CageDetailsModifications: FC = () => {
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);
    const {clickedCage, room} = useCurrentContext();
    const addMod = () => {
        console.log("Add Mod");
    }

    useEffect(() => {
        const newModRows = Object.keys(clickedCage.cageState).map((key, idx) => {
            const modOptions = getModOptions(key);
            if (Array.isArray(clickedCage.cageState[key])) { // finds extra mods
                return(
                    clickedCage.cageState[key].map((mod, idx) => {
                        if (mod.name === "") return;
                        return(
                            <ModificationRow
                                key={`extraMod-${idx}`}
                                modKey={key}
                                defaultMod={clickedCage.cageState[key][idx].modData.mod}
                                modOptions={modOptions}
                                affectedCages={clickedCage.cageState[key][idx].affCage}
                            />
                        );
                    }));
            } else { // finds separators
                return(
                    <ModificationRow
                        key={`separator-${idx}`}
                        modKey={key}
                        defaultMod={clickedCage.cageState[key].modData.mod}
                        modOptions={modOptions}
                        affectedCages={clickedCage.cageState[key].affCage}
                    />
                );
            }
        });
        setModRows((prevState) => [...prevState, ...newModRows]);
    }, []);

    return (
        <div className={"details-modifications"}>
            <div className={"details-mod-header"}>
                <h2>Modifications</h2>
                <button className="details-add-mod" onClick={addMod}>
                    Add/Edit &#43;
                </button>
            </div>
            <table className={"details-table"}>
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