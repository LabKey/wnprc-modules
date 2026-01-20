/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { Room, RoomObject } from '../../types/typings';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Option } from '@labkey/components';
import { SelectedObj } from '../../types/layoutEditorTypes';

interface GateChangeRoomProps {
    selectedObj: SelectedObj;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
}

/*
    Changes the assigned room the gate goes to.
    extraContext is {room: string, roomid: number} or GateContext
 */
export const GateChangeRoom: FC<GateChangeRoomProps> = (props) => {
    const {setLocalRoom, selectedObj} = props;
    const [selectedRoom, setSelectedRoom] = useState<Option<number>>(null);
    const [options, setOptions] = useState<Option<number>[]>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let initalRoom: Option<number>;
        if (selectedObj && (selectedObj as RoomObject).extraContext?.room) {
            initalRoom = {
                label: (selectedObj as RoomObject).extraContext.room,
                value: (selectedObj as RoomObject).extraContext.roomId
            };
            setSelectedRoom(initalRoom);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
        };
        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: Option<number>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.room, value: row.rowid});
                });
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log('Error fetching prev room', err);
        });
    }, []);

    useEffect(() => {
        if (!selectedRoom || loading) {
            return;
        }

        setLocalRoom(prevState => ({
            ...prevState,
            objects: prevState.objects.map((obj, index) => {
                if (obj.itemId === (selectedObj as RoomObject).itemId) {
                    return {
                        ...obj,
                        extraContext: {...obj.extraContext, room: selectedRoom.label, roomId: selectedRoom.value}
                    };
                }
                return obj;

            })
        }));
    }, [selectedRoom]);

    const handleChange = (option) => {
        setSelectedRoom(option);
    };
    return (
        <div className={'menu-item'}>
            <Select
                options={options}
                value={selectedRoom}
                placeholder={'Select a room'}
                onChange={(option) => handleChange(option)}
            />
        </div>
    );
}