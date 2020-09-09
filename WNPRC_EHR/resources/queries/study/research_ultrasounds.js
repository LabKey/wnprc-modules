var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow) {
    let validMeasurements = getValidMeasurements();
    let measurementRows = [];
    let targetQCState = "Review Required";

    row.taskid = row.taskid || LABKEY.Utils.generateUUID().toUpperCase();
    row.objectid = row.objectid || LABKEY.Utils.generateUUID().toUpperCase();

    //if there are any data for an ultrasound review, then add that record as well
    //if this is true this is a bulk upload
    if (row.reviewDate || row.head || row.falx || row.thalamus || row.lateral_ventricles || row.choroid_plexus || row.eye || row.profile || row.four_chamber_heart
         || row.diaphragm || row.stomach || row.bowel || row.bladder || row.reviewFindings || row.placenta_notes || row.reviewRemarks || row.completed) {

        if (row.completed) {
            targetQCState = "Completed";
        }

        if (!!row.restraintType) {
            EHR.Server.Utils.addError(scriptErrors, "restraintType", "Restraint Type is a required field", "ERROR");
        }

        if (!!row.reviewDate) {
            EHR.Server.Utils.addError(scriptErrors, "reviewDate", "Review Date is required if a review of the ultrasound has occurred", "ERROR");
        }

        //explicitly set blank boolean values to false
        let reviewRow = {
            "Id": row.Id,
            "date": row.reviewDate,
            "head": !!row.head,
            "falx": !!row.falx,
            "thalamus": !!row.thalamus,
            "lateral_ventricles": !!row.lateral_ventricles,
            "choroid_plexus": !!row.choroid_plexus,
            "eye": !!row.eye,
            "profile": !!row.profile,
            "four_chamber_heart": !!row.four_chamber_heart,
            "diaphragm": !!row.diaphragm,
            "stomach": !!row.stomach,
            "bowel": !!row.bowel,
            "bladder": !!row.bladder,
            "findings": row.reviewFindings,
            "placenta_notes": row.placenta_notes,
            "remarks": row.reviewRemarks,
            "completed": !!row.completed,
            "QCStateLabel": targetQCState,
            "ultrasound_id": row.objectid,
            "taskid": row.taskid
        };

        LABKEY.Query.insertRows({
            schemaName: 'study',
            queryName: 'ultrasound_review',
            rows: [reviewRow],
            scope: this,
            success: function (results) {

            },
            failure: function (error) {
                console.log("Insert rows error for study.ultrasound_review: " + JSON.stringify(error));
            }
        });
    }

    if (row.restraintType || row.restraintRemarks) {

        let restraintRow = {
            "Id": row.Id,
            "date": new Date(row.date),
            "restraintType": row.restraintType,
            "remarks": row.restraintRemarks,
            "QCStateLabel": targetQCState,
            "taskid": row.taskid
        };

        LABKEY.Query.insertRows({
            schemaName: 'study',
            queryName: 'restraints',
            rows: [restraintRow],
            scope: this,
            success: function (results) {

            },
            failure: function (error) {
                console.log("Insert rows error for study.restraints: " + JSON.stringify(error));
            }
        });
    }

    let measurementsToSave = false;
    for (let measurementName in validMeasurements) {
        if (validMeasurements.hasOwnProperty(measurementName)) {
            if (row[measurementName] != null && row[measurementName].length > 0) {
                row[measurementName] = formatMeasurements(row[measurementName]);
                let measurements = row[measurementName].split(';');
                measurements.forEach(function (measurement) {
                    measurementRows.push({
                        Id: row.Id,
                        date: row.date,
                        measurement_name: measurementName,
                        measurement_label: validMeasurements[measurementName].label,
                        measurement_value: measurement,
                        measurement_unit: validMeasurements[measurementName].unit,
                        ultrasound_id: row.objectid,
                        QCStateLabel: targetQCState,
                        taskid: row.taskid
                    });
                    measurementsToSave = true;
                });
            }
        }
    }

    if (measurementsToSave) {
        WNPRC.Utils.getJavaHelper().insertRows(measurementRows, "study", "ultrasound_measurements");
    }
    row.QCStateLabel = targetQCState;

    if (!helper.isValidateOnly()) {
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'tasks',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('taskid', row.taskid, LABKEY.Filter.Types.EQUAL)],
            success: function (results) {
                if (results && results.rows && results.rows.length >= 1) {
                    //great, do nothing
                }
                else {
                    let taskRow = {
                        "taskid": row.taskid,
                        "category": "Task",
                        "title": "Research Ultrasounds",
                        "formtype": "Research Ultrasounds",
                        "QCStateLabel": row.QCStateLabel,
                        "assignedto": LABKEY.Security.currentUser.id,
                        "duedate": new Date(row.date),
                        "container": LABKEY.Security.currentContainer.id,
                        "datecompleted": row.completed ? row.reviewDate : null
                    };

                    console.log("Creating taskid for research ultrasounds bulk upload record");

                    LABKEY.Query.insertRows({
                        schemaName: 'ehr',
                        queryName: 'tasks',
                        rows: [taskRow],
                        scope: this,
                        success: function (results) {

                        },
                        failure: function (error) {
                            console.log("Insert rows error for ehr.tasks: " + JSON.stringify(error));
                        }
                    });
                }
            },
            failure: function (error) {
                console.log("Select rows error for ehr.tasks: " + JSON.stringify(error));
            }
        });
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

function setDescription(row, helper){
    let description = [];
    let validMeasurements = getValidMeasurements();

    description.push('Type: Imaging');
    description.push("Fetal Heartbeat: " + !!row.fetal_heartbeat);
    for (let key in row) {
        if (row.hasOwnProperty(key) && row[key] && validMeasurements.hasOwnProperty(key)) {
            let measurements = row[key].split(";");
            let measurementString = "";
            for (let i = 0; i < measurements.length; i++) {
                measurementString += measurements[i] + validMeasurements[key]["unit"];
                if (i + 1 < measurements.length) {
                    measurementString += ", ";
                }
            }
            description.push(validMeasurements[key]["label"] + ": " + measurementString);
        }
    }

    return description;
}

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
        peak_systolic_cms: {
            label: 'Peak Systolic',
            unit: 'cm/s'
        },
        end_diastolic_cms: {
            label: 'End Diastolic',
            unit: 'cm/s'
        },
        nuchal_fold: {
            label: 'Nuchal Fold',
            unit: ''
        }
    };

    return validMeasurements;
}