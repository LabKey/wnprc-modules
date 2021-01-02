import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {getData} from "../actions";
import {createOptions, formatCurrency} from "./Utils";

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
    hasError?: boolean;
}

export const DescriptionInput: FC<InputProps> = (props) => {

    const { onChange, value, hasError } = props;

    const onTextChange = useCallback((evt) => {
        onChange('item', evt.target.value);
    },[onChange]);

    return (
        <input
            className= {'line-item-row-input description-input form-control ' + (hasError ? 'field-validation-error' : '')}
            value={value}
            onChange={onTextChange}
            id="item-description-id"
        />
    );
}

export const UnitInput : FC<InputProps> = (props) => {

    const { onChange, value, hasError } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    //TODO: only want getData to get dropdown options to be called once, and not at each Item Row rendering
    useEffect(() => {
        getData('ehr_purchasing', 'itemUnits', 'itemUnit, rowId').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'itemUnit', false), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('itemUnit', evt.target.value);
    },[onChange]);

    return (
        <select
            className={'line-item-row-input unit-input form-control ' + (hasError ? 'field-validation-error' : '')}
            value={value}
            onChange={onValueChange}
        >
            <option hidden value="">Select</option>
            {options}
        </select>
    );
}

interface NumericInputProps {
    value: number;
    onChange: (colName, value) => void;
    hasError?: boolean;
}

export const UnitCostInput: FC<NumericInputProps> = (props) => {

    const { onChange, value, hasError } = props;

    const onValueChange = useCallback((evt) => {
        onChange('unitCost', evt.target.value);
    },[onChange]);

    return (
        <input
            className= {'line-item-row-input unit-Cost-input form-control ' + (hasError ? 'field-validation-error' : '')}
            value={value}
            onChange={onValueChange}
            id="unit-Cost-id"
            pattern="[0-9]*"
            type='number'
        />
    );
}

export const UnitQuantityInput: FC<NumericInputProps> = (props) => {

    const { onChange, value, hasError } = props;

    const onValueChange = useCallback((evt) => {
        onChange('quantity', evt.target.value);
    },[onChange]);

    return (
        <input
            className={'line-item-row-input quantity-input form-control ' + (hasError ? 'field-validation-error' : '')}
            value={value}
            onChange={onValueChange}
            pattern="[0-9]*"
            id="unit-quantity-id"
            type='number'
        />
    );
}

interface SubtotalInputProps {
    unitCost: number;
    quantity: number;
}

export const SubtotalInput: FC<SubtotalInputProps> = (props) => {

    const { unitCost, quantity } = props;
    const [subtotal, setSubtotal] = useState<number>(0);

    useEffect(() => {
        if (unitCost  && quantity) {
            setSubtotal(unitCost * quantity);
        }
    },[]);

    useMemo(() => {
        setSubtotal(unitCost * quantity);
    }, [unitCost, quantity]);

    return (
        <input
            className='line-item-row-input subtotal-input form-control'
            value={formatCurrency(subtotal)}
            disabled={true}
            id="item-subtotal-id"
            type='number'
        />
    );
}

export const ControlledSubstance: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onInputChange = useCallback((evt) => {
        onChange('controlledSubstance', evt.target.checked);
    },[onChange]);

    return (
        <input
            className='line-item-row-input controlled-sub-input'
            type="checkbox"
            checked={value}
            onChange={onInputChange}
            id="control-substance-id"
        />
    );
}