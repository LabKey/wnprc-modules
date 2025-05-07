import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import Select from 'react-select';
import { Option } from '@labkey/components';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { CageModType, CageWithMods, DirectionCategory, ModLocations, ModTypes, Rack } from '../../../types/typings';
import { findCageInGroup, findRackInGroup } from '../../../utils/LayoutEditorHelpers';
import { Simulate } from 'react-dom/test-utils';
import change = Simulate.change;

interface ModificationSelectProps {
    cage: CageWithMods;
    removeMod: () => void;
    changeMod: (newMod: ModTypes) => void;
    defaultValue?: Option<CageModType>;
    directionCategory?: DirectionCategory;
}

export const ModificationSelect: FC<ModificationSelectProps> = (props) => {
    const {directionCategory, cage, defaultValue, removeMod, changeMod} = props;
    const {selectedRoom} = useHomeContext();
    const [options, setOptions] = useState<Option<ModTypes>[]>(null);

    useEffect(() => {
        console.log("DV: ", defaultValue);
    }, [defaultValue]);


    useEffect(() => {
        // the filter here assigns vertical to above and below, horizontal to left and right, and if no direction given then it is direct
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'cageui_modifications',
            columns: [],
            filterArray: [Filter.create('category',
                directionCategory ? directionCategory : "direct",
                Filter.Types.EQUALS)]
        }
        console.log("Direction: ", directionCategory)

        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if(result.rows.length !== 0){
                const rowOptions: Option<ModTypes>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value as ModTypes});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    const handleChange = (option: Option<CageModType>) => {
        console.log("Mod Change: ", option)
        // If dropdown is cleared remove it.
        if(!option){
            removeMod()
        }else{
            changeMod(option.value as ModTypes);
        }
        /*
        setSelectedRackMods(prevState => {
            const exists = prevState.findIndex(mod => mod.cage.cageNum === cage.cageNum);
            if(exists >= 0){
                const updatedMods = [...prevState];
                updatedMods[exists] = {
                    ...updatedMods[exists],
                    mod: option
                };
                return updatedMods;
            }else{
                const {rack: rack} = findCageInGroup(cage.cageNum, selectedRoom.rackGroups);
                return [...prevState, {
                    rack: rack,
                    cage: cage,
                    mod: option
                }]
            }
        })*/
    }

    return (
        <Select
            options={options}
            placeholder={"Select a mod"}
            isClearable={true}
            defaultValue={defaultValue}
            onChange={(option) =>  handleChange(option)}
            styles={{
                container: (baseStyles, state) => ({
                    ...baseStyles,
                    overflow: 'visible',
                }),
                menu: (baseStyles, state) => ({
                    ...baseStyles,
                    zIndex: '9999',
                    minWidth: 'fit-content',
                 }),
                option: (baseStyles, state) => ({
                ...baseStyles,
                whiteSpace: 'nowrap'
            })
            }}
        />
    );
}