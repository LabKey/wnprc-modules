var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow) {
    console.log('Row: ' + JSON.stringify(row));
    //row.Id = 'testid';

    //////Do some validation and change qcstate based on 'completed' column
}

function onUpdate(helper, scriptErrors, row, oldRow) {
    // let validMeasurements = getValidMeasurements();
    // let updateRows = [];
    //
    // let measurementsToUpdate = false;
    // for (let measurementName in validMeasurements) {
    //     if (validMeasurements.hasOwnProperty(measurementName)) {
    //         if (row[measurementName] != oldRow[measurementName]) {
    //             row[measurementName] = formatMeasurements(row[measurementName]);
    //             updateRows.push({
    //                 Id: row.Id,
    //                 date: row.date,
    //                 measurement_name: measurementName,
    //                 measurement_label: validMeasurements[measurementName].label,
    //                 measurements_string: row[measurementName],
    //                 measurement_unit: validMeasurements[measurementName].unit,
    //                 ultrasound_id: row.objectid,
    //                 taskid: row.taskid
    //             });
    //             measurementsToUpdate = true;
    //         }
    //     }
    // }
    //
    // if (measurementsToUpdate && !helper.isValidateOnly()) {
    //     WNPRC.Utils.getJavaHelper().updateUltrasoundMeasurements(updateRows);
    // }
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    // if (row && row.Id){
    //     row.fetal_heartbeat = !!row.fetal_heartbeat;
    // }
}