import React, { FC } from 'react';
import DatePicker from 'react-datepicker';

import { Form, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import setFieldData from 'final-form-set-field-data';
import createDecorator from 'final-form-calculate';

import {
    submitAnimalRequest
} from '../../query/helpers';
import {getEHRData} from '../../query/actions';

const required = value => (value ? undefined : <span data-tooltip="Required">❗️</span>);

const renderField = (props) => (
    <div className="row top-buffer">
        <div className={props.meta.asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-5 form-control-label"> {props.label}{props.tooltip && (<a><sup><span id="help-tooltip" data-tooltip={props.tooltip}>?️</span></sup></a>)}: </label>
            <input min={props.min} {...props.required==true ? props.required : ''} className={`col-xs-5 form-control-${props.type}`}  type={props.type} {...props.input} />
            {props.meta.touched && ((props.meta.error && <span>{props.meta.error}</span>))}
        </div>
    </div>
);

const renderSelectField = (props) => {
    return(
        <div className="row top-buffer">
            <div className={props.meta.asyncValidating ? 'async-validating' : ''}>
                <label className="col-xs-5 form-control-label"> {props.label}{props.tooltip && (
                    <a><sup><span id="help-tooltip" data-tooltip={props.tooltip}>?️</span></sup></a>)}: </label>
                <select {...props.required == true ? props.required : ''} className="col-xs-5 form-control-input" {...props.input}>
                    {props.options}
                </select>
                {props.meta.touched && ((props.meta.error && <span>{props.meta.error}</span>))}
            </div>
        </div>
    );
};

{/*Have to use implicit props to workaround the typescript restrictions in FieldRenderProps (react-final-form lib)*/}
const renderDateTimePicker = (props) => (
  <div className="row top-buffer">
      <label className="col-xs-5 form-control-label">{props.label}:</label>
      {/*We have to render the datepicker like this because it won't cooperate
           And we also have to do some not-so-sexy css adjustments */}
      <div className="col-xs-5 datepicker-wrapper " id={props.id}>
          <DatePicker
            onChange={props.input.onChange}
            dateFormat="yyyy-MM-dd"
            selected={!props.input.value ? null : new Date(props.input.value)}
            minDate={new Date()}
            validate={required}
            required
          />
      </div>
  </div>
);
const renderTextArea = (props) => (
    <div className="row top-buffer">
        <div className={props.meta.asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-5 form-control-label"> {props.label}{props.tooltip && (<a><sup><span id="help-tooltip" data-tooltip={props.tooltip}>?️</span></sup></a>)}: </label>
            <textarea {...props.required==true ? props.required : ''} className={`col-xs-5 form-control-${props.type}`}  type={props.type} {...props.input} />
            {props.meta.touched && ((props.meta.error && <span>{props.meta.error}</span>))}
        </div>
    </div>
);

interface State {
    loading: boolean;
    submitted: boolean;
    uniqueProtocolInvestigator: Array<any>;
    animal_requests_viral_status: Array<any>;
    animal_requests_origin: Array<any>;
    animal_requests_species: Array<any>;
    animal_requests_sex: Array<any>;
    animal_requests_active_projects: Array<any>;
    protocol: Array<any>;
    animal_requests_disposition: Array<any>;
    animal_requests_infectiousdisease: Array<any>;
    animal_requests_yes_no: Array<any>;
    dataArr: Array<any>;
}

export class AnimalRequestForm extends React.Component<any,State> {
    constructor(props: State) {
        super(props);
        //this has to be an array of promises
        const dataArr = [
            getEHRData('ehr','investigatorsWithName', '', '', [], 'IncludeExternal'),
            getEHRData('ehr_lookups','animal_requests_viral_status'),
            getEHRData('ehr_lookups','animal_requests_origin','meaning'),
            getEHRData('ehr_lookups','animal_requests_species','common'),
            getEHRData('ehr_lookups','animal_requests_sex'),
            getEHRData('ehr_lookups','animal_requests_active_projects','-project','project,account,enddate'),
            getEHRData('ehr','protocol','-protocol'),
            getEHRData('ehr_lookups','animal_requests_disposition'),
            getEHRData('ehr_lookups','animal_requests_infectiousdisease'),
            getEHRData('ehr_lookups', 'animal_requests_yes_no')
        ];

        this.state = {
            loading: true,
            submitted: false,
            uniqueProtocolInvestigator: [{value: ''}],
            animal_requests_viral_status: [{value: ''}],
            animal_requests_origin: [{value: ''}],
            animal_requests_species: [{value: ''}],
            animal_requests_sex: [{value: ''}],
            animal_requests_active_projects: [{value: ''}],
            protocol: [{value: ''}],
            animal_requests_disposition: [{value: ''}],
            animal_requests_infectiousdisease: [{value: ''}],
            animal_requests_yes_no: [{value: ''}],
            dataArr: dataArr
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.getSeveralEHRData = this.getSeveralEHRData.bind(this);
    }


    findAccountByProject = (project) => {
        let account = '';
        let projectsAndAccounts = this.state.animal_requests_active_projects;
        for (let i = 0; i < projectsAndAccounts.length; i++){
            if (projectsAndAccounts[i]['project'] == project){
                account = projectsAndAccounts[i]['account'];
                break;
            }
        }
        return account;
    }

    async componentDidMount() {
        this.getSeveralEHRData(this.state.dataArr)
    }

    observer = createDecorator(
        {
              field: 'optionalproject', // when the value of this field changes...
              updates: {
                  account: (val, allValues) => {
                      return this.findAccountByProject(val);
                  }
              }
              },
          {
            field: 'speciesneeded', // when the value of this field changes...
            updates: {
                originneeded: (val, allValues, prevValues) => {
                    if (val === "Marmoset") {
                        return "Any";
                    } else {
                        if (prevValues["speciesneeded"] == "Marmoset") {
                            return "";
                        } else {
                            return prevValues["originneeded"];
                        }
                    }
                },
                mhctype: (val, allValues, prevValues) => {
                    if (val === "Marmoset") {
                        return "Any";
                    } else {
                        if (prevValues["speciesneeded"] == "Marmoset") {
                            return "";
                        } else {
                            return prevValues["mhctype"];
                        }
                    }
                },
                viralstatus: (val, allValues, prevValues) => {
                    if (val === "Marmoset") {
                        return "Any";
                    } else {
                        if (prevValues["speciesneeded"] == "Marmoset") {
                            return "";
                        } else {
                            return prevValues["viralstatus"];
                        }
                    }
                }
            }
        }
)

    getSeveralEHRData(dataArr) {
        //fetch and save the data for the dropdown options to our component state
        Promise.all(dataArr).then((data) => {
            for (let val of data) {
                //TODO remove ts-ignore
                //@ts-ignore
                this.setState({[val['queryName']]: val['rows']});
            }
        }).then(() => {
            this.setState({...this.state,loading:false});
        });
    };

    async onSubmit(values) {

        this.setState({...this.state,submitted: true});
        const QCState = "In Progress";

        submitAnimalRequest(values,QCState)
            .then(data => {
                let redirectUrl = LABKEY.ActionURL.buildURL('wnprc_ehr','dataEntry.view',LABKEY.Security.currentContainer.path);
                window.location = redirectUrl;
            }).catch((err) => {
                alert(err.exception)
                this.setState({...this.state,submitted: false});
            }
        );
    }

    render() {

        //component to render dropdowns
        const DropdownOptions = ({name, rowkey, rowval = rowkey}) => {
            return (
                <>
                    {this.state[name] && this.state[name].map((x,index) => {
                        return (
                            <option key={index} value={x[rowkey]}>{x[rowval]}</option>
                        )
                    })}
                </>
            )
        };

        //component to conditionally render an input when "isnot" prop is NOT equal to "when" prop's input val
        //TODO generalize this into the Condition component below

        const ConditionIsNot = (props) => (
            <Field name={props.when} subscription={{ value: true }}>
                {({ input: { value } }) => (value !== props.isnot ? props.children : null)}
            </Field>
        );
        //component to conditionally render an input when "is" prop is equal to "when" prop's input val
        const Condition = (props) => (
            <Field name={props.when} subscription={{ value: true }}>
                {({ input: { value } }) => (value === props.is ? props.children : null)}
            </Field>
        );

        const loading = this.state.loading;
        const submitted = this.state.submitted===true ? 'form-submitted' : '';
        const display = this.state.loading===true ? 'none' : 'block';
        const cancelUrl = LABKEY.ActionURL.buildURL('wnprc_ehr','dataEntry.view','/WNPRC/EHR');
        const formDescription = 'Note: All fields are required except for Account and Comments fields. ' +
            'If there is not yet an existing project and or protocol associated with this animal request, ' +
            'choose "TBD" as the dropdown option and place an explanation in the Comments field.'

        return (
            <Form
                onSubmit={this.onSubmit}
                mutators={{...arrayMutators, setFieldData}}
                subscription={{ submitting: true, pristine: true }}
                decorators={[this.observer]}
                render={({
                             handleSubmit,
                             form,
                             values,
                         }) => {
                        return (
                            <div className={`card content-wrapper ${submitted}`}>
                                <div className="row content-wrapper-body">
                                    <div className="form-wrapper">
                                        <form onSubmit={handleSubmit}>
                                            {loading && <div className="loading" />}
                                            <div style={{display:display}} className="card-body">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <Field
                                                            name="principalinvestigator"
                                                            label="PI"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="investigatorsWithName" rowkey="rowid" rowval="investigatorWithName"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="numberofanimals"
                                                            component={renderField}
                                                            label="# of Animals"
                                                            type="number"
                                                            min="1"
                                                            validate={required}
                                                            required={true}
                                                            tooltip="Please provide the number of animals needed (integers only)."
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="speciesneeded"
                                                            label="Species"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_species" rowkey="common"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <ConditionIsNot when="speciesneeded" isnot="Marmoset">
                                                        <Field
                                                            name="originneeded"
                                                            label="Origin"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_origin" rowkey="meaning"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        </ConditionIsNot>
                                                        <Field
                                                            name="sex"
                                                            label="Sex"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_sex" rowkey="value"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="age"
                                                            component={renderField}
                                                            label="Age"
                                                            type="text"
                                                            validate={required}
                                                            required={true}
                                                            tooltip="Please provide an approximate age range for the animals requested."
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="weight"
                                                            component={renderField}
                                                            label="Weight (kg)"
                                                            type="text"
                                                            validate={required}
                                                            required={true}
                                                            tooltip="Please provide an approximate weight range for the animals requested."
                                                        >
                                                        </Field>
                                                        <ConditionIsNot when="speciesneeded" isnot="Marmoset">
                                                        <Field
                                                            name="mhctype"
                                                            component={renderField}
                                                            label="MHC Type"
                                                            type="text"
                                                            validate={required}
                                                            required={true}
                                                        >
                                                        </Field>
                                                        </ConditionIsNot>
                                                        <ConditionIsNot when="speciesneeded" isnot="Marmoset">
                                                        <Field
                                                            name="viralstatus"
                                                            label="Viral Status"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_viral_status" rowkey="value"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        </ConditionIsNot>
                                                        <Field
                                                            name="infectiousdisease"
                                                            label="Infectious Disease"
                                                            tooltip="Is this an infectious disease project?"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_infectiousdisease" rowkey="value"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="majorsurgery"
                                                            label="Major Surgery?"
                                                            tooltip="Whether or not the animals are going to have major surgery on the project."
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_yes_no" rowkey="value"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                          name="pregnantanimalsrequired"
                                                          label="Pregnant Animals Required?"
                                                          component={renderSelectField}
                                                          validate={required}
                                                          required={true}
                                                          options={
                                                              <>
                                                                  <option/>
                                                                  <DropdownOptions name="animal_requests_yes_no" rowkey="value"/>
                                                              </>
                                                          }
                                                        >
                                                        </Field>
                                                        <Condition when="pregnantanimalsrequired" is="Yes">
                                                            <Field
                                                                name="pregnantanimalsrequiredtermdam"
                                                                label="Terminal For Dam?"
                                                                component={renderSelectField}
                                                                validate={required}
                                                                required={true}
                                                                options={
                                                                    <>
                                                                        <option/>
                                                                        <DropdownOptions name="animal_requests_yes_no" rowkey="value"/>
                                                                    </>
                                                                }
                                                            >
                                                            </Field>
                                                        </Condition>
                                                        <Condition when="pregnantanimalsrequired" is="Yes">
                                                            <Field
                                                                name="pregnantanimalsrequiredterminfant"
                                                                label="Terminal For Infant?"
                                                                component={renderSelectField}
                                                                validate={required}
                                                                required={true}
                                                                options={
                                                                    <>
                                                                        <option/>
                                                                        <DropdownOptions name="animal_requests_yes_no" rowkey="value"/>
                                                                    </>
                                                                }
                                                            >
                                                            </Field>
                                                        </Condition>
                                                        <Field
                                                            name="disposition"
                                                            label="Disposition"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <DropdownOptions name="animal_requests_disposition" rowkey="value"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="previousexposures"
                                                            label="Unwanted Previous Exposures"
                                                            tooltip="List which exposures you do not want the animals exposed to."
                                                            component={renderField}
                                                            type="text"
                                                            required={false}
                                                        >
                                                        </Field>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <Field
                                                          name="executivecommitteeapproval"
                                                          label="Executive Committee Approval?"
                                                          component={renderSelectField}
                                                          validate={required}
                                                          required={true}
                                                          options={
                                                              <>
                                                                  <option/>
                                                                  <DropdownOptions name="animal_requests_yes_no" rowkey="value"/>
                                                              </>
                                                          }
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="optionalproject"
                                                            label="Project"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <option value="TBD">TBD</option>
                                                                    <DropdownOptions name="animal_requests_active_projects" rowkey="project"/>
                                                                </>
                                                            }
                                                        >

                                                        </Field>
                                                        <Field
                                                          name="account"
                                                          label="Account"
                                                          component={renderField}
                                                          type="text"
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="protocol"
                                                            label="Protocol"
                                                            component={renderSelectField}
                                                            validate={required}
                                                            required={true}
                                                            options={
                                                                <>
                                                                    <option/>
                                                                    <option value="TBD">TBD</option>
                                                                    <DropdownOptions name="protocol" rowkey="protocol"/>
                                                                </>
                                                            }
                                                        >
                                                        </Field>
                                                        <Field
                                                          name="anticipatedstartdate"
                                                          id="anticipatedstartdate"
                                                          label="Anticipated Start Date"
                                                          component={renderDateTimePicker}
                                                          type="text"
                                                          validate={required}
                                                        >

                                                        </Field>
                                                        <Field
                                                          name="anticipatedenddate"
                                                          id="anticipatedenddate"
                                                          label="Anticipated End Date"
                                                          component={renderDateTimePicker}
                                                          type="text"
                                                          validate={required}
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="comments"
                                                            label="Comments"
                                                            component={renderTextArea}
                                                            type="textarea"
                                                            required={false}
                                                        >
                                                        </Field>
                                                        <Field
                                                            name="contacts"
                                                            label="Contacts"
                                                            component={renderTextArea}
                                                            type="textarea"
                                                            required={false}
                                                            tooltip="List any contacts for this request (names, emails, etc)."
                                                        >
                                                        </Field>
                                                    </div>
                                                </div>
                                            </div>
                                            <br/>
                                            <p>{formDescription}</p>
                                            <div className="row top-buffer">
                                                <div className="btn-wrap">
                                                    <button
                                                        className={`btn custom-submit labkey-button ${submitted}`}
                                                        id="submit-final"
                                                        disabled={this.state.submitted}
                                                        type="submit"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        className="btn labkey-button"
                                                        onClick={ () => {
                                                            window.location = cancelUrl;
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                }
            >
            </Form>
        )
    }
}

