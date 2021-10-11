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
function setDescription(row,helper){
    var description = new Array();

    if (row.description){
        description.push(EHR.Server.Utils.nullToString(row.description));
    }
    if (row.location){
        console.log(JSON.stringify(row.location));
        description.push('Chairing location: ' + EHR.Server.Utils.nullToString(row.location));
    }
    if(row.chairingStartTime){
        var m = new Date(row.chairingStartTime.time);
        var dateString =
                m.getUTCFullYear() + "-" +
                ("0" + (m.getMonth()+1)).slice(-2) + "-" +
                ("0" + m.getDate()).slice(-2) + " " +
                ("0" + m.getHours()).slice(-2) + ":" +
                ("0" + m.getMinutes()).slice(-2);
        description.push('StartTime: ' + EHR.Server.Utils.nullToString(dateString));
    }
    if (row.chairingEndTime){
        var m = new Date(row.chairingEndTime.time);
        var dateString =
                m.getUTCFullYear() + "-" +
                ("0" + (m.getMonth()+1)).slice(-2) + "-" +
                ("0" + m.getDate()).slice(-2) + " " +
                ("0" + m.getHours()).slice(-2) + ":" +
                ("0" + m.getMinutes()).slice(-2);
        description.push('EndTime: ' + EHR.Server.Utils.nullToString(dateString));
    }
    if (row.chairingStartTime && row.chairingEndTime){
        var startTime = row.chairingStartTime.time;
        var endTime = row.chairingEndTime.time;
        var difference = Math.floor((endTime - startTime) / (60 * 1000));
        var hours = Math.floor(difference / 60);
        var minutes = difference % 60;

        var textDifference = "";
        if (hours > 0) {
            textDifference += hours + " hour" + (hours > 1 ? "s" : "") + " and "
        }
        textDifference += minutes + " minute" + (minutes != 1 ? "s" : "");
        description.push('Duration: ' + textDifference);
    }
    return description;
}
