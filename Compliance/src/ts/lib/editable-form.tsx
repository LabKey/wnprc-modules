import * as React from "react";
import Component = React.Component;
import {EditableSection} from "./editable-section";
import * as toastr from "toastr";
import * as rsvp from "rsvp";

export interface FormProvider<FORM> {
    title: string;
    getFormData: (id: string) => Promise<FORM>;
    saveFormData: (id: string, form: FORM | null) => Promise<FORM>;
    cloneForm: (form: FORM) => FORM;
    renderForm: (form: FORM | null, enabled: boolean) => JSX.Element;
}

export interface SimpleFormProps<T> {
    revision_id: string;
    startEdit?: () => void;
    endEdit?: () => void;
    formProvider: FormProvider<T>;
}

type Status = "loading" | "saving" | "editing" | "viewing" | "error"

interface SimpleFormState<FORM> {
    status: Status;
    form: FORM | null;
    errorMessage: string | null;
}

interface BasicForm {
    fromJSON: (data: any) => BasicForm;
}

export class SimpleFormEditor<FORM> extends Component<SimpleFormProps<FORM>, SimpleFormState<FORM>> {
    originalForm: FORM | null;

    constructor(props: SimpleFormProps<FORM>) {
        super(props);

        let state: SimpleFormState<FORM> = {
            status: "loading",
            form: null,
            errorMessage: null
        };
        this.state = state;

        this.load();

        this.load = this.load.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    load() {
        if (this.state.status != 'loading') {
            this.setState({
                status: 'loading'
            });
        }

        this.props.formProvider.getFormData(this.props.revision_id).then((formData: FORM) => {
            this.handleLoad(formData);
        });
    }

    handleLoad(info: FORM) {
        this.originalForm = this.props.formProvider.cloneForm(info);

        this.setState({
            status: 'viewing',
            form: info
        });
    }

    edit() {
        this.setState({
            status: 'editing'
        });

        if (this.props.startEdit) {
            this.props.startEdit();
        }
    }

    save() {
        this.setState({
            status: 'saving'
        });

        this.props.formProvider.saveFormData(this.props.revision_id, this.state.form).then((rawData: FORM) => {
            this.originalForm = (this.state.form == null) ? null : this.props.formProvider.cloneForm(this.state.form);

            this.setState({
                status: 'viewing'
            });

            toastr.success("Successfully saved!");
        });

        if (this.props.endEdit) {
            this.props.endEdit();
        }
    }

    cancel() {
        this.setState({
            status: 'viewing',
            form: this.originalForm
        });

        if (this.props.endEdit) {
            this.props.endEdit();
        }
    }

    render() {
        let status = this.state.status;
        let disabled = (status != 'editing');

        return (
            <EditableSection title={this.props.formProvider.title} editMode={(status == 'editing') ? true : (status == 'viewing') ? false : null}
                             handleEdit={this.edit} handleSave={this.save} handleCancel={this.cancel}>
                {this.props.formProvider.renderForm(this.state.form, !disabled)}
            </EditableSection>
        )
    }
}