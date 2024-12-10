import * as React from 'react';
import { useState } from 'react';
import '../cageui.scss';

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

export const RoomSizeSelector: React.FC<PopupProps> = ({ options, onClose, onSelect }) => {
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
                    <button onClick={onClose} className="room-size-selector-close-btn">Close</button>
                    <button onClick={handleSelectClick} className="room-size-selector-select-btn" disabled={!selectedOption}>
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
};