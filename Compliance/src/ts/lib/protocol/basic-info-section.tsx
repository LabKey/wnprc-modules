import * as React from "react";
import Component = React.Component;
import {BasicInfoForm} from "../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON, postJSON} from "WebUtils/API";
import {TextInput} from "./fields/text-input";
import {FormProvider, SimpleFormEditor, SimpleFormProps} from "../editable-form";

let basicInfoFormProvider: FormProvider<BasicInfoForm> = {
    title: "Basic Info",

    getFormData: (id: string) => {

        let url = buildURLWithParams('wnprc_compliance-protocol-api', 'getBasicInfo', getCurrentContainer(), {'revision_id': id});

        return getJSON(url, {}).then((rawData: any) => {
            return BasicInfoForm.fromJSON(rawData);
        });
    },

    saveFormData: (id: string, form: BasicInfoForm | null) => {
        if (form == null) {
            return Promise.resolve(new BasicInfoForm());
        }

        let url = buildURLWithParams('wnprc_compliance-protocol-api', 'saveBasicInfo', getCurrentContainer(), {'revision_id': id});

        return postJSON(url, form as Object, {});
    },

    cloneForm: (form: BasicInfoForm) => {
        return form.clone();
    },

    renderForm: (form: BasicInfoForm, enabled: boolean) => {
        if (form == null) {
            form = new BasicInfoForm();
        }

        return (
            <fieldset className="form-horizontal" disabled={!enabled}>
                <TextInput editable={enabled} value={form.principal_investigator || ''} label="Principal Investigator" property_name="principal_investigator"  />
                <TextInput editable={enabled} value={form.spi_primary || ''} label="SPI Primary" property_name="spi_primary" />
                <TextInput editable={enabled} value={form.spi_secondary || ''} label="SPI Secondary" property_name="spi_secondary" />
            </fieldset>
        )
    }
};

export interface ProtocolBasicInfoProps {
    revision_id: string;
    startEdit?: () => void;
    endEdit?: () => void;
}

class BasicFormEditor extends SimpleFormEditor<BasicInfoForm> {

}

export class ProtocolBasicInfoEditor extends React.Component<ProtocolBasicInfoProps, {}> {
    render() {
        return (
            <BasicFormEditor formProvider={basicInfoFormProvider} {...this.props} />
        )
    }
}