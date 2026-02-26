import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import Select from 'react-select';
import { Option } from '@labkey/components';
import { Filter } from '@labkey/api';
import { ModDirections, ModTypes } from '../../../types/typings';
import { cageModLookup } from '../../../api/popularQueries';
import { useRoomContext } from '../../../context/RoomContextManager';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface ModificationSelectProps {
    removeMod: () => void;
    changeMod: (newMod: ModTypes) => void;
    defaultValue?: Option<ModTypes>;
    directionCategory?: ModDirections;
}

export const ModificationSelect: FC<ModificationSelectProps> = (props) => {
    const {directionCategory, defaultValue, removeMod, changeMod} = props;
    const {selectedRoom} = useHomeNavigationContext();
    const [options, setOptions] = useState<Option<ModTypes>[]>(null);
    const [selectedMod, setSelectedMod] = useState<Option<ModTypes>>(defaultValue);

    useEffect(() => {
        // the filter here assigns vertical to above and below, horizontal to left and right, and if no direction given then it is direct
        cageModLookup([], [Filter.create('category',
            directionCategory ? directionCategory : ModDirections.Direct,
            Filter.Types.EQUALS)]).then(result => {
            if (result.length !== 0) {
                const rowOptions: Option<ModTypes>[] = [];
                result.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value as ModTypes});
                });
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log('Error fetching prev room mods', err);
        });
    }, []);

    const handleChange = (option: Option<ModTypes>) => {
        // If dropdown is cleared remove it.
        if (!option) {
            removeMod();
            setSelectedMod(null);
        } else {
            changeMod(option.value as ModTypes);
            setSelectedMod(option);
        }
    };

    return (
        <Select
            options={options}
            placeholder={'Select a mod'}
            isClearable={true}
            value={selectedMod}
            onChange={(option) => handleChange(option)}
            styles={{
                container: (baseStyles, state) => ({
                    ...baseStyles,
                    overflow: 'visible',
                    width: 'max-content',
                    minWidth: '100%',
                }),
                menu: (baseStyles, state) => ({
                    ...baseStyles,
                    zIndex: '9999',
                    width: 'max-content',
                    minWidth: '100%',
                }),
                option: (baseStyles, state) => ({
                    ...baseStyles,
                    whiteSpace: 'nowrap'
                })
            }}
        />
    );
};