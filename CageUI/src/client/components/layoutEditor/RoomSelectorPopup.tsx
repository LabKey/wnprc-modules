import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import Select from 'react-select';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Room } from '../../types/typings';

interface RoomSelectorPopup {
    onConfirm: () => void;
    onCancel: () => void;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
    template: boolean;
    templateLoad?: boolean;
    setTemplateRename?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Option {
    label: string;
    value: number;
}

// For saving and loading in the layout editor, this is a room selector component
export const RoomSelectorPopup: FC<RoomSelectorPopup> = (props) => {
    const { onConfirm, onCancel, setRoom, template, setTemplateRename,templateLoad } = props;
    const [selectedRoom, setSelectedRoom] = useState<string>(null);
    const [options, setOptions] = useState<Option[]>(null);
    const [templateName, setTemplateName] = useState<string>('');

    // Fetch room, if template only fetch template rooms, otherwise fill options with {label: row.room, value: row.rowid}
    useEffect(() => {
        const roomsConfig: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
            filterArray: template ? [Filter.create('room', 'template', Filter.Types.CONTAINS)] : []
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

    // Determines and updates if a template was renamed then saves room/template
    const handleSaveRoom = () => {
        if(selectedRoom === null){
            onCancel();
            return;
        }
        let newName = selectedRoom;
        let oldName;
        if(templateName.length > 0){
            //return if new name doesn't have word template in it
            if(!templateName.includes("template")){
                onCancel();
                return;
            }
            oldName = selectedRoom;
            newName = templateName;
            // if template, save old name and new name together to parse later in submission
            setTemplateRename(true);
            setRoom(prevState => ({
                ...prevState,
                name: JSON.stringify([oldName, newName])
            }));
        }else{
            setRoom(prevState => ({
                ...prevState,
                name: selectedRoom
            }));
        }
        onConfirm();
    }

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className={"popup-row"}>
                    <Select
                        options={options}
                        placeholder={"Select a room"}
                        onChange={(option) => setSelectedRoom(option.label)}
                    />
                </div>
                {(template && !templateLoad) &&
                    <div className={"popup-row"}>
                        <label>
                            Rename template? (Please include the word "template" in new name)
                        </label>
                        <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                    </div>
                }
                <div className="popup-buttons">
                    <button onClick={handleSaveRoom}>Confirm</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>

            </div>
        </div>
    );
}