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
        setIsDirty,
        setClickedRack,
        clickedRack,
        isEditEnabled
    } = useCurrentContext();

    const changeMod = (event) => {
        const isChangingFromCTunnel = defaultMod === ModTypes.CTunnel;
        const isChangingToCTunnel = event.value === ModTypes.CTunnel;
        setIsDirty(true);
        // Change rack state
        updateClickedRack(setClickedRack, modKey, cageId, event);
        // if the cage state to change is the clicked cage
        if(clickedCage.id === cageId){
            changeCageMod(setClickedCage, modKey, event);
            // if changing divider from clicked cage, also change divider of adj cage
            if(modKey === "rightDivider") {
                updateClickedRack(setClickedRack, "leftDivider", cageId + 1, event);
            }else if(modKey === "leftDivider") {
                updateClickedRack(setClickedRack, "rightDivider", cageId - 1, event);
            }
        }
        else {// if changing adj cage mod from clicked cage update clicked cage and adj cage
            if(modKey === "rightDivider") {
                changeCageMod(setClickedCage, "leftDivider", event);
            }else if(modKey === "leftDivider") {
                changeCageMod(setClickedCage, "rightDivider", event);
            }
        }

        if (isChangingFromCTunnel || isChangingToCTunnel) {
            const targetCage = clickedCage.id === cageId ? clickedCage : clickedRack.cages.find(cage => cage.id === cageId);

            if (targetCage) {
                const newEvent = isChangingFromCTunnel ? { value: ModTypes.NoMod } : event;
                const adjCageId = targetCage.adjCages.floorCage
                    ? targetCage.adjCages.floorCage.id
                    : targetCage.adjCages.ceilingCage.id;

                updateClickedRack(setClickedRack, modKey, adjCageId, newEvent);
            }
        }
    }

    return (
        <tr>
            <td>{convertLocationName(modKey)}</td>
            <td>
                <Select
                    options={modOptions}
                    isDisabled={!isEditEnabled}// TODO add permissions to access this
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
                            color: isEditEnabled ? 'black' : 'gray',
                        }),
                        indicatorSeparator: (base) => ({
                            ...base,
                            backgroundColor: 'black',
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: isEditEnabled ? 'black' : 'dimgray',
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