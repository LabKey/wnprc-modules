import * as React from 'react';
import { FC, useState } from 'react';


interface TextInputProps {
    onSubmit: (value: any) => void;
}

// input is a text but only submits if it is a number
export const TextInput: FC<TextInputProps> = (props) => {
    const {onSubmit} = props;
    const [inputValue, setInputValue] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            const numericValue = parseFloat(inputValue);
            if (!isNaN(numericValue)) {
                onSubmit(numericValue);
            }
        }
    };

    return (
        <div className="context-menu-row">
            <div className="context-menu-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="Enter a number"
                    className="popup-input"
                />
            </div>
        </div>
    );
}