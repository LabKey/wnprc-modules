import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { Room, RoomObject, RoomObjectTypes } from '../../types/typings';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Option } from '@labkey/components';
import { SelectedObj } from '../../types/layoutEditorTypes';

interface GateChangeRoomProps {
    localRoom: Room;
    selectedObj: SelectedObj;
    keys: any;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
}

/*
    Changes the assigned room the gate goes to.
    extraContext is {room: string, roomid: number} or GateContext
 */
export const GateChangeRoom: FC<GateChangeRoomProps> = (props) => {
    const {setLocalRoom, selectedObj, localRoom, keys} = props;
    const [selectedRoom, setSelectedRoom] = useState<Option<number>>(null);
    const [options, setOptions] = useState<Option<number>[]>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if(localRoom.objects.length > 0) {
            let initalRoom: Option<number>;
            let foundGate: RoomObject;
            localRoom.objects.forEach((obj) => {
                if(obj.type === RoomObjectTypes.Gate && obj.itemId === (selectedObj as RoomObject).itemId){
                    foundGate = obj;
                }
            })
            if(foundGate && foundGate?.extraContext?.room){
                initalRoom = {label: foundGate.extraContext.room, value: foundGate.extraContext.roomId};
                setSelectedRoom(initalRoom);
                setLoading(false);
            }else{
                setLoading(false);
            }
        }
    }, []);
    useEffect(() => {
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
        }
        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if (result.rows.length !== 0) {
                const rowOptions: Option<number>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.room, value: row.rowid});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    useEffect(() => {
        if(!selectedRoom || loading) return;

        setLocalRoom(prevState => ({
            ...prevState,
            objects: prevState.objects.map((obj, index) => {
                if(obj.itemId === (selectedObj as RoomObject).itemId){
                    return {...obj, extraContext: {room: selectedRoom.label, roomId: selectedRoom.value}};
                }
                return obj;

            })
        }))
    }, [selectedRoom]);

    const handleChange = (option) => {
        setSelectedRoom(option);
    }
    return (
        <div className={"menu-item"}>
            <Select
                options={options}
                value={selectedRoom}
                placeholder={"Select a room"}
                onChange={(option) => handleChange(option)}
            />
        </div>
    );
}