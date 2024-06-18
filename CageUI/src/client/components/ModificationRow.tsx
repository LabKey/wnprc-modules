import * as React from 'react';
import { FC } from 'react';
import { changeCageMod, changeCageModArray, convertLocationName, updateClickedRack } from './helpers';
import Select from 'react-select';
import { Modifications, ModTypes } from './typings';
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
        setIsDirty,
        setClickedRack,
        clickedCagePartners,
    } = useCurrentContext();

    const changeMod = (event) => {
        const isChangingFromCTunnel = defaultMod === ModTypes.CTunnel;
        const isChangingToCTunnel = event.value === ModTypes.CTunnel;
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
        //update clicked Rack
        updateClickedRack(setClickedRack, modKey, cageId, event);


        if (isChangingFromCTunnel || isChangingToCTunnel) {
            const targetCage = clickedCage.id === cageId ? clickedCage : clickedCagePartners.find(cage => cage.id === cageId);

            if (targetCage) {
                const newEvent = isChangingFromCTunnel ? { value: ModTypes.NoMod } : event;
                const adjCageId = targetCage.adjCages.floorCage
                    ? targetCage.adjCages.floorCage.id
                    : targetCage.adjCages.ceilingCage.id;

                changeCageModArray(adjCageId, setClickedCagePartners, modKey, newEvent);
                updateClickedRack(setClickedRack, modKey, cageId, newEvent);
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