import React from 'react';

interface InputRow {
    [key: string]: string
}

export const createOptions = (rows: Array<InputRow>, colName: string, addOtherOption: boolean, formatColName ?: string) => {
    if (!rows)
        return undefined;

    let options = [];

    Object.assign(options, rows)
    if (addOtherOption) {
        options[rows.length] = {[colName]: 'Other'};
    }

    return options.map((row, index) => {
        return (
            <option key={index + "-" + row[colName]} value={row[colName]}>
                {
                    row[colName] + (formatColName && row[formatColName] ? " (" + row[formatColName] + ")" : '')
                }
            </option>
        );
    });
}

export const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "decimal",
        currency: "USD",
        minimumFractionDigits: 2
    });
    return formatter.format(value);
}