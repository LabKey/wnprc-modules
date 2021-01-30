import React, {FC, memo, useCallback} from 'react';
import {Form, Panel, Row, Col} from 'react-bootstrap';
import {PurchaseAdminModel} from '../model';
import {
    AssignedToInput,
    CreditCardOptionInput,
    ConfirmationInput,
    InvoiceInput,
    ProgramInput,
    StatusInput,
    OrderDateInput,
    CardPostDateInput
} from "./PurchaseAdminPanelInputs";
import produce, {Draft} from "immer";

interface Props
{
    model: PurchaseAdminModel;
    onInputChange: (model: PurchaseAdminModel) => void;
}

export const PurchaseAdminPanel: FC<Props> = memo((props) => {

    const {model, onInputChange} = props;
    const onValueChange = useCallback((colName, value) => {

        const updatedModel = produce(model, (draft: Draft<PurchaseAdminModel>) => {
            draft[colName] = value;
        });
        onInputChange(updatedModel);
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
            <Form className='form-margin'>
                <Row>
                    <Col xs={11} lg={6}>
                        <AssignedToInput
                            value={model.assignedTo}
                            onChange={onValueChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <ProgramInput
                            value={model.program}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <CreditCardOptionInput
                            value={model.creditCardOption}
                            onChange={onValueChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <ConfirmationInput
                            value={model.confirmationNum}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <StatusInput
                            value={model.qcState}
                            onChange={onValueChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <InvoiceInput
                            value={model.invoiceNum}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <OrderDateInput
                            value={model.orderDate}
                            onChange={onValueChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <CardPostDateInput
                            value={model.cardPostDate}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
            </Form>
            {model.errorMsg &&
            <div className='alert alert-danger'>
                {model.errorMsg}
            </div>
            }
        </Panel>
    );
})