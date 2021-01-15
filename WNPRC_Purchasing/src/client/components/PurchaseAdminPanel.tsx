import React, {FC, memo, useCallback} from 'react';
import {Form, Panel} from 'react-bootstrap';
import {PurchaseAdminModel} from '../model';
import {
    AssignedToInput, CreditCardOptionInput, ConfirmationInput, InvoiceInput, ProgramInput, StatusInput
} from "./PurchaseAdminPanelInputs";

interface Props
{
    model: PurchaseAdminModel;
    onInputChange: (model: PurchaseAdminModel) => void;
}

export const PurchaseAdminPanel: FC<Props> = memo((props) => {

    const {model, onInputChange} = props;
    const onValueChange = useCallback((colName, value) => {

        // onInputChange(updatedModel);
    }, [model, onInputChange]);

    return (
        <Panel
            className='panel panel-default'
            expanded={true}
            onToggle={function () {
            }} // this is added to suppress JS warning about providing an expanded prop without onToggle
        >
            <div className='bg-primary'>
                <Panel.Heading>
                    <div className='panel-title'>Purchase Admin Input</div>
                </Panel.Heading>
            </div>
            <Form>
                <AssignedToInput
                    value={model.assignedTo}
                    hasError={false}
                    onChange={onValueChange}
                />
                <CreditCardOptionInput
                    value={model.creditCardOption}
                    hasError={false}
                    onChange={onValueChange}
                />
                <StatusInput
                    value={model.qcState}
                    hasError={false}
                    onChange={onValueChange}
                />
                <ProgramInput
                    value={model.program}
                    hasError={false}
                    onChange={onValueChange}
                />
                <ConfirmationInput
                    value={model.confirmationNum}
                    hasError={false}
                    onChange={onValueChange}
                />
                <InvoiceInput
                    value={model.invoiceNum}
                    hasError={false}
                    onChange={onValueChange}
                />
            </Form>
            {model.errorMsg &&
            <div className='alert alert-danger'>
                {model.errorMsg}
            </div>
            }
        </Panel>
    );
})