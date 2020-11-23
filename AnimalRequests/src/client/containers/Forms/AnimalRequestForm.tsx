import React from 'react';
import DatePicker from 'react-datepicker';

import { Form, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import setFieldData from 'final-form-set-field-data';
import createDecorator from 'final-form-calculate';

import {
    submitAnimalRequest
} from '../../query/helpers';
import {getEHRData} from '../../query/actions';

const required = value => (value ? undefined : <span data-tooltip="Required">❗️</span>);

const renderField = ({
        input, label, warnings, tooltip, type, required, min,
        meta: { touched, error, warning, asyncValidating }
    }) => (
    <div className="row top-buffer">
        <div className={asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-5 form-control-label"> {label}{tooltip && (<sup><span id="help-tooltip" data-tooltip={tooltip}>?️</span></sup>)}: </label>
            <input min={min} {...required==true ? required : ''} className={`col-xs-5 form-control-${type}`}  type={type} {...input} />
            {touched && ((error && <span>{error}</span>))}
        </div>
    </div>
);

const renderSelectField = ({
       input, label, warnings, tooltip, type, options, required,
       meta: { touched, error, warning, asyncValidating }
    }) => (

    <div className="row top-buffer">
        <div className={asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-5 form-control-label"> {label}{tooltip && (
            <sup><span id="help-tooltip" data-tooltip={tooltip}>?️</span></sup>)}: </label>
            <select {...required==true ? required : ''} className="col-xs-5 form-control-input" {...input}> {...options} </select>
            {touched && ((error && <span>{error}</span>))}
        </div>
    </div>
);

{/*Have to use implicit props to workaround the typescript restrictions in FieldRenderProps (react-final-form lib)*/}
const renderDateTimePicker = props => (
  <div className="row top-buffer">
      <label className="col-xs-5 form-control-label">{props.label}:</label>
      {/*We have to render the datepicker like this because it won't cooperate
           And we also have to do some not-so-sexy css adjustments */}
      <div className="col-xs-5" id="datepicker">
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
const renderTextArea = ({
        input, label, warnings, tooltip, type, required,
        meta: { touched, error, warning, asyncValidating }
    }) => (
    <div className="row top-buffer">
        <div className={asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-5 form-control-label"> {label}{tooltip && (<sup><span id="help-tooltip" data-tooltip={tooltip}>?️</span></sup>)}: </label>
            <textarea {...required==true ? required : ''} className={`col-xs-5 form-control-${type}`}  type={type} {...input} />
            {touched && ((error && <span>{error}</span>))}
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
    constructor() {
        super();
        //this has to be an array of promises
        const dataArr = [
            getEHRData('ehr','uniqueProtocolInvestigator'),
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
            this.setState({loading:false});
        });
    };

    async onSubmit(values) {

        this.setState({submitted: true});
        const QCState = 5;

        submitAnimalRequest(values,QCState)
            .then(data => {
                let redirectUrl = LABKEY.ActionURL.buildURL('wnprc_ehr','dataEntry.view',LABKEY.Security.currentContainer.path);
                window.location = redirectUrl;
            }).catch((err) => {
                alert(err.exception)
                this.setState({submitted: false});
            }
        );
    }



    render() {

        //component to render dropdowns
        const DropdownOptions = ({name,rowkey}) => {
            return (
                <>
                    {this.state[name] && this.state[name].map((x,index) => {
                        return (
                            <option key={index} value={x[rowkey]}>{x[rowkey]}</option>
                        )
                    })}
                </>
            )
        };

        //component to conditionally render a text input
        const Condition = ({ when, is, children }) => (
            <Field name={when} subscription={{ value: true }}>
                {({ input: { value } }) => (value === is ? children : null)}
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
                             form: {
                                 mutators: {push, pop, setFieldData}
                             },
                             values,
                             mutators,
                         }) => {
                        return (
                            <div className={`card content-wrapper ${submitted}`}>
                                <div className="row content-wrapper-body">
                                    <div className="form-wrapper">

                                        <form onSubmit={handleSubmit}>
                                            {loading && <div className="loading" />}
                                            <div style={{display:display}} className="card-body">
                                                <Field
                                                    name="principalinvestigator"
                                                    label="PI"
                                                    component={renderSelectField}
                                                    validate={required}
                                                    required={true}
                                                    options={
                                                        <>
                                                            <option/>
                                                            <DropdownOptions name="uniqueProtocolInvestigator" rowkey="inves"/>
                                                            <option value="other">Other</option>
                                                        </>
                                                    }
                                                >
                                                </Field>
                                                <Condition when="principalinvestigator" is="other">
                                                    <Field
                                                        name="externalprincipalinvestigator"
                                                        component={renderField}
                                                        label="Specify PI"
                                                        type="text"
                                                        validate={required}
                                                        required={true}
                                                    >
                                                    </Field>
                                                </Condition>
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
                                                <Field
                                                    name="mhctype"
                                                    component={renderField}
                                                    label="MHC Type"
                                                    type="text"
                                                    validate={required}
                                                    required={true}
                                                >
                                                </Field>
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
                                                    name="dateneeded"
                                                    label="Date Needed"
                                                    component={renderDateTimePicker}
                                                    type="text"
                                                    validate={required}
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
                                                  label="Anticipated Start Date"
                                                  component={renderDateTimePicker}
                                                  type="text"
                                                  validate={required}
                                                >

                                                </Field>
                                                <Field
                                                  name="anticipatedenddate"
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
                                            </div>
                                            <div className="row top-buffer">
                                                <div className="btn-wrap">
                                                    <button
                                                        className={`btn custom-submit labkey-button ${submitted}`}
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
                                            <br/>
                                            <p>{formDescription}</p>
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

