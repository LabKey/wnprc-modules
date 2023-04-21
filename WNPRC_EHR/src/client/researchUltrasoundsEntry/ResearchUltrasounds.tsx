import * as React from "react";
import { FC, useContext, useEffect, useRef, useState } from 'react';
import "../theme/css/index.css";
import InputLabel from '../components/InputLabel';
import TextInput from '../components/TextInput';
import {
    getAnimalInfo,
    handleInputChange,
    openDatepicker,
    handleDateChange,
    findDropdownOptions, labkeyActionSelectWithPromise, labkeyActionDistinctSelectWithPromise
} from '../query/helpers';
import { AppContext } from "./ContextProvider";
import DateInput from '../components/DateInput';
import { ActionURL, Filter } from '@labkey/api';
import DatePicker from 'react-datepicker';
import DropdownSearch from '../components/DropdownSearch';
import Checkbox from '../components/Checkbox';
import BulkTextInput from '../components/BulkTextInput';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';

export const ResearchUltrasounds: FC<any> = (props) => {
    const { setAnimalInfoState, setAnimalInfo, setAnimalInfoCache, validId, setValidId} = useContext(AppContext);

    const {onStateChange} = props;
    // This state is strictly for the form values
    const [state, setState] = useState({
        id: '',
        date: new Date(),
        idPregnancies: '',
        idProject: null,
        account: '',
    });

    // These states are options for dropdowns, not the value that is selected
    const [projectOptions, setProjectOptions] = useState([]);
    const [pregOptions, setPregOptions] = useState([]);

    let calendarEl = useRef(null);

    // Finds the animal info for the id on update and checks if valid for form submission
    useEffect(() => {
        getAnimalInfo(state.id, setAnimalInfo, setAnimalInfoState,setValidId, setAnimalInfoCache);
    },[state.id]);

    // find pregnancies for id, update when id changes
    useEffect(() => {
        let config: SelectRowsOptions = {
            schemaName: "study",
            queryName: "pregnancyConceptionDate",
            columns: ["date_conception","lsid"],
            filterArray: [
                Filter.create(
                    "lsid",
                    state.id,
                    Filter.Types.CONTAINS
                )
            ]
        };
        findDropdownOptions(config, setPregOptions, 'lsid','date_conception');
    }, [state.id]);

    // Find projects for animal id
    useEffect(() => {
        if(!validId) return;
        let config: SelectDistinctOptions = {
            schemaName: "study",
            queryName: "Assignment",
            column: "project",
            filterArray: [
                Filter.create(
                    "Id",
                    state.id,
                    Filter.Types.EQUALS
                )
            ]
        };

        labkeyActionDistinctSelectWithPromise(config).then(data => {
            let temp = [];
            // Default projects, these should always show
            temp.push({value:300901, label:"300901"});
            temp.push({value:400901, label:"400901"});

            data["values"].forEach(item => {
                // we don't want them added twice if an animal has already been in a default project
                if (item === 300901 || item === 400901) return;
                temp.push({value: item, label: item});
            });
            setProjectOptions(temp);
        });

    }, [validId]);

    // Find account for project
    useEffect(() => {
        // Clears account if project is also cleared
        if(state.idProject === null) {
            setState({...state,account: ''});
            return;
        }

        let config: SelectDistinctOptions = {
            schemaName: "ehr",
            queryName: "project",
            column: "account",
            filterArray: [
                Filter.create(
                    "project",
                    state.idProject,
                    Filter.Types.EQUALS
                )
            ]
        };

        labkeyActionDistinctSelectWithPromise(config).then(data => {
            setState({...state,account: data["values"][0]});
        });

    }, [state.idProject]);

    // Updates state in form container
    useEffect(() => {
        onStateChange(state);
        console.log(state);
    },[state]);

    return (
        <>
            <div className="panel-heading">
                <h3>Research Ultrasounds</h3>
            </div>
            <div className={'default-form'}>
                <div className="panel-input-row">
                    <InputLabel
                        labelFor="id"
                        label="Id"
                        className={'panel-label'}
                    />
                    <TextInput
                        name="id"
                        id={`id_${'animalId'}`}
                        className="form-control"
                        value={state.id}
                        onChange={(event) => handleInputChange(event,setState)}
                        required={true}
                        autoFocus={false}
                        isValid={validId}
                    />
                </div>

                <div className="panel-input-row">
                    <InputLabel
                        labelFor="date"
                        label="Date"
                        className={'panel-label'}
                    />
                    <DatePicker
                        ref={(r) => (calendarEl.current = r)}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={state.date}
                        className="form-control"
                        name="dueDate"
                        onChange={(date) => handleDateChange("date", date, setState)}
                        customInput={
                            <DateInput
                                opendate={() => openDatepicker(calendarEl)}
                                iconpath={`${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`}/>
                        }
                        popperClassName={"my-datepicker-popper"}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'idPregnancies'}
                        label={'Pregnancy (Conc. Date)'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={pregOptions}
                        initialvalue={null}
                        name="idPregnancies"
                        id={`id_${'idPregnancies'}`}
                        classname="navbar__search-form"
                        required={false}
                        isClearable={true}
                        value={state.idPregnancies}
                        setState={setState}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'idProject'}
                        label={'Project'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={projectOptions}
                        initialvalue={null}
                        name="idProject"
                        id={`id_${'idProject'}`}
                        classname="navbar__search-form"
                        required={false}
                        isClearable={true}
                        value={state.idProject}
                        setState={setState}
                    />
                </div>

               
                <BulkTextInput
                    inputField={[
                        {name: "account", label: "Account", type: "text"},
                        {name: "fetalHB", label: "Fetal HB", type: "checkbox"},
                        {name: "crownRump", label: "Crown Rump (mm)", type: "text"},
                        {name: "bipDiam", label: "Biparietal Diameter (mm)", type: "text"},
                        {name: "headCirc", label: "Head Circumference (mm)", type: "text"},
                        {name: "occFroDia", label: "Occipital Frontal Diameter (mm)", type: "text"},
                        {name: "abdomCirc", label: "Abdominal Circumference (mm)", type: "text"},
                        {name: "femurLen", label: "Femur Length (mm)", type: "text"},
                        {name: "uaPeakSysVel", label: "UA Peak Systolic Velocity (cm/s)", type: "text"},
                        {name: "uaEndDiaVel", label: "UA End Diastolic Velocity (cm/s)", type: "text"},
                        {name: "uaSysDiaRat", label: "UA Systolic Diastolic Ratio", type: "text"},
                        {name: "latVen", label: "Lateral Ventricles (mm)", type: "text"},
                        {name: "cerebellum", label: "Cerebellum (mm)", type: "text"},
                        {name: "cistMag", label: "Cisterna Magna (mm)", type: "text"},
                        {name: "maxVertPocket", label: "Max Vertical Pocket (cm)", type: "text"},
                        {name: "amnioticFluIdx", label: "Amniotic Fluid Index (cm)", type: "text"},
                        {name: "mcaPeakSystolic", label: "MCA Peak Systolic (cm/s)", type: "text"},
                        {name: "mcaEndDiastolic", label: "MCA End Diastolic (cm/s)", type: "text"},
                        {name: "mcaSysDiaRat", label: "MCA Systolic Diastolic Ratio", type: "text"},
                        {name: "mcaPulIndex", label: "MCA Pulsatility Index", type: "text"},
                        {name: "mcaResIndex", label: "MCA Resistive Index", type: "text"},
                        {name: "cardiacCircum", label: "Cardiac Circumference (cm)", type: "text"},
                        {name: "cardiacArea", label: "Cardiac Area (cm^2)", type: "text"},
                        {name: "chestCircum", label: "Chest Circumference (cm)", type: "text"},
                        {name: "chestArea", label: "Chest Area (cm^2)", type: "text"},
                        {name: "ratioCircum", label: "Ratio Circumferences", type: "text"},
                        {name: "ratioArea", label: "Ratio Areas", type: "text"},
                        {name: "estFetalWgt", label: "Estimated Fetal Weight (g)", type: "text"},
                        {name: "gesSac", label: "Gestational Sac (mm)", type: "text"},
                        {name: "peakSys", label: "Peak Systolic (cm/s)", type: "text"},
                        {name: "endDias", label: "End Diastolic (cm/s)", type: "text"},
                        {name: "nuchalFld", label: "Nuchal Fold", type: "text"},
                        {name: "snomed", label: "SNOMED", type: "text"},
                        {name: "perfBy", label: "Performed By", type: "text"},
                        {name: "findings", label: "Findings", type: "text"},
                        {name: "remark", label: "Remark", type: "textarea"}
                    ]
                    }
                    state={state}
                    handleInputChange={(event) => handleInputChange(event,setState)}
                    required={[32]}
                />
            </div>
        </>
    );
}
