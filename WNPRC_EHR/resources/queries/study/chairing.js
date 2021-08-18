require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require ("labkey");

function onInit(event, helper){
    helper.decodeExtraContextProperty('clientEncounterDate');

    helper.registerRowProcessor(function(helper,row) {
        if (!row)
            return;
        if(!row.Id || !row.date){
            return;
        }
        var clientEncounterDate = helper.getProperty('clientEncounterDate');
        clientEncounterDate = clientEncounterDate || {};
        clientEncounterDate[row.Id] = clientEncounterDate [row.Id] || [];

        if (row.objectid) {
            LABKEY.ExtAdapter.each(clientEncounterDate[row.Id], function (r) {
                if (r.objectid == row.objectid) {
                    if (r.date != row.date) {
                        r.date = row.date;
                    }
                    else {
                        return false;
                    }
                }
            }, this)
        }
        helper.setProperty('clientEncounterDate', clientEncounterDate);
    });
}
function onUpsert(helper, scriptErrors, row, oldRow){

    if (row.chairingStartTime){
        var map = helper.getProperty('clientEncounterDate');
        var clientEncounterDate = [];
        if (map && map[row.Id]){
            //console.log(map[row.Id]);
            clientEncounterDate = map[row.Id];

        }
        let errorMessage = WNPRC.Utils.getJavaHelper().checkEncounterTime(row.Id,row.chairingStartTime,clientEncounterDate, 'chairing');
        if (errorMessage != null){
            EHR.Server.Utils.addError(scriptErrors,'chairingStartTime',errorMessage,'ERROR');
        }

    }

    if (row.chairingEndTime){
        var map = helper.getProperty('clientEncounterDate');
        var clientEncounterDate = [];
        if (map && map[row.Id]){
            //console.log(map[row.Id]);
            clientEncounterDate = map[row.Id];

        }
        let errorMessage = WNPRC.Utils.getJavaHelper().checkEncounterTime(row.Id,row.chairingEndTime,clientEncounterDate, 'chairing');
        if (errorMessage != null){
            EHR.Server.Utils.addError(scriptErrors,'chairingEndTime',errorMessage,'ERROR');
        }

    }

    var startChairing = new Date (row.chairingStartTime.toGMTString());
    var endChairing = new Date (row.chairingEndTime.toGMTString());


    var _MS_PER_HOUR = 1000 * 60 * 60;

    var timeDifference = parseInt(Math.ceil((endChairing - startChairing)/_MS_PER_HOUR));

    if (timeDifference >12){

        EHR.Server.Utils.addError(scriptErrors, 'chairingEndTime', 'An animal cannot be chaired for longer than 12 hours', 'ERROR');

    }
    if (timeDifference == 0){
        EHR.Server.Utils.addError(scriptErrors, 'chairingEndTime', 'Chairing End time cannot be the same as Start time', 'ERROR');
    }

    //console.log ('chairing start time: '+ startChairing);
    //console.log ('chairing end time: '+ endChairing);

    if (endChairing < startChairing){
        EHR.Server.Utils.addError(scriptErrors,'chairingEndTime', 'End time cannot be before the Start time', 'ERROR');
    }


}
