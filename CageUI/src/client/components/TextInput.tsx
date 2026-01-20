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
};