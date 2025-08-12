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
import { useState, useRef, useEffect, FC } from 'react';
import { Option } from '@labkey/components';
import { ModDirections, ModTypes } from '../../../types/typings';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter, Utils } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { ConnectedModType } from '../../../types/homeTypes';
import { cageModLookup } from '../../../api/popularQueries';



interface ModificationMultiSelectProps {
    handleChange: (selectedItems: ConnectedModType[]) => void;
    prevItems?: ConnectedModType[];
    directionCategory?: ModDirections;
}
export const ModificationMultiSelect: FC<ModificationMultiSelectProps> = (props) => {
    const {directionCategory, handleChange, prevItems} = props;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<ConnectedModType[]>(prevItems || []);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const [options, setOptions] = useState<Option<ModTypes>[]>(null);

    useEffect(() => {
        console.log("Direction: ", options);
    }, [options]);

    useEffect(() => {
        // the filter here assigns vertical to above and below, horizontal to left and right, and if no direction given then it is direct
        console.log("Pre LookIP{ : ", directionCategory);
        cageModLookup([], [Filter.create('direction',
            directionCategory !== undefined ? directionCategory : ModDirections.Direct,
            Filter.Types.EQUALS)]).then(result => {
            if(result.rows.length !== 0){
                const rowOptions: Option<ModTypes>[] = [];
                result.rows.forEach(row => {
                    rowOptions.push({label: row.title, value: row.value as ModTypes});
                })
                setOptions(rowOptions);
            }
        }).catch(err => {
            console.log("Error fetching prev room mods", err);
        });
    }, [])


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(selectedItems === undefined) return;
        handleChange(selectedItems);
    }, [selectedItems]);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelectItem = (item: Option<ModTypes>) => {
        const newItems = selectedItems || [];

        if (!newItems.find(items => items.value === item.value)) {
            setSelectedItems([...newItems, {
                ...item,
                id: Utils.generateUUID(),
            }]);
        }
        setSearchTerm('');
        setIsOpen(false);
    };

    const removeItem = (itemToRemove) => {
        setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    };

    const filteredOptions = options?.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.find(item => item.value === option.value)
    );

    return (
        <div className="multi-select-container" ref={dropdownRef}>
            <div className="selected-items-container" onClick={toggleDropdown}>
                {selectedItems === undefined || selectedItems.length === 0 ? (
                    <div className="placeholder">Select items...</div>
                ) : (
                    selectedItems.map(item => (
                        <div key={item.value} className="selected-item">
                            {item.label}
                            <span
                                className="remove-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(item);
                                }}
                            >
                &times;
              </span>
                        </div>
                    ))
                )}
            </div>

            {isOpen && (
                <div className="multi-select-dropdown-menu">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <div className="dropdown-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, idx) => (
                                <div
                                    key={idx}
                                    className="dropdown-item"
                                    onClick={() => handleSelectItem(option)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No options available</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
