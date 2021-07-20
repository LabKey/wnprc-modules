import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';

import {getData, getFolderAdmins} from '../actions';

import { createOptions } from './Utils';
import { PurchasingFormInput } from './PurchasingFormInput';

interface InputProps {
    value: any;
    onChange: (colName, value) => void;
    hasError?: boolean;
}

export const AssignedToInput: FC<InputProps> = memo(props => {
    const { onChange, value, hasError } = props;
    const [dropDownVals, setDropDownVals] = useState<any[]>();

    useEffect(() => {
        getFolderAdmins().then(vals => {
            setDropDownVals(vals);
        });
    }, []);

    const options = useMemo(() => createOptions(dropDownVals, 'userId', 'displayName'), [dropDownVals]);

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
                    value={value}
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
    const { onChange, value, hasError } = props;
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
                    value={value}
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
    const { onChange, value, hasError } = props;
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
                    value={value}
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

export const RejectReasonInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;

    const onTextChange = useCallback(
        evt => {
            onChange('rejectReason', evt.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <PurchasingFormInput label="Reason for rejection">
                <textarea
                    className={ 'reason-for-rejection-input form-control'}
                    value={value}
                    onChange={onTextChange}
                    id="reason-for-rejection-id"
                    placeholder="Please provide a reason for rejection"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const ProgramInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;
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
                    value={value}
                    onChange={onTextChange}
                    id="program-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const ConfirmationInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;
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
                    value={value}
                    onChange={onTextChange}
                    id="confirmation-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const InvoiceInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;
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
                    value={value}
                    onChange={onTextChange}
                    id="invoice-input-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const OrderDateInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;
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
                    selected={value ? new Date(value) : null}
                    onChange={onValueChange}
                    id="order-date-id"
                />
            </PurchasingFormInput>
        </div>
    );
});

export const CardPostDateInput: FC<InputProps> = memo(props => {
    const { onChange, value } = props;
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
                    selected={value ? new Date(value) : null}
                    onChange={onValueChange}
                    id="card-post-date-id"
                />
            </PurchasingFormInput>
        </div>
    );
});
