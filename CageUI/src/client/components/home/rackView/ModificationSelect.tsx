import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import Select from 'react-select';
import { Option } from '@labkey/components';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { Cage, Rack, RackTypes } from '../../../types/typings';
import { Direction } from '../../../types/homeTypes';

interface ModificationSelectProps{
    type: RackTypes;
    cage: Cage;
    rack: Rack;
    direction?: Direction;
}

export const ModificationSelect: FC<ModificationSelectProps> = (props) => {
    const {type, direction, cage, rack} = props;
    const {setSelectedRackMods, selectedRack} = useHomeContext();
    const [options, setOptions] = useState<Option<string>[]>(null);


    useEffect(() => {
        console.log("Opt: ", options);
    }, [options]);

    useEffect(() => {
        // the filter here assigns vertical to above and below, horizontal to left and right, and if no direction given then it is direct
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'cageui_modifications',
            columns: [],
            filterArray: [Filter.create('category',
                direction === 'right' || direction === 'left' ? 'horizontal'
                    : direction === 'below' || direction === 'above' ? 'vertical'
                        : 'direct',
                Filter.Types.EQUALS)]
        }

        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if(result.rows.length !== 0){
                const rowOptions: Option<string>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    const handleChange = (option: Option<string>) => {
        console.log("Mod: ", option)
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
                return [...prevState, {
                    rack: rack,
                    cage: cage,
                    mod: option
                }]
            }
        })
    }

    return (
        <Select
            options={options}
            placeholder={"Select a mod"}
            isClearable={true}
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