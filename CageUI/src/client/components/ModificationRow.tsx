import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { changeCageMod, changeCageModArray, convertLocationName } from './helpers';
import Select from 'react-select';
import { ModTypes } from './typings';
import { useCurrentContext } from './ContextManager';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { ConfirmationPopup } from './ConfirmationPopup';


interface ModificationRowProps {
    modKey: string;
    defaultMod: ModTypes;
    modOptions: {value: ModTypes, label: string}[];
    affectedCage: string;
    cageId: number;
    extraModId?: number;
}
export const ModificationRow: FC<ModificationRowProps> = (props) => {
    const {
        modKey,
        defaultMod,
        modOptions,
        affectedCage,
        cageId,
        extraModId,
    } = props;
    const {
        clickedCage,
        setClickedCage,
        clickedCagePartners,
        setClickedCagePartners,
        isEditing,
        setIsEditing,
        setRoom,
        saveMod
    } = useCurrentContext();
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [saveDelete, setSaveDelete] = useState<boolean>(false);
    const [isValidDelete, setIsValidDelete] = useState<boolean>(false);
    const [isValidDeleteArray, setIsValidDeleteArray] = useState<boolean>(false);

    const deleteMod = () => {
        console.log("Delete: ", extraModId, defaultMod);
        // Deleting cTunnel, must delete from top and bottom cages
        if(clickedCage.id === cageId) {
            if(defaultMod === ModTypes.CTunnel){
                changeCageMod(setClickedCage, modKey,"delete", extraModId, setIsValidDelete);
                if(clickedCage.adjCages.floorCage){
                    changeCageModArray(clickedCage.adjCages.floorCage.id, setClickedCagePartners, modKey,"delete", setIsValidDeleteArray, extraModId, true);

                }else{
                    changeCageModArray(clickedCage.adjCages.ceilingCage.id, setClickedCagePartners, modKey,"delete", setIsValidDeleteArray, extraModId, true);
                }
            }else {
                changeCageMod(setClickedCage, modKey,"delete", extraModId, setIsValidDelete);
                setIsValidDeleteArray(true); // Set array is valid true since this doesn't use it
            }
        }else {
            const tempCC = clickedCagePartners.find((cage) => cage.id === cageId)
            if(defaultMod === ModTypes.CTunnel){
                changeCageModArray(cageId, setClickedCagePartners, modKey, "delete", setIsValidDeleteArray, extraModId, false)
                if(tempCC.adjCages.floorCage){
                    changeCageModArray(tempCC.adjCages.floorCage.id, setClickedCagePartners, modKey,"delete", setIsValidDeleteArray, extraModId, true);

                }else{
                    changeCageModArray(tempCC.adjCages.ceilingCage.id, setClickedCagePartners, modKey,"delete", setIsValidDeleteArray, extraModId, true);
                }
            }else{
                changeCageModArray(cageId, setClickedCagePartners, modKey, "delete", setIsValidDeleteArray, extraModId, true)
            }
            setIsValidDelete(true); // set is valid true since this route doesn't use it
        }
    }

    const changeMod = (event) => {
        console.log("CM: ", clickedCage, clickedCagePartners, event, modKey, extraModId, defaultMod);
        // Change main cage state
        // if the cage state to change is the clicked cage
        if(clickedCage.id === cageId){
            changeCageMod(setClickedCage, modKey, event, extraModId);

            // if changing divider from clicked cage, also change divider of adj cage
            if(modKey === "rightDivider") {
                changeCageModArray(cageId + 1, setClickedCagePartners, "leftDivider", event);
            }else if(modKey === "leftDivider") {
                changeCageModArray(cageId - 1, setClickedCagePartners, "rightDivider", event);
            }
            // Changing from CTunnel mod to another mod, must remove ctunnel from cage above/below.
            if(defaultMod === ModTypes.CTunnel){
                if(clickedCage.adjCages.floorCage){ // cage is above so change below
                    //changeCageModArray(clickedCage.adjCages.floorCage.id, setClickedCagePartners)
                    // Remove mod from cage

                }else if (clickedCage.adjCages.ceilingCage) {

                }
            }
        }
        else {// if changing adj cage mod from clicked cage update clicked cage and adj cage

            if(modKey === "rightDivider") {
                changeCageModArray(cageId, setClickedCagePartners, modKey, event);
                changeCageMod(setClickedCage, "leftDivider", event);

            }else if(modKey === "leftDivider") {
                changeCageModArray(cageId, setClickedCagePartners, modKey, event);
                changeCageMod(setClickedCage, "rightDivider", event);
            }else{
                changeCageModArray(cageId, setClickedCagePartners, modKey, event);
            }
        }
    }

    useEffect(() => {
        if(isValidDelete && isValidDeleteArray) {
            setSaveDelete(true);
        }
    }, [isValidDelete, isValidDeleteArray]);

    useEffect(() => {
        saveMod()
    }, [saveDelete]);

    return (
        <tr>
            {/* Place an editing button next to extra mods for deletion (can't delete floors/dividers) */
                isEditing && modKey === "extraMods" && (<td>
                    <ReactSVG
                        src={`${ActionURL.getContextPath()}/cageui/static/trashcan.svg`}
                        wrapper={"div"}
                        onClick={() => setIsPopupOpen(true)}
                        className={"edit-svg"}
                    />
                    {isPopupOpen && (
                        <ConfirmationPopup
                            message="Are you sure you want to delete this mod?"
                            onConfirm={deleteMod}
                            onCancel={() => setIsPopupOpen(false)}
                        />
                    )}
                </td>)}
            {isEditing && modKey !== "extraMods" && (<td></td>)/*Still need space here for UI */}
            <td>{convertLocationName(modKey)}</td>
            <td>
                <Select
                    options={modOptions}
                    isDisabled={false}// TODO add permissions to access this
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
                {affectedCage}
            </td>
        </tr>
    );
}