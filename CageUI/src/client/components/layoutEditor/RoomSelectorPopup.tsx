/*
 *
 *  * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
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

import React, { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import Select from 'react-select';
import { Filter, Query } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Room } from '../../types/typings';
import { Option } from '@labkey/components';

interface RoomSelectorPopup {
    onConfirm: () => void;
    onCancel: () => void;
    setRoom: React.Dispatch<React.SetStateAction<Room>>;
    template: boolean;
    templateLoad?: boolean;
    templateRename?: React.Dispatch<React.SetStateAction<string>>;
}

// For saving and loading in the layout editor, this is a room selector component
export const RoomSelectorPopup: FC<RoomSelectorPopup> = (props) => {
    const {onConfirm, onCancel, setRoom, template, templateLoad, templateRename} = props;
    const [selectedRoom, setSelectedRoom] = useState<string>(null);
    const [options, setOptions] = useState<Option<number>[]>(null);
    const [templateName, setTemplateName] = useState<string>('');

    // Fetch room, if template only fetch template rooms, otherwise fill options with {label: row.room, value: row.rowid}
    useEffect(() => {
        const roomsConfig: Query.SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room', 'rowid'],
            filterArray: template ? [Filter.create('room', 'template', Filter.Types.CONTAINS)] : [Filter.create('room', 'template', Filter.Types.DOES_NOT_CONTAIN)]
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
            console.error('Error fetching prev room', err);
        });
    }, []);

    // Determines and updates if a template was renamed then saves room/template
    const handleSaveRoom = () => {
        if (selectedRoom === null) {
            onCancel();
            return;
        }

        if (templateName.length > 0) {
            const newTemplateName = "template-" + templateName;
            // if template, save old template name for later
            setRoom(prevState => ({
                ...prevState,
                name: newTemplateName
            }));
            templateRename(selectedRoom);
        } else {
            setRoom(prevState => ({
                ...prevState,
                name: selectedRoom
            }));
        }
        onConfirm();
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className={'popup-row'}>
                    <Select
                        options={options}
                        placeholder={'Select a room'}
                        onChange={(option) => setSelectedRoom(option.label)}
                    />
                </div>
                {(template && !templateLoad) &&
                        <div className={'popup-row'}>
                            <label>
                                Rename template?
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
};