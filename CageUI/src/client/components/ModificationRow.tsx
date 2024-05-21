import * as React from 'react';
import { FC } from 'react';
import { convertLocationName } from './helpers';
import Select from 'react-select';
import { Modifications, ModTypes } from './typings';
import { useCurrentContext } from './ContextManager';


interface ModificationRowProps {
    modKey: string;
    defaultMod: ModTypes;
    modOptions: {value: ModTypes, label: string}[];
    affectedCages: string[];
}
export const ModificationRow: FC<ModificationRowProps> = (props) => {
    const {
        modKey,
        defaultMod,
        modOptions,
        affectedCages
    } = props;
    const {
        clickedCage,
        setClickedCage,
        clickedCagePartner,
        setClickedCagePartner
    } = useCurrentContext();
    const changeMod = (event) => {
        //console.log(clickedCage, clickedCagePartner, event, modKey);
        let tempKey;
        if(modKey !== "rightDivider" && modKey !== "leftDivider"){
            tempKey = modKey;
        }else{
            tempKey = modKey === "rightDivider" ? "leftDivider" : "rightDivider"; // switch key for opposite cage
        }
        if((modKey in clickedCage.cageState)){
            setClickedCage(prevState => ({
                ...prevState,
                cageState: {
                    ...prevState.cageState,
                    [modKey]: {
                        ...prevState.cageState[modKey],
                        modData: {
                            ...prevState.cageState[modKey].modData,
                            mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
                        }
                    }
                }
            }));
        }else{
            setClickedCagePartner(prevState => ({
                ...prevState,
                cageState: {
                    ...prevState.cageState,
                    [modKey]: {
                        ...prevState.cageState[modKey],
                        modData: {
                            ...prevState.cageState[modKey].modData,
                            mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
                        }
                    }
                }
            }));
        }
        if(!tempKey.includes("floor")){
            if(tempKey in clickedCagePartner.cageState){
                setClickedCagePartner(prevState => ({
                    ...prevState,
                    cageState: {
                        ...prevState.cageState,
                        [tempKey]: {
                            ...prevState.cageState[tempKey],
                            modData: {
                                ...prevState.cageState[tempKey].modData,
                                mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
                            }
                        }
                    }
                }));
            }else{
                setClickedCage(prevState => ({
                    ...prevState,
                    cageState: {
                        ...prevState.cageState,
                        [tempKey]: {
                            ...prevState.cageState[tempKey],
                            modData: {
                                ...prevState.cageState[tempKey].modData,
                                mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
                            }
                        }
                    }
                }));
            }
        }
    }

    return (
        <tr>
            <td>{convertLocationName(modKey)}</td>
            <td>
                <Select
                    options={modOptions}
                    isDisabled={false}// TODO add permissions to access this
                    defaultValue={modOptions.find((mod) => (
                        mod.value === defaultMod
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
            <td>
                {affectedCages.join(", ")}
            </td>
        </tr>
    );
}