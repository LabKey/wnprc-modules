import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';

import { getData } from '../actions';

import { createOptions } from './Utils';
import { PurchasingFormInput } from './PurchasingFormInput';

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
    hasError?: boolean;
    isReorder?: boolean;
}

export const AssignedToInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReorder } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getData('core', 'Users', 'UserId, DisplayName, Groups', 'DisplayName').then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'UserId', 'DisplayName'), [dropDownVals]);

    const onValueChange = useCallback(
        evt => {
            onChange('assignedTo', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Assigned to">
                <select
                    className={'assigned-to-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={isReorder ? "" : value}
                    onChange={onValueChange}
                >
                    <option hidden value="">
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
});

export const PaymentOptionInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReorder } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getData('wnprc_purchasing', 'paymentOptions', 'rowId, paymentOption', 'paymentOption').then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'rowId', 'paymentOption'), [dropDownVals]);

    const onValueChange = useCallback(
        evt => {
            onChange('paymentOption', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Purchase option">
                <select
                    className={'payment-option-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={isReorder ? "" : value}
                    onChange={onValueChange}
                >
                    <option hidden value="">
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
});

export const StatusInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError, isReorder } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getData('core', 'qcState', 'RowId, Label').then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'RowId', 'Label'), [dropDownVals]);

    const onValueChange = useCallback(
        evt => {
            onChange('qcState', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Status">
                <select
                    className={'status-input form-control ' + (hasError ? 'field-validation-error' : '')}
                    value={isReorder ? "" : value}
                    onChange={onValueChange}
                >
                    <option hidden value="">
                        Select
                    </option>
                    {options}
                </select>
            </PurchasingFormInput>
        </div>
    );
});

export const ProgramInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReorder } = props;
    const onTextChange = useCallback(
        evt => {
            onChange('program', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Program">
                <textarea
                    className="program-input form-control"
                    value={isReorder ? "4" : value}
                    onChange={onTextChange}
                    id="program-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const ConfirmationInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReorder } = props;
    const onTextChange = useCallback(
        evt => {
            onChange('confirmationNum', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Confirmation no.">
                <textarea
                    className="confirmation-input form-control"
                    value={isReorder ? null : value}
                    onChange={onTextChange}
                    id="confirmation-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const InvoiceInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReorder } = props;
    const onTextChange = useCallback(
        evt => {
            onChange('invoiceNum', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Invoice no.">
                <textarea
                    className="invoice-input form-control"
                    value={isReorder ? null : value}
                    onChange={onTextChange}
                    id="invoice-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const OrderDateInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReorder } = props;
    const onValueChange = useCallback(
        date => {
            onChange('orderDate', date);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Order date">
                <DatePicker
                    dateFormat="yyyy-MM-dd"
                    selected={value && !isReorder ? new Date(value) : null}
                    onChange={onValueChange}
                    id="order-date-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const CardPostDateInput: FC<InputProps> = memo(props => {
    const { onChange, value, isReorder } = props;
    const onValueChange = useCallback(
        date => {
            onChange('cardPostDate', date);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Card post date">
                <DatePicker
                    dateFormat="yyyy-MM-dd"
                    selected={value && !isReorder ? new Date(value) : null}
                    onChange={onValueChange}
                    id="card-post-date-id"
                />
            </PurchasingFormInput>
        </div>
    );
});
