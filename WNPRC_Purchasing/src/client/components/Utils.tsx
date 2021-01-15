import React from 'react';

interface InputRow {
    [key: string]: string
}

export const createOptions = (rows: Array<InputRow>, keyCol: string, displayCol: string, addOtherOption?: boolean, formatColName ?: string) => {
    if (!rows)
        return undefined;

    let options = [];

    Object.assign(options, rows)
    if (addOtherOption) {
        options[rows.length] = {[displayCol]: 'Other'};
    }

    return options.map((row) => {
        return (
            <option key={row[keyCol] + "-" + row[displayCol]} value={row[keyCol]}>
                {
                    row[displayCol] + (formatColName && row[formatColName] ? " (" + row[formatColName] + ")" : '')
                }
            </option>
        );
    });
}

export const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "decimal",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(value);
}