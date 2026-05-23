/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';

interface InputRow {
    [key: string]: string;
}

export const createOptions = (
    rows: InputRow[],
    keyCol: string,
    displayCol: string,
    addOtherOption?: boolean,
    formatColName?: string
) => {
    if (!rows) return undefined;

    const options = [];

    Object.assign(options, rows);
    if (addOtherOption) {
        options[rows.length] = { [displayCol]: 'Other' };
    }

    return options.map(row => {
        return (
            <option key={row[keyCol] + '-' + row[displayCol]} value={row[keyCol]}>
                {row[displayCol] + (formatColName && row[formatColName] ? ' (' + row[formatColName] + ')' : '')}
            </option>
        );
    });
};

export const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(value);
};
