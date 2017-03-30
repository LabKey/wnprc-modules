import * as React from "react";
import Component = React.Component;
import {BasicInfoForm, HazardsForm} from "../../../../build/generated-ts/GeneratedFromJava";
import {
    buildURLWithParams, getCurrentContainer,
    urlFromAction
} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON, postJSON} from "WebUtils/API";
import {TextInput} from "./fields/text-input";
import {FormProvider, SimpleFormEditor, SimpleFormProps} from "../editable-form";
import {URLForAction} from "../../../../../WebUtils/build/generated-ts/GeneratedFromJava";

export interface HazardsEditorProps {
    revision_id: string;
    startEdit?: () => void;
    endEdit?: () => void;
    getURL: URLForAction;
    saveURL: URLForAction;
}

class HazardsFormEditor extends SimpleFormEditor<HazardsForm> {

}

export class HazardsEditor extends React.Component<HazardsEditorProps, {}> {
    render() {
        let hazardFormProvider: FormProvider<HazardsForm> = {
            title: "Hazards",

            getFormData: (id: string) => {
                let url = urlFromAction(this.props.getURL, {'revision_id': id});

                return getJSON(url, {}).then((rawData: any) => {
                    return HazardsForm.fromJSON(rawData);
                });
            },

            saveFormData: (id: string, form: HazardsForm | null) => {
                if (form == null) {
                    return Promise.resolve(new HazardsForm());
                }

                let url = urlFromAction(this.props.saveURL, {'revision_id': id});

                return postJSON(url, form as Object, {});
            },

            cloneForm: (form: HazardsForm) => {
                return form.clone();
            },

            renderForm: (form: HazardsForm, updateForm: (form: HazardsForm) => void, enabled: boolean) => {
                if (form == null) {
                    form = new HazardsForm();
                }

                return (
                    <fieldset className="form-horizontal" disabled={!enabled}>
                        <h1>Hello</h1>
                    </fieldset>
                )
            }
        };

        return (
            <HazardsFormEditor formProvider={hazardFormProvider} {...this.props} />
        )
    }
}