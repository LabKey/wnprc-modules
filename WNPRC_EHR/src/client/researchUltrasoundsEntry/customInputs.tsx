import { Filter } from '@labkey/api';
import { lookupAnimalInfo, findAccount } from '../query/helpers';
import { InfoProps } from './typings';

const validateId = (value: string) => {
    return lookupAnimalInfo(value).then((data: InfoProps) => {
        if(data.calculated_status === "Alive"){
            return true;
        }
        return "Animal is not valid";
    }).catch(() => {
        return "Animal is not valid";
    });

}

const pregOptions = (lsid: string) => {
    return ({
        schemaName: "study",
        queryName: "pregnancyConceptionDate",
        columns: ["lsid", "date_conception"],
        filterArray: [
            Filter.create(
                "lsid",
                lsid,
                Filter.Types.CONTAINS
            )
        ]
    });
}
const projectOptions = (id: string) => {
    return ({
        schemaName: "study",
        queryName: "Assignment",
        columns: ["project"],
        filterArray: [
            Filter.create(
                "Id",
                id,
                Filter.Types.EQUALS
            )
        ]
    });
}
const restraintOptions = {
    schemaName: "ehr_lookups",
    queryName: "restraint_type",
    columns: ["type"]
}


export const inputs = [
      {name: "Id", label: "Id", type: "text", required: true, validation: validateId},
      {name: "date", label: "Date", type: "date"},
      {name: "pregnancyid", label: "Pregnancy (Conc. Date)", type: "dropdown", watch: 'ResearchPane.Id', options: pregOptions},
      {name: "project", label: "Project", type: "dropdown", watch: 'ResearchPane.Id', options: projectOptions, defaultOpts: [{value:300901, label:"300901"},{value:400901, label:"400901"}]},
      {name: "account", label: "Account", type: "text", autoFill: {watch: "ResearchPane.project", search: findAccount}},
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
      {name: "performedby", label: "Performed By", type: "text", required: true},
      {name: "findings", label: "Findings", type: "text"},
      {name: "remark", label: "Remark", type: "textarea"}
];

export const restraintInputs = [
    {name: "restraintType", label: "Restraint Type", type: "dropdown", options: restraintOptions},
    {name: "remark", label: "Remark", type: "textarea"},
]

export const reviewInputs = [
    {name: "Id", label: "Id", type: "text", required: true, autoFill: {watch: "ResearchPane.Id"}},
    {name: "date", label: "Date", type: "date"},
    {name: "head", label: "Head", type: "checkbox"},
    {name: "falx", label: "Falx", type: "checkbox"},
    {name: "thalamus", label: "Thalamus", type: "checkbox"},
    {name: "lateral_ventricles", label: "Lateral Ventricles", type: "checkbox"},
    {name: "choroid_plexus", label: "Choroid Plexus", type: "checkbox"},
    {name: "eye", label: "Eye", type: "checkbox"},
    {name: "profile", label: "Profile", type: "checkbox"},
    {name: "four_chamber_heart", label: "Four Chamber Heart", type: "checkbox"},
    {name: "diaphragm", label: "Diaphragm", type: "checkbox"},
    {name: "stomach", label: "Stomach", type: "checkbox"},
    {name: "bowel", label: "Bowel", type: "checkbox"},
    {name: "bladder", label: "Bladder", type: "checkbox"},
    {name: "findings", label: "Findings", type: "textarea"},
    {name: "placenta_notes", label: "Placenta Notes", type: "textarea"},
    {name: "remarks", label: "Other/Comments", type: "textarea"},
    {name: "completed", label: "Interpretation Completed", type: "checkbox", required: true},
];