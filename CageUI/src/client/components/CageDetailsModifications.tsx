import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { Cage } from './typings';
import Select from 'react-select';
import { convertLocationName, getModOptions } from './helpers';
interface ModificationDetailsProps {
    cage: Cage
}
export const CageDetailsModifications: FC<ModificationDetailsProps> = (props) => {
    const {cage} = props;

    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);

    const addMod = () => {
        console.log("Add Mod");
    }

    const changeMod = (event) => {
        console.log(event);
        console.log(cage);
    }
    //TODO move table row to sep file to improve readability
    useEffect(() => {
        const newModRows = Object.keys(cage.cageState).map((key, idx) => {
            const modOptions = getModOptions(key);
            if (Array.isArray(cage.cageState[key])) { // finds extra mods
                return(
                    cage.cageState[key].map((mod, idx) => {
                        if (mod.name === "") return;
                        return (
                            <tr key={`extraMod-${idx}`}>
                                <td>{convertLocationName(key)}</td>
                                <td>
                                    <Select
                                        options={modOptions}
                                        isDisabled={false}// TODO add permissions to access this
                                        defaultValue={modOptions.find((mod) => (
                                            Array.isArray(cage.cageState[key]) &&
                                            cage.cageState[key].some((item) => item.mod === mod.value)
                                        ))}
                                        onChange={changeMod}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                backgroundColor: 'inherit',
                                                borderColor: 'inherit'
                                            }),
                                            indicatorsContainer: (base) => ({
                                                ...base,
                                                color: 'inherit',
                                            }),
                                            indicatorSeparator: (base) => ({
                                                ...base,
                                                backgroundColor: 'black',
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                color: 'black',
                                            }),
                                        }}
                                    />
                                </td>
                                <td>#testCageNum</td>
                            </tr>
                        );
                    }));
            } else { // finds separators
                return (
                    <tr key={`separator-${idx}`}>
                        <td>{convertLocationName(key)}</td>
                        <td>
                            <Select
                                options={modOptions}
                                isDisabled={false}// TODO add permissions to access this
                                defaultValue={modOptions.find((mod) => (
                                    mod.value === cage.cageState[key].mod
                                ))}
                                onChange={changeMod}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'inherit',
                                        borderColor: 'inherit'
                                    }),
                                    indicatorsContainer: (base) => ({
                                        ...base,
                                        color: 'inherit',
                                    }),
                                    indicatorSeparator: (base) => ({
                                        ...base,
                                        backgroundColor: 'black',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "black",
                                    }),
                                }}
                            />
                        </td>
                        <td>#0004</td>
                    </tr>
                );
            }
        });

        setModRows((prevState) => [...prevState, ...newModRows]);
    }, []);
    useEffect(() => {
        console.log(modRows);
    }, [modRows]);
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