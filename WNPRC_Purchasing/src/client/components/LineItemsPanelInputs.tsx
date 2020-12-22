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
    },[]);

    return (
        <textarea
            style={{resize:'none', width: '575px', height: '30px'}}
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
    },[]);

    return (
        <select style={{resize: 'none', position:'absolute', marginLeft:'45px', width: '100px', height: '30px'}} value={value}
                onChange={onValueChange}>
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
    },[]);

    return (
        <input
            style={{resize: 'none', position:'absolute', marginLeft:'200px', width: '120px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="unit-price-id"
        />
    );
}

export const UnitQuantityInput: FC<NumericInputProps> = (props) => {

    const { onChange, value } = props;

    const onTextChange = useCallback((evt) => {
        onChange('quantity', evt.target.value);
    },[]);

    return (
        <input
            style={{resize: 'none', position:'absolute', marginLeft:'355px', width: '120px', height: '30px'}}
            value={value}
            onChange={onTextChange}
            id="unit-quantity-id"
        />
    );
}

interface SubtotalInputProps {
    unitPrice: number;
    quantity: number;
    onChange: (colName, value) => void;
}

export const SubtotalInput: FC<SubtotalInputProps> = (props) => {

    const { onChange, unitPrice, quantity } = props;
    const [subtotal, setSubtotal] = useState<number>();

    useEffect(() => {
        if (unitPrice  && quantity) {
            setSubtotal(unitPrice * quantity);
        }
    },[]);

    // const onTextChange = useCallback((evt) => {
    //     onChange('subTotal', evt.target.value);
    // },[]);

    return (
        <input
            style={{resize: 'none', position:'absolute', marginLeft:'510px', width: '120px', height: '30px'}}
            value={subtotal}
            disabled={true}
            placeholder='price x quantity'
            // onChange={onTextChange}
            id="item-subtotal-id"
        />
    );
}

export const ControlledSubstance: FC<InputProps> = (props) => {

    const { onChange, value } = props;

    const onInputChange = useCallback((evt) => {
        onChange('controlledSubstance', evt.target.value);
    },[]);

    return (
        <input
            style={{marginLeft: '725px', position:'absolute', marginTop:'10px'}}
            type="checkbox"
            checked={value}
            onChange={onInputChange}
            id="control-substance-id"
        />
    );
}