import * as React from 'react';
import { FC, useEffect } from 'react';
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
    const { setRoom, clickedCage, clickedRack, setClickedCage} = useCurrentContext();
    const changeMod = (event) => {

        setClickedCage(prevState => ({
            ...prevState,
            cageState: {
                ...prevState.cageState,
                [modKey]: {
                    ...prevState.cageState[modKey],
                    modData: Object.values(Modifications).find((mod) => mod.mod === event.value)
                }
            }
        }));
    }

    useEffect(() => {
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = clickedRack.id - 1;
            if (updatedRoom[clickedRackIndex]) {
                // Create a deep copy of the cage state object
                updatedRoom[clickedRackIndex].cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;
            }
            return updatedRoom;
        })
    }, [clickedCage.cageState]);

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