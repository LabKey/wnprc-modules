var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow) {
    row.completed = !!row.completed;
    if (!row.ultrasound_id) {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'research_ultrasounds',
            columns: 'objectid',
            filterArray: [LABKEY.Filter.create('taskid', row.taskid)],
            failure: function (data) {
                EHR.Server.Utils.addError(scriptErrors, null, 'Task ID not found!', 'ERROR');
            },
            scope: this,
            success: function (data) {
                if (data.rows && data.rows.length) {
                    row.ultrasound_id = data.rows[0].objectid;
                }
            }
        });
    }
}