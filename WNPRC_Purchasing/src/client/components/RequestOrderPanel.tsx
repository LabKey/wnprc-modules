import React, {FC, memo, useCallback, useState} from 'react';
import {Form, Panel, Row, Col} from 'react-bootstrap';
import {RequestOrderModel, VendorModel} from '../model';
import {Draft, produce} from 'immer';
import {
    AccountInput, AccountOtherInput, VendorInput, BusinessPurposeInput,
    SpecialInstructionInput, ShippingDestinationInput, DeliveryAttentionInput,
} from "./RequestOrderPanelInputs";

interface Props
{
    model: RequestOrderModel;
    onInputChange: (model: RequestOrderModel) => void;
}

export const RequestOrderPanel: FC<Props> = memo((props) => {

    const {model, onInputChange} = props;

    const [showOtherAcct, setShowOtherAcct] = useState<boolean>(false);

    const onModelChange = useCallback((changedModel: RequestOrderModel) => {
        onInputChange(changedModel);
    },[model]);

    const onValueChange = useCallback((colName, value) => {
        const updatedModel = produce(model, (draft: Draft<RequestOrderModel>) => {
            draft[colName] = value;
            if (model.errors?.length > 0) {
                let updatedErrors = model.errors.filter((field) => field.fieldName !== colName);
                draft['errors'] = updatedErrors;
            }
            if (draft['errors']?.length === 0) {
                draft['errorMsg'] = undefined;
            }
            // if 'Other' was selected before, during which user added a New vendor from the popup, and then user decided to select a different vendor - then do cleanup on newVendor obj
            if (colName === 'vendorName' && value !== 'Other') {
                draft['newVendor'] = VendorModel.create();
            }
        });
        if (updatedModel.account === 'Other') {
            setShowOtherAcct(true);
        }
        else {
            setShowOtherAcct(false);
        }

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
                <div className='panel-title'>Request Order</div>
            </Panel.Heading>
            </div>
            <Form className='form-margin'>
                <Row>
                        <Col xs={11} lg={6}>
                            <AccountInput
                                value={model.account}
                                hasError={model.errors?.find((field) => field.fieldName === 'account')}
                                onChange={onValueChange}
                            />
                            {
                                (showOtherAcct || model.account === "Other") &&
                                <AccountOtherInput
                                        value={model.accountOther}
                                        hasError={model.errors?.find((field) => field.fieldName === 'accountOther')}
                                        hasOtherAcctWarning={!!model.otherAcctAndInvesWarning}
                                        onChange={onValueChange}
                                />
                            }
                        </Col>
                        <Col xs={11} lg={6}>
                            <ShippingDestinationInput
                                value={model.shippingDestination}
                                hasError={model.errors?.find((field) => field.fieldName === 'shippingDestination')}
                                onChange={onValueChange}
                            />
                        </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <VendorInput
                            hasError={model.errors?.find((field) => field.fieldName === 'vendor')}
                            onChange={onValueChange}
                            model={model}
                            onModelChange={onModelChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <DeliveryAttentionInput
                            value={model.deliveryAttentionTo}
                            hasError={model.errors?.find((field) => field.fieldName === 'deliveryAttentionTo')}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} lg={6}>
                        <BusinessPurposeInput
                            value={model.purpose}
                            hasError={model.errors?.find((field) => field.fieldName === 'purpose')}
                            onChange={onValueChange}
                        />
                    </Col>
                    <Col xs={11} lg={6}>
                        <SpecialInstructionInput
                            value={model.comments}
                            onChange={onValueChange}
                        />
                    </Col>
                </Row>
                {/*<AccountInput*/}
                {/*    value={model.account}*/}
                {/*    hasError={model.errors?.find((field) => field.fieldName === 'account')}*/}
                {/*    onChange={onValueChange}*/}
                {/*/>*/}
                {/*{*/}
                {/*    (showOtherAcct || model.account === "Other") &&*/}
                {/*    <AccountOtherInput*/}
                {/*            value={model.accountOther}*/}
                {/*            hasError={model.errors?.find((field) => field.fieldName === 'accountOther')}*/}
                {/*            hasOtherAcctWarning={!!model.otherAcctAndInvesWarning}*/}
                {/*            onChange={onValueChange}*/}
                {/*    />*/}
                {/*}*/}
                {/*<VendorInput*/}
                {/*    hasError={model.errors?.find((field) => field.fieldName === 'vendor')}*/}
                {/*    onChange={onValueChange}*/}
                {/*    model={model}*/}
                {/*    onModelChange={onModelChange}*/}
                {/*/>*/}
                {/*<BusinessPurposeInput*/}
                {/*    value={model.purpose}*/}
                {/*    hasError={model.errors?.find((field) => field.fieldName === 'purpose')}*/}
                {/*    onChange={onValueChange}*/}
                {/*/>*/}
                {/*<SpecialInstructionInput*/}
                {/*    value={model.comments}*/}
                {/*    onChange={onValueChange}*/}
                {/*/>*/}
                {/*<ShippingDestinationInput*/}
                {/*    value={model.shippingDestination}*/}
                {/*    hasError={model.errors?.find((field) => field.fieldName === 'shippingDestination')}*/}
                {/*    onChange={onValueChange}*/}
                {/*/>*/}
                {/*<DeliveryAttentionInput*/}
                {/*    value={model.deliveryAttentionTo}*/}
                {/*    hasError={model.errors?.find((field) => field.fieldName === 'deliveryAttentionTo')}*/}
                {/*    onChange={onValueChange}*/}
                {/*/>*/}
            </Form>
            {
                model.errorMsg &&
                <div className='alert alert-danger'>
                    {model.errorMsg}
                </div>
            }
        </Panel>
    );
})