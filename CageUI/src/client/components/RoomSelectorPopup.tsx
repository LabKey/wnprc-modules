import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import "../cageui.scss";
import Select, {Options} from 'react-select';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from './helpers';
import { Room } from './typings';

interface RoomSelectorPopup {
    onConfirm: () => void;
    onCancel: () => void;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
}

interface Option {
    label: string;
    value: number;
}

export const RoomSelectorPopup: FC<RoomSelectorPopup> = (props) => {
    const { onConfirm, onCancel, setRoom } = props;
    const [selectedRoom, setSelectedRoom] = useState<string>(null);
    const [options, setOptions] = useState<Option[]>(null);

    useEffect(() => {
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
            filterArray: []
        }

        labkeyActionSelectWithPromise(roomsConfig).then(result => {
            if(result.rows.length !== 0){
                const rowOptions: Option[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.room, value: row.rowid});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room", err);
        });
    }, []);

    const handleSaveRoom = () => {
        setRoom(prevState => ({
            ...prevState,
            name: selectedRoom
        }));
        onConfirm();
        onCancel();
    }

    return (
        <div className="popup-overlay">
            <div className="popup">

                <Select
                    options={options}
                    placeholder={"Select a room"}
                    onChange={(option) => setSelectedRoom(option.label)}

                />
                <div className="popup-buttons">
                    <button onClick={handleSaveRoom}>Yes</button>
                    <button onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
}