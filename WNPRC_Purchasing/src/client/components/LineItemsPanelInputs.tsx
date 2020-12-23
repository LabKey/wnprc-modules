import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {getDropdownOptions} from "../action";
import {createOptions} from "./Utils";

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
}

export const DescriptionInput: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('item', evt.target.value);
    },[onChange]);

    return (
        <input
            className='line-item-row-input description-input'
            value={value}
            onChange={onTextChange}
            id="item-description-id"
        />
    );
}

export const UnitInput : FC<InputProps> = (props) => {

    const { onChange, value } = props;
    const [dropDownVals, setDropDownVals] = useState<Array<any>>();

    //TODO: only want getDropdownOptions to be called once, and not at each Item Row rendering
    useEffect(() => {
        getDropdownOptions('ehr_purchasing', 'itemUnits', 'itemUnit').then(vals => {
            setDropDownVals(vals)
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'itemUnit', false), [dropDownVals]);

    const onValueChange = useCallback((evt) => {
        onChange('unit', evt.target.value);
    },[onChange]);

    return (
        <select
            className='line-item-row-input unit-input'
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
}

export const UnitPriceInput: FC<NumericInputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('unitPrice', evt.target.value);
    },[onChange]);

    return (
        <input
            className='line-item-row-input unit-price-input'
            value={value}
            onChange={onTextChange}
            id="unit-price-id"
            type='number'
        />
    );
}

export const UnitQuantityInput: FC<NumericInputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('quantity', evt.target.value);
    },[onChange]);

    return (
        <input
            className='line-item-row-input quantity-input'
            value={value}
            onChange={onTextChange}
            id="unit-quantity-id"
        />
    );
}

interface SubtotalInputProps {
    unitPrice: number;
    quantity: number;
}

export const SubtotalInput: FC<SubtotalInputProps> = (props) => {

    const { unitPrice, quantity } = props;
    const [subtotal, setSubtotal] = useState<number>(0);

    useEffect(() => {
        if (unitPrice  && quantity) {
            setSubtotal(unitPrice * quantity);
        }
    },[]);

    useMemo(() => {
        setSubtotal(unitPrice * quantity);
    }, [unitPrice, quantity]);

    return (
        <input
            className='line-item-row-input subtotal-input'
            value={subtotal}
            disabled={true}
            id="item-subtotal-id"
            type='number'
        />
    );
}

export const ControlledSubstance: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onInputChange = useCallback((evt) => {
        onChange('controlledSubstance', evt.target.value);
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