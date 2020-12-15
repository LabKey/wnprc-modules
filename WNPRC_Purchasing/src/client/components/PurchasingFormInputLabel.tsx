import React from 'react';

interface Props {
    label: string;
    required?: boolean;
}

export function PurchasingFormInputLabel(props: Props) {
    const { label, required } = this.props;
    return (
        <>
            <span>
                <label title={label}></label>
                {required ? ' *' : ''}
            </span>
        </>
    );
}