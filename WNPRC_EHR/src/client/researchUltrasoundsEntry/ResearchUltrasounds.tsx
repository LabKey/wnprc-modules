import * as React from "react";
import { FC, useEffect, useRef, useState } from 'react';
import "../theme/css/index.css";
import {
    getAnimalInfo,
    findDropdownOptions,
    findAccount,
    findProjects
} from '../query/helpers';
import { Filter } from '@labkey/api';
import BulkFormInput from '../components/BulkFormInput';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';

export const ResearchUltrasounds: FC<any> = (props) => {
    const {setAnimalInfo, setAnimalInfoState, setAnimalInfoCache, onStateChange} = props;
    // This state is strictly for the form values, more added later but these must be defined here
    const [state, setState] = useState({
        id: { value: "", error: "" },
        date: { value: new Date(), error: "" },
        idPregnancies: { value: "", error: "" },
        idProject: { value: null, error: "" },
        account: { value: "", error: "" },
    });

    // These states are options for dropdowns, not the value that is selected
    const [projectOptions, setProjectOptions] = useState([]);
    const [pregOptions, setPregOptions] = useState([]);

    let calendarEl = useRef(null);

    // Finds the animal info for the id on update and checks if valid for form submission
    useEffect(() => {
        getAnimalInfo(state.id.value, setAnimalInfo, setAnimalInfoState, setAnimalInfoCache);
    },[state.id.value]);

    // find pregnancies for id, update when id changes
    useEffect(() => {
        let config: SelectRowsOptions = {
            schemaName: "study",
            queryName: "pregnancyConceptionDate",
            columns: ["date_conception","lsid"],
            filterArray: [
                Filter.create(
                    "lsid",
                    state.id.value,
                    Filter.Types.CONTAINS
                )
            ]
        };
        findDropdownOptions(config, setPregOptions, 'lsid','date_conception');
    }, [state.id.value]);

    // Find projects for animal id
    useEffect(() => {
        findProjects(state.id.value).then(newProjects => {
            setProjectOptions(newProjects);
        });
    }, [state.id.value]);

    // Find account for project
    useEffect(() => {
        // Clears account if project is also cleared
        if(state.idProject.value === null) {
            setState({...state,account: { value: "", error: "" }});
            return;
        }

        findAccount(state.idProject.value).then(newAccount => {
            setState({...state, account: newAccount});
        });
    }, [state.idProject.value]);

    // Updates state in form container
    useEffect(() => {
        onStateChange(state);
    },[state]);

    // Check for valid id??
    return (
        <>
            <div className="panel-heading">
                <h3>Research Ultrasounds</h3>
            </div>
            <div className={'default-form'}>
                <BulkFormInput
                    inputField={[
                        {name: "id", label: "Id", type: "text"},
                        {name: "date", label: "Date", type: "date", calendarEl: calendarEl},
                        {name: "idPregnancies", label: "Pregnancy (Conc. Date)", type: "dropdown", options: pregOptions},
                        {name: "idProject", label: "Project", type: "dropdown", options: projectOptions},
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
                    setState={setState}
                    required={["id","perfBy"]}
                />
            </div>
        </>
    );
}
