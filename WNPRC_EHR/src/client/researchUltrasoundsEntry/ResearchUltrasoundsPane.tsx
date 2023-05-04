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

export const ResearchUltrasoundsPane: FC<any> = (props) => {
    const {setAnimalInfo, setAnimalInfoState, setAnimalInfoCache, onStateChange} = props;
    // This state is strictly for the form values, more added later but these must be defined here
    const [state, setState] = useState({
        Id: { value: "", error: "" },
        date: { value: new Date(), error: "" },
        pregnancyid: { value: "", error: "" },
        project: { value: null, error: "" },
        account: { value: "", error: "" },
        taskid: {value: "", error: ""},
    });

    // These states are options for dropdowns, not the value that is selected
    const [projectOptions, setProjectOptions] = useState([]);
    const [pregOptions, setPregOptions] = useState([]);

    let calendarEl = useRef(null);

    // Finds the animal info for the id on update and checks if valid for form submission
    useEffect(() => {
        getAnimalInfo(state.Id.value, setAnimalInfo, setAnimalInfoState, setAnimalInfoCache);
    },[state.Id.value]);

    // find pregnancies for id, update when id changes
    useEffect(() => {
        let config: SelectRowsOptions = {
            schemaName: "study",
            queryName: "pregnancyConceptionDate",
            columns: ["date_conception","lsid"],
            filterArray: [
                Filter.create(
                    "lsid",
                    state.Id.value,
                    Filter.Types.CONTAINS
                )
            ]
        };
        findDropdownOptions(config, setPregOptions, 'lsid','date_conception');
    }, [state.Id.value]);

    // Find projects for animal id
    useEffect(() => {
        findProjects(state.Id.value).then(newProjects => {
            setProjectOptions(newProjects);
        });
    }, [state.Id.value]);

    // Find account for project
    useEffect(() => {
        // Clears account if project is also cleared
        if(state.project.value === null) {
            setState({...state,account: { value: "", error: "" }});
            return;
        }

        findAccount(state.project.value).then(newAccount => {
            setState({...state, account: newAccount});
        });
    }, [state.project.value]);

    // Updates state in form container
    useEffect(() => {
        onStateChange(state);
    },[state]);

    return (
        <>
            <div className="panel-heading">
                <h3>Research Ultrasounds</h3>
            </div>
            <div className={'default-form'}>
                <BulkFormInput
                    inputField={[
                        {name: "Id", label: "Id", type: "text"},
                        {name: "date", label: "Date", type: "date", calendarEl: calendarEl},
                        {name: "pregnancyid", label: "Pregnancy (Conc. Date)", type: "dropdown", options: pregOptions},
                        {name: "project", label: "Project", type: "dropdown", options: projectOptions},
                        {name: "account", label: "Account", type: "text"},
                        {name: "fetal_heartbeat", label: "Fetal HB", type: "checkbox"},
                        {name: "crown_rump_mm", label: "Crown Rump (mm)", type: "text"},
                        {name: "biparietal_diameter_mm", label: "Biparietal Diameter (mm)", type: "text"},
                        {name: "head_circumference_mm", label: "Head Circumference (mm)", type: "text"},
                        {name: "occipital_frontal_diameter_mm", label: "Occipital Frontal Diameter (mm)", type: "text"},
                        {name: "abdominal_circumference_mm", label: "Abdominal Circumference (mm)", type: "text"},
                        {name: "femur_length_mm", label: "Femur Length (mm)", type: "text"},
                        {name: "ua_peak_systolic_velocity_cms", label: "UA Peak Systolic Velocity (cm/s)", type: "text"},
                        {name: "ua_end_diastolic_velocity_cms", label: "UA End Diastolic Velocity (cm/s)", type: "text"},
                        {name: "ua_systolic_diastolic_ratio", label: "UA Systolic Diastolic Ratio", type: "text"},
                        {name: "lateral_ventricles_mm", label: "Lateral Ventricles (mm)", type: "text"},
                        {name: "cerebellum_mm", label: "Cerebellum (mm)", type: "text"},
                        {name: "cisterna_magna_mm", label: "Cisterna Magna (mm)", type: "text"},
                        {name: "max_vertical_pocket_cm", label: "Max Vertical Pocket (cm)", type: "text"},
                        {name: "amniotic_fluid_index_cm", label: "Amniotic Fluid Index (cm)", type: "text"},
                        {name: "mca_peak_systolic_cms", label: "MCA Peak Systolic (cm/s)", type: "text"},
                        {name: "mca_end_diastolic_cms", label: "MCA End Diastolic (cm/s)", type: "text"},
                        {name: "mca_systolic_diastolic_ratio", label: "MCA Systolic Diastolic Ratio", type: "text"},
                        {name: "mca_pulsatility_index", label: "MCA Pulsatility Index", type: "text"},
                        {name: "mca_resistive_index", label: "MCA Resistive Index", type: "text"},
                        {name: "cardiac_circumference_mm", label: "Cardiac Circumference (cm)", type: "text"},
                        {name: "cardiac_area_cm2", label: "Cardiac Area (cm^2)", type: "text"},
                        {name: "chest_circumference_cm", label: "Chest Circumference (cm)", type: "text"},
                        {name: "chest_area_cm2", label: "Chest Area (cm^2)", type: "text"},
                        {name: "ratio_circumferences", label: "Ratio Circumferences", type: "text"},
                        {name: "ratio_areas", label: "Ratio Areas", type: "text"},
                        {name: "estimated_fetal_weight_g", label: "Estimated Fetal Weight (g)", type: "text"},
                        {name: "gest_sac_mm", label: "Gestational Sac (mm)", type: "text"},
                        {name: "peak_systolic_cms", label: "Peak Systolic (cm/s)", type: "text"},
                        {name: "end_diastolic_cms", label: "End Diastolic (cm/s)", type: "text"},
                        {name: "nuchal_fold", label: "Nuchal Fold", type: "text"},
                        {name: "code", label: "SNOMED", type: "text"},
                        {name: "performedBy", label: "Performed By", type: "text"},
                        {name: "findings", label: "Findings", type: "text"},
                        {name: "remark", label: "Remark", type: "textarea"}
                    ]
                    }
                    state={state}
                    setState={setState}
                    required={["Id","performedBy"]}
                />
            </div>
        </>
    );
}
