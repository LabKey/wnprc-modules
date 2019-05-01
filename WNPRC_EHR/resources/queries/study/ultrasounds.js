var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){


    if (row && row.Id){
        WNPRC.Utils.getJavaHelper().updateUltrasoundFollowup(row.Id, row.date);

        row.followup_required = !!row.followup_required;
        row.fetal_heartbeat = !!row.fetal_heartbeat;
    }
}