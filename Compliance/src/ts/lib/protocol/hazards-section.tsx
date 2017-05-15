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
import ChangeEvent = React.ChangeEvent;
import {newUUID} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/Util";
import * as s from "underscore.string";

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
    private _id: string = newUUID();

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

                type CheckboxFieldName = keyof HazardsForm;
                let checkboxNames: CheckboxFieldName[] = ["biological", "chemical", "physical", "other"];
                let checkboxes = checkboxNames.map((fieldName: CheckboxFieldName) => {
                    let id = `${this._id}-${fieldName}`;

                    let handleChange = (name: CheckboxFieldName) => {
                        return (e: ChangeEvent<HTMLInputElement>) => {
                            let target = e.target;
                            let value = target.type === 'checkbox' ? target.checked : target.value;
                            form[name] = value;

                            if (name == 'other' && !value) {
                                form.other_notes = '';
                            }

                            updateForm(form);
                        };
                    };

                    let _checkInput: HTMLInputElement;

                    return (
                        <div className="checkbox checkbox-primary col-sm-3" key={fieldName}>
                            <div className="form-group" onClick={() => {$(_checkInput).click()}}>
                                <input type="checkbox" ref={(input) => {_checkInput = input}} checked={!!form[fieldName]} name={id} onChange={handleChange(fieldName)} />

                                <label htmlFor={id}>
                                    {s.titleize(fieldName)}
                                </label>
                            </div>
                        </div>
                    )
                });

                let handleOtherNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
                    form.other_notes = e.target.value;
                    updateForm(form);
                };

                return (
                    <fieldset className="form" disabled={!enabled}>
                        <div className="container-fluid">
                            <div className="row form-inline" style={{marginBottom: '15px'}}>
                                {checkboxes}
                            </div>

                            <div className="row">
                                <div className="form-group col-sm-12">
                                    <label className="control-label">Explain Other Hazards:</label>
                                    <textarea disabled={!form.other} value={form.other_notes || ''} onChange={handleOtherNotesChange} className="form-control" style={{resize: 'none'}} />
                                </div>
                            </div>

                        </div>
                    </fieldset>
                )
            }
        };

        return (
            <HazardsFormEditor formProvider={hazardFormProvider} {...{
                revision_id: this.props.revision_id,
                startEdit:   this.props.startEdit,
                endEdit:     this.props.endEdit
            }} />
        )
    }
}