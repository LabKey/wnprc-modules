import { Filter } from '@labkey/api';

export const initialState = {
        Id: { value: "", error: "" },
        date: { value: new Date(), error: "" },
        pregnancyid: { value: "", error: "" },
        project: { value: null, error: "" },
        account: { value: "", error: "" },
        taskid: {value: "", error: ""},
    };
export const inputs = [
      {name: "Id", label: "Id", type: "text"},
      {name: "date", label: "Date", type: "date"},
      {name: "pregnancyid", label: "Pregnancy (Conc. Date)", type: "dropdown"},
      {name: "project", label: "Project", type: "dropdown"},
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
      {name: "performedby", label: "Performed By", type: "text"},
      {name: "findings", label: "Findings", type: "text"},
      {name: "remark", label: "Remark", type: "textarea"}
  ];
export const requiredInputs = ["Id", "performedby"];

export const dropdownOptions = (state) => {
      return {
        pregnancyid: [{
          schemaName: "study",
          queryName: "pregnancyConceptionDate",
          columns: ["lsid", "date_conception"],
          filterArray: [
            Filter.create(
                "lsid",
                state.Id.value,
                Filter.Types.CONTAINS
            )
          ]
        }, [state.Id.value]],
        project: [{
          schemaName: "study",
          queryName: "Assignment",
          columns: ["project"],
          filterArray: [
            Filter.create(
                "Id",
                state.Id.value,
                Filter.Types.EQUALS
            )
          ]
        }, [state.Id.value]]
      }
};