var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    if (event === "update") {
        helper.setScriptOptions({
            allowDatesInDistantPast: true
        });
    }
}

function onUpsert(helper, scriptErrors, row, oldRow) {

    //Set the values to false if the box isn't checked
    row.head = !!row.head;
    row.falx = !!row.falx;
    row.thalamus = !!row.thalamus;
    row.lateral_ventricles = !!row.lateral_ventricles;
    row.choroid_plexus = !!row.choroid_plexus;
    row.eye = !!row.eye;
    row.profile = !!row.profile;
    row.four_chamber_heart = !!row.four_chamber_heart;
    row.diaphragm = !!row.diaphragm;
    row.stomach = !!row.stomach;
    row.bowel = !!row.bowel;
    row.bladder = !!row.bladder;
    row.completed = !!row.completed;

    if (!row.ultrasound_id) {
        LABKEY.Query.selectRows({
            schemaName: "study",
            queryName: "research_ultrasounds",
            columns: "objectid",
            filterArray: [LABKEY.Filter.create("taskid", row.taskid)],
            failure: function (data) {
                EHR.Server.Utils.addError(scriptErrors, null, "Task ID not found!", "ERROR");
            },
            scope: this,
            success: function (data) {
                if (data.rows && data.rows.length) {
                    row.ultrasound_id = data.rows[0].objectid;
                }
            }
        });
    }

    if (row.QCStateLabel === "Review Required" && row.completed) {
        EHR.Server.Utils.addError(scriptErrors, null, "You must 'Submit Final' if the interpretation is completed", "ERROR");
    } else if (row.QCStateLabel === "Completed" && !row.completed && !row.is_bulk_upload) {
        EHR.Server.Utils.addError(scriptErrors, null, "You cannot 'Submit Final' if the interpretation is not completed", "ERROR");
    }

    LABKEY.Query.selectRows({
        schemaName: "study",
        queryName: "ultrasound_measurements",
        columns: "objectid",
        filterArray: [LABKEY.Filter.create("taskid", row.taskid)],
        failure: function (data) {
            EHR.Server.Utils.addError(scriptErrors, null, "There was an error while looking up the Task ID", "ERROR");
        },
        scope: this,
        success: function (data) {
            if (data.rows && data.rows.length > 0) {
                let updateRows = [];
                for (let i = 0; i < data.rows.length; i++) {
                    updateRows.push({
                        objectid: data.rows[i].objectid,
                        QCStateLabel: row.QCStateLabel
                    });
                }

                LABKEY.Query.updateRows({
                    method: 'POST',
                    schemaName: 'study',
                    queryName: 'ultrasound_measurements',
                    scope: this,
                    rows: updateRows,
                    success: function () {

                    },
                    failure: function () {
                        EHR.Server.Utils.addError(scriptErrors, null, "An error occurred while updating the QCState of the Ultrasound Measurements", "ERROR");
                    }

                })
            }
        }
    });
}