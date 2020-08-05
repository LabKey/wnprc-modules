var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow) {
    let validMeasurements = getValidMeasurements();
    let insertRows = [];

    let measurementsToSave = false;
    for (let measurementName in validMeasurements) {
        if (validMeasurements.hasOwnProperty(measurementName)) {
            if (row[measurementName] != null && row[measurementName].length > 0) {
                row[measurementName] = formatMeasurements(row[measurementName]);
                let measurements = row[measurementName].split(';');
                measurements.forEach(function (measurement) {
                    insertRows.push({
                        Id: row.Id,
                        date: row.date,
                        measurement_name: measurementName,
                        measurement_label: validMeasurements[measurementName].label,
                        measurement_value: measurement,
                        measurement_unit: validMeasurements[measurementName].unit,
                        ultrasound_id: row.objectid,
                        QCStateLabel: "Review Required",
                        taskid: row.taskid
                    });
                    measurementsToSave = true;
                });
            }
        }
    }

    if (measurementsToSave) {
        WNPRC.Utils.getJavaHelper().insertUltrasoundMeasurements(insertRows);
    }
}

function onUpdate(helper, scriptErrors, row, oldRow) {
    let validMeasurements = getValidMeasurements();
    let updateRows = [];

    let measurementsToUpdate = false;
    for (let measurementName in validMeasurements) {
        if (validMeasurements.hasOwnProperty(measurementName)) {
            if (row[measurementName] != oldRow[measurementName]) {
                row[measurementName] = formatMeasurements(row[measurementName]);
                updateRows.push({
                    Id: row.Id,
                    date: row.date,
                    measurement_name: measurementName,
                    measurement_label: validMeasurements[measurementName].label,
                    measurements_string: row[measurementName],
                    measurement_unit: validMeasurements[measurementName].unit,
                    ultrasound_id: row.objectid,
                    QCStateLabel: row.QCStateLabel,
                    taskid: row.taskid
                });
                measurementsToUpdate = true;
            }
        }
    }

    if (measurementsToUpdate && !helper.isValidateOnly()) {
        WNPRC.Utils.getJavaHelper().updateUltrasoundMeasurements(updateRows);
    }
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (row && row.Id){
        row.fetal_heartbeat = !!row.fetal_heartbeat;
    }
}

// function setDescription(row, helper){
//     let description = [];
//
//     description.push('Type: Imaging');
//     if(row.reason) {
//         description.push('Date: ' + row.date);
//     }
//     if(row.fetal_heartbeat) {
//         description.push('Fetal HB: ' + (!!row.beats_per_minute ? row.beats_per_minute : 'true'));
//     } else {
//         description.push('Fetal HB: false');
//     }
//     if (row.gest_sac_mm) {
//         description.push('Gestational Sac (mm): ' + Number(row.gest_sac_mm.toFixed(2)));
//     }
//     if(row.crown_rump_mm) {
//         description.push('Crown Rump (mm): ' + Number(row.crown_rump_mm.toFixed(2)));
//     }
//     if (row.biparietal_diameter_mm) {
//         description.push('Biparietal Diameter (mm): ' + Number(row.biparietal_diameter_mm.toFixed(2)));
//     }
//     if (row.femur_length_mm) {
//         description.push('Femur Length (mm): ' + Number(row.femur_length_mm.toFixed(2)));
//     }
//     if (row.yolk_sac_diameter_mm) {
//         description.push('Yolk Sac Diameter (mm): ' + Number(row.yolk_sac_diameter_mm.toFixed(2)));
//     }
//     if (row.head_circumference_mm) {
//         description.push('Head Circumference (mm): ' + Number(row.head_circumference_mm.toFixed(2)));
//     }
//     if (row.followup_required) {
//         description.push('Followup Required: ' + row.followup_required);
//     }
//     if (row.performedby) {
//         description.push('Performed By: ' + row.performedby);
//     }
//
//     return description;
// }

function formatMeasurements(measurements) {
    let measurementArray = measurements.replace(/[\s,;]+/g, ' ').trim().replace(/[\s]+/g, ';').split(';');
    measurementArray.sort(function(a, b){return a - b});
    let formattedMeasurements = '';
    for (let i = 0; i < measurementArray.length; i++) {
        formattedMeasurements += measurementArray[i];
        if (i +  1 < measurementArray.length) {
            formattedMeasurements += ';'
        }
    }
    return formattedMeasurements;
}

function getValidMeasurements() {
    let validMeasurements = {
        beats_per_minute: {
            label: 'Heartbeat',
            unit: 'bpm'
        },
        crown_rump_mm: {
            label: 'Crown Rump',
            unit: 'mm'
        },
        biparietal_diameter_mm: {
            label: 'Biparietal Diameter',
            unit: 'mm'
        },
        head_circumference_mm: {
            label: 'Head Circumference',
            unit: 'mm'
        },
        occipital_frontal_diameter_mm: {
            label: 'Occipital Frontal Diameter',
            unit: 'mm'
        },
        abdominal_circumference_mm: {
            label: 'Abdominal Circumference',
            unit: 'mm'
        },
        femur_length_mm: {
            label: 'Femur Length',
            unit: 'mm'
        },
        ua_peak_systolic_velocity_cms: {
            label: 'Umbilical Artery Peak Systolic Velocity',
            unit: 'cm/s'
        },
        ua_end_systolic_velocity_cms: {
            label: 'Umbilical Artery End Systolic Velocity',
            unit: 'cm/s'
        },
        ua_peak_diastolic_velocity_cms: {
            label: 'Umbilical Artery Peak Diastolic Velocity',
            unit: 'cm/s'
        },
        ua_end_diastolic_velocity_cms: {
            label: 'Umbilical Artery End Diastolic Velocity',
            unit: 'cm/s'
        },
        ua_systolic_diastolic_ratio: {
            label: 'Umbilical Artery Systolic/Diastolic Ratio',
            unit: ''
        },
        lateral_ventricles_mm: {
            label: 'Lateral Ventricles',
            unit: 'mm'
        },
        cerebellum_mm: {
            label: 'Cerebellum',
            unit: 'mm'
        },
        cisterna_magna_mm: {
            label: 'Cisterna Magna',
            unit: 'mm'
        },
        max_vertical_pocket_cm: {
            label: 'Maximum Vertical Pocket',
            unit: 'cm'
        },
        amniotic_fluid_index_cm: {
            label: 'Amniotic Fluid Index',
            unit: 'cm'
        },
        mca_peak_systolic_cms: {
            label: 'Middle Cerebral Artery Peak Systolic',
            unit: 'cm/s'
        },
        mca_end_diastolic_cms: {
            label: 'Middle Cerebral Artery End Diastolic',
            unit: 'cm/s'
        },
        mca_systolic_diastolic_ratio: {
            label: 'Middle Cerebral Artery Systolic/Diastolic',
            unit: ''
        },
        mca_pulsatility_index: {
            label: 'Middle Cerebral Artery Pulsatility Index',
            unit: ''
        },
        mca_resistive_index: {
            label: 'Middle Cerebral Artery Resistive Index',
            unit: ''
        },
        cardiac_circumference_mm: {
            label: 'Cardiac Circumference',
            unit: 'mm'
        },
        cardiac_area_cm2: {
            label: 'Cardiac Area',
            unit: 'cm^2'
        },
        chest_circumference_cm: {
            label: 'Chest Circumference',
            unit: 'cm'
        },
        chest_area_cm2: {
            label: 'Chest Area',
            unit: 'cm^2'
        },
        ratio_circumferences: {
            label: 'Ratio Circumferences',
            unit: ''
        },
        ratio_areas: {
            label: 'Ratio Areas',
            unit: ''
        },
        estimated_fetal_weight_g: {
            label: 'Estimated Fetal Weight',
            unit: 'g'
        },
        gest_sac_mm: {
            label: 'Gestational Sac Diameter',
            unit: 'mm'
        },
        nuchal_fold: {
            label: 'Nuchal Fold',
            unit: ''
        }
    };

    return validMeasurements;
}