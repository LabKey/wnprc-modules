import * as React from "react";
import Component = React.Component;
import {BasicInfoForm} from "../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON, postJSON} from "WebUtils/API";
import {EditableSection} from "../editable-section";
import {TextInput} from "./fields/text-input";
import * as toastr from "toastr";

export interface ProtocolBasicInfoProps {
    revision_id: string;
    startEdit?: () => void;
    endEdit?: () => void;
}

type Status = "loading" | "saving" | "editing" | "viewing" | "error"

interface ProtocolBasicInfoState {
    status: Status;
    form: BasicInfoForm | null;
    errorMessage: string | null;
}

export class ProtocolBasicInfoEditor extends Component<ProtocolBasicInfoProps, ProtocolBasicInfoState> {
    originalForm: BasicInfoForm | null;

    constructor(props: any) {
        super(props);

        let state: ProtocolBasicInfoState = {
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

        let url = buildURLWithParams('wnprc_compliance-protocol-api', 'getBasicInfo', getCurrentContainer(), {'revision_id': this.props.revision_id});

        getJSON(url, {}).then((rawData: any) => {
            let data = BasicInfoForm.fromJSON(rawData);

            this.handleLoad(data);
        })
    }

    handleLoad(info: BasicInfoForm) {
        this.originalForm = info.clone();

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

        let url = buildURLWithParams('wnprc_compliance-protocol-api', 'saveBasicInfo', getCurrentContainer(), {'revision_id': this.props.revision_id});

        postJSON(url, this.state.form as Object, {}).then((rawData: any) => {
            this.originalForm = (this.state.form == null) ? null : this.state.form.clone();

            this.setState({
                status: 'viewing'
            });

            toastr.success("Successfully saved basic info");
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
        let form: BasicInfoForm = this.state.form || new BasicInfoForm();

        return (
            <EditableSection title="Basic Info" editMode={(status == 'editing') ? true : (status == 'viewing') ? false : null}
                             handleEdit={this.edit} handleSave={this.save} handleCancel={this.cancel}>
                <fieldset className="form-horizontal" disabled={disabled}>
                    <TextInput editable={!disabled} value={form.principal_investigator || ''} label="Principal Investigator" property_name="principal_investigator"  />
                    <TextInput editable={!disabled} value={form.spi_primary || ''} label="SPI Primary" property_name="spi_primary" />
                    <TextInput editable={!disabled} value={form.spi_secondary || ''} label="SPI Secondary" property_name="spi_secondary" />
                </fieldset>
            </EditableSection>
        )
    }
}