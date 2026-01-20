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
import { useState } from 'react';
import '../../cageui.scss';

// Define the structure of an option/card
export interface SelectorOptions {
    id: number;
    scale: number;
    title: string;
    description: string;
}

interface PopupProps {
    options: SelectorOptions[];
    onClose: () => void;
    onSelect: (selectedOption: SelectorOptions | null) => void;
}

// Popup window for selecting the side of the room in the layout editor
export const RoomSizeSelector: React.FC<PopupProps> = ({options, onClose, onSelect}) => {
    const [selectedOption, setSelectedOption] = useState<SelectorOptions | null>(null);

    // Handle the card click event
    const handleOptionClick = (option: SelectorOptions) => {
        setSelectedOption(option);
    };

    // Handle the select button click
    const handleSelectClick = () => {
        onSelect(selectedOption);
        onClose(); // Close the popup after selection
    };

    return (
        <div className="room-size-selector-overlay">
            <div className="room-size-selector-content">
                <h2>Select an Option</h2>

                <div className="room-size-selector-options-container">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className={`room-size-selector-option-card ${selectedOption?.id === option.id ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            <h3>{option.title}</h3>
                            <p>{option.description}</p>
                        </div>
                    ))}
                </div>
                <div className="room-size-selector-actions">
                    <button onClick={handleSelectClick} className="room-size-selector-select-btn"
                            disabled={!selectedOption}>
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
};