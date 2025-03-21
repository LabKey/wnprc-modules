import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import Select from 'react-select';
import { Option } from '@labkey/components';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { RackTypes } from '../../../types/typings';
import { Direction } from '../../../types/homeTypes';

interface ModificationSelectProps{
    type: RackTypes;
    direction: Direction;
}

export const ModificationSelect: FC<ModificationSelectProps> = (props) => {
    const {type, direction} = props;
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();
    const [options, setOptions] = useState<Option<number>[]>(null);


    useEffect(() => {
        console.log("Opt: ", options);
    }, [options]);

    useEffect(() => {
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'cageui_modifications',
            columns: [],
            filterArray: [Filter.create('category', direction === 'right' || direction === 'left' ? 'vertical' : 'horizontal', Filter.Types.NEQ)]
        }

        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if(result.rows.length !== 0){
                const rowOptions: Option<number>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    const handleChange = (option: Option<number>) => {

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