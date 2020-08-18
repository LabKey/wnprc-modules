var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow) {
}

function onUpdate(helper, scriptErrors, row, oldRow) {
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (row.Id) {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'research_ultrasounds',
            columns: 'QCState',
            filterArray: [LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create('taskid', row.taskid, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: function (results) {
                if (results.rows && results.rows.length) {
                    let resultsRow = results.rows[0];
                    row.QCStateLabel = EHR.Server.Security.getQCStateByRowId(resultsRow.QCState).Label;
                }
            },
            failure: function (data) {
                EHR.Server.Utils.onFailure
            }
        });
    }
}