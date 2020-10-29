import React from 'react';
import DatePicker from 'react-datepicker';

import { Form, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import setFieldData from 'final-form-set-field-data';
import { OnChange } from 'react-final-form-listeners';

import {
    submitAnimalRequest
} from '../../query/helpers';
import {getEHRData} from '../../query/actions';

const required = value => (value ? undefined : <span data-tooltip="Required">❗️</span>);

const renderField = ({
        input, label, warnings, tooltip, type,
        meta: { touched, error, warning, asyncValidating }
    }) => (
    <div className="row top-buffer">
        <div className={asyncValidating ? 'async-validating' : ''}>
            <label className="col-xs-4 form-control-label"> {label}{tooltip && (<sup><span id="help-tooltip" data-tooltip={tooltip}>?️</span></sup>)} </label>
            <input required className="col-xs-5 form-control-input"  type={type} {...input} />
            {touched && ((error && <span>{error}</span>))}
        </div>
    </div>
);

const renderDateTimePicker = ({ input : {onChange, value}}) => (
    <DatePicker
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        selected={!value ? null : new Date(value)}
        minDate={new Date()}
        validate={required}
        required
    />
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
            getEHRData('ehr_lookups','animal_requests_active_projects','-project','project,enddate'),
            getEHRData('ehr','protocol','-protocol'),
            getEHRData('ehr_lookups','animal_requests_disposition'),
            getEHRData('ehr_lookups','animal_requests_infectiousdisease')
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
            dataArr: dataArr
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.getSeveralEHRData = this.getSeveralEHRData.bind(this);
    }


    async componentDidMount() {
        this.getSeveralEHRData(this.state.dataArr)
    }

    getSeveralEHRData(dataArr) {
        //fetch and save the data for the dropdown options to our component state
        Promise.all(dataArr).then((data) => {
            console.log(data);
            for (let val of data) {
                //TODO remove ts-ignore
                //@ts-ignore
                this.setState({[val['queryName']]: val['rows']});
            }
        }).then(() => {
            this.setState({loading:false});
            console.log('All values set!')
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
                console.log(err.exception)
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
                                                <div className="row">
                                                    <label className="col-xs-4 form-control-label"> PI:</label>
                                                    <Field
                                                        name="principalinvestigator"
                                                        label="PI:"
                                                        component="select"
                                                        className="col-xs-5 form-control-input"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="uniqueProtocolInvestigator" rowkey="inves"/>
                                                        <option value="other">Other</option>
                                                    </Field>
                                                </div>
                                                <Condition when="principalinvestigator" is="other">
                                                    <Field
                                                        name="externalprincipalinvestigator"
                                                        className="col-xs-5 form-control-input"
                                                        component={renderField}
                                                        label="Specify PI:"
                                                        type="text"
                                                        validate={required}
                                                        required
                                                    >
                                                    </Field>
                                                </Condition>
                                                <Field
                                                    name="numberofanimals"
                                                    className="col-xs-5 form-control-input"
                                                    component={renderField}
                                                    label="# of Animals:"
                                                    type="number"
                                                    validate={required}
                                                    tooltip="Please provide the number of animals needed (integers only)."
                                                >
                                                </Field>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Species:</label>
                                                    <Field
                                                        name="speciesneeded"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_species" rowkey="common"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Origin:</label>
                                                    <Field
                                                        name="originneeded"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_origin" rowkey="meaning"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Sex:</label>
                                                    <Field
                                                        name="sex"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_sex" rowkey="value"/>
                                                    </Field>
                                                </div>
                                                <Field
                                                    name="age"
                                                    className="col-xs-5 form-control-input"
                                                    component={renderField}
                                                    label="Age:"
                                                    type="text"
                                                    validate={required}
                                                    tooltip="Please provide an approximate age range for the animals requested."
                                                >
                                                </Field>
                                                <Field
                                                    name="weight"
                                                    className="col-xs-5 form-control-input"
                                                    component={renderField}
                                                    label="Weight (kg):"
                                                    type="text"
                                                    validate={required}
                                                    tooltip="Please provide an approximate weight range for the animals requested."
                                                >
                                                </Field>
                                                <Field
                                                    name="mhctype"
                                                    className="col-xs-5 form-control-input"
                                                    component={renderField}
                                                    label="MHC Type:"
                                                    type="text"
                                                    validate={required}
                                                >
                                                </Field>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Viral Status:</label>
                                                    <Field
                                                        name="viralstatus"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_viral_status" rowkey="value"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label
                                                        className="col-xs-4 form-control-label">
                                                        Infectious Disease:
                                                        <sup><span id="help-tooltip" data-tooltip="Is this an infectious disease project?">?️</span></sup>
                                                    </label>
                                                    <Field
                                                        name="infectiousdisease"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_infectiousdisease" rowkey="value"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Disposition:</label>
                                                    <Field
                                                        name="disposition"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <DropdownOptions name="animal_requests_disposition" rowkey="value"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Date Needed:</label>
                                                    {/*We have to render the datepicker like this because it won't cooperate
                                                       And we also have to do some not-so-sexy css adjustments */}
                                                    <div className="col-xs-5" id="datepicker">
                                                        <Field
                                                            name="dateneeded"
                                                            className="form-control-input"
                                                            component={renderDateTimePicker}
                                                            type="text"
                                                            validate={required}
                                                        >

                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Project:</label>
                                                    <Field
                                                        name="project"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <option value="TBD">TBD</option>
                                                        <DropdownOptions name="animal_requests_active_projects" rowkey="project"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Protocol:</label>
                                                    <Field
                                                        name="protocol"
                                                        className="col-xs-5 form-control-input"
                                                        component="select"
                                                        validate={required}
                                                        required
                                                    >
                                                        <option/>
                                                        <option value="TBD">TBD</option>
                                                        <DropdownOptions name="protocol" rowkey="protocol"/>
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Account:</label>
                                                    <Field
                                                        name="account"
                                                        className="col-xs-5 form-control-input"
                                                        component="input"
                                                        type="text"
                                                    >
                                                    </Field>
                                                </div>
                                                <div className="row top-buffer">
                                                    <label className="col-xs-4 form-control-label">Comments:</label>
                                                    <Field
                                                        name="comments"
                                                        className="col-xs-5 form-control-textarea"
                                                        component="textarea"
                                                    >
                                                    </Field>
                                                </div>
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

