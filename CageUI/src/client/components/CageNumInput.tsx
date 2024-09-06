import * as React from 'react';
import {FC, useState} from 'react';


interface CageNumInputProps {
    onSubmit: (value: number) => void;
    onClose: () => void;
}
export const CageNumInput: FC<CageNumInputProps> = (props) => {
    const {onSubmit, onClose} = props;
    const [inputValue, setInputValue] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            const numericValue = parseFloat(inputValue);
            if (!isNaN(numericValue)) {
                onSubmit(numericValue);
                onClose(); // Close the popup after submitting
            }
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    placeholder="Enter a number"
                    className="popup-input"
                />
            </div>
        </div>
    );
}