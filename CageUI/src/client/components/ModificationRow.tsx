import * as React from 'react';
import { FC } from 'react';
import { changeCageMod, changeCageModArray, convertLocationName } from './helpers';
import Select from 'react-select';
import { ModTypes } from './typings';
import { useCurrentContext } from './ContextManager';


interface ModificationRowProps {
    modKey: string;
    defaultMod: ModTypes;
    modOptions: {value: ModTypes, label: string}[];
    affectedCage: string;
    cageId: number;
}
export const ModificationRow: FC<ModificationRowProps> = (props) => {
    const {
        modKey,
        defaultMod,
        modOptions,
        affectedCage,
        cageId,
    } = props;
    const {
        clickedCage,
        setClickedCage,
        setClickedCagePartners,
        isEditing,
        setIsDirty
    } = useCurrentContext();

    const changeMod = (event) => {
        setIsDirty(true);
        // Change main cage state
        // if the cage state to change is the clicked cage
        if(clickedCage.id === cageId){
            changeCageMod(setClickedCage, modKey, event);
            // if changing divider from clicked cage, also change divider of adj cage
            if(modKey === "rightDivider") {
                changeCageModArray(cageId + 1, setClickedCagePartners, "leftDivider", event);
            }else if(modKey === "leftDivider") {
                changeCageModArray(cageId - 1, setClickedCagePartners, "rightDivider", event);
            }
        }
        else {// if changing adj cage mod from clicked cage update clicked cage and adj cage
            changeCageModArray(cageId, setClickedCagePartners, modKey, event);
            if(modKey === "rightDivider") {
                changeCageMod(setClickedCage, "leftDivider", event);
            }else if(modKey === "leftDivider") {
                changeCageMod(setClickedCage, "rightDivider", event);
            }
        }

        // Changing from CTunnel mod to another mod, must remove ctunnel from cage above/below.
        if(defaultMod === ModTypes.CTunnel){
            if(clickedCage.id === cageId){
                event = {value: ModTypes.NoMod}
                if(clickedCage.adjCages.floorCage){ // cage is above so change below
                    changeCageModArray(clickedCage.adjCages.floorCage.id, setClickedCagePartners, modKey, event);
                    // Remove mod from cage
                }else{
                    changeCageModArray(clickedCage.adjCages.ceilingCage.id, setClickedCagePartners, modKey, event);
                }
            }
        }

        // Changing from other mod to CTunnel
        if(event.value === ModTypes.CTunnel) {
            if(clickedCage.id === cageId){
                if(clickedCage.adjCages.floorCage){ // cage is above so change below
                    changeCageModArray(clickedCage.adjCages.floorCage.id, setClickedCagePartners, modKey,  event);
                }else{
                    console.log("CCC: ", clickedCage.adjCages.ceilingCage);
                    changeCageModArray(clickedCage.adjCages.ceilingCage.id, setClickedCagePartners, modKey, event);
                }
            }
        }
    }

    return (
        <tr>
            <td>{convertLocationName(modKey)}</td>
            <td>
                <Select
                    options={modOptions}
                    isDisabled={!isEditing}// TODO add permissions to access this
                    value={modOptions.find((mod) => (
                        mod.value === defaultMod
                    ))}
                    isOptionSelected={(option, selectValue) => selectValue.some(
                    (val) => val.value === option.value
                    )}
                    onChange={changeMod}
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: 'inherit',
                            borderColor: 'inherit'
                        }),
                        dropdownIndicator: (base) => ({
                            ...base,
                            color: isEditing ? 'black' : 'gray',
                        }),
                        indicatorSeparator: (base) => ({
                            ...base,
                            backgroundColor: 'black',
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: isEditing ? 'black' : 'dimgray',
                        }),
                    }}
                />
            </td>
            <td>
                {affectedCage}
            </td>
        </tr>
    );
}