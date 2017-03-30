import * as React from "react";
import Component = React.Component;
import {BasicInfoForm} from "../../../../build/generated-ts/GeneratedFromJava";
import {
    buildURLWithParams, getCurrentContainer,
    urlFromAction
} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON, postJSON} from "WebUtils/API";
import {TextInput} from "./fields/text-input";
import {FormProvider, SimpleFormEditor, SimpleFormProps} from "../editable-form";
import {URLForAction} from "../../../../../WebUtils/build/generated-ts/GeneratedFromJava";

export interface ProtocolBasicInfoProps {
    revision_id: string;
    startEdit?: () => void;
    endEdit?: () => void;
    getURL: URLForAction;
    saveURL: URLForAction;
}

class BasicFormEditor extends SimpleFormEditor<BasicInfoForm> {

}

export class ProtocolBasicInfoEditor extends React.Component<ProtocolBasicInfoProps, {}> {
    render() {
        let basicInfoFormProvider: FormProvider<BasicInfoForm> = {
            title: "Basic Info",

            getFormData: (id: string) => {
                let url = urlFromAction(this.props.getURL, {'revision_id': id});

                return getJSON(url, {}).then((rawData: any) => {
                    return BasicInfoForm.fromJSON(rawData);
                });
            },

            saveFormData: (id: string, form: BasicInfoForm | null) => {
                if (form == null) {
                    return Promise.resolve(new BasicInfoForm());
                }

                let url = urlFromAction(this.props.saveURL, {'revision_id': id});

                return postJSON(url, form as Object, {});
            },

            cloneForm: (form: BasicInfoForm) => {
                return form.clone();
            },

            renderForm: (form: BasicInfoForm, updateForm: (form: BasicInfoForm) => void, enabled: boolean) => {
                if (form == null) {
                    form = new BasicInfoForm();
                }

                let handleChange = (propertyName: string, value: string): void => {
                    if (propertyName in form) {
                        (form as any)[propertyName] = value;
                        updateForm(form);
                    }
                };

                return (
                    <fieldset className="form-horizontal" disabled={!enabled}>
                        <TextInput editable={enabled}
                                   value={form.principal_investigator || ''}
                                   label="Principal Investigator"
                                   property_name="principal_investigator"
                                   handleChange={handleChange}
                        />
                        <TextInput editable={enabled} value={form.spi_primary || ''}   label="SPI Primary"   property_name="spi_primary"   handleChange={handleChange} />
                        <TextInput editable={enabled} value={form.spi_secondary || ''} label="SPI Secondary" property_name="spi_secondary" handleChange={handleChange} />
                    </fieldset>
                )
            }
        };

        return (
            <BasicFormEditor formProvider={basicInfoFormProvider} {...this.props} />
        )
    }
}