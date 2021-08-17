/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event,helper){
    helper.decodeExtraContextProperty('clientEncounterDate');

    helper.registerRowProcessor(function(helper,row) {
        //TODO: pull this out and put into generic 'utils' function for reuse in other trigger scripts
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
    if (row.date){
        var map = helper.getProperty('clientEncounterDate');
        var clientEncounterDate = [];
        if (map && map[row.Id]){
            clientEncounterDate = map[row.Id];

        }
        if(clientEncounterDate){
            let errorMessage = WNPRC.Utils.getJavaHelper().checkEncounterTime(row.Id, row.date, clientEncounterDate, 'drug');
            if (errorMessage != null) {
                EHR.Server.Utils.addError(scriptErrors, 'date', errorMessage, 'ERROR');
            }
        }

    }
    if (helper.isETL())
        return;

//        if(!row.amount && !row.volume){
//            EHR.Server.Utils.addError(scriptErrors, 'amount', 'Must supply either amount or volume', 'INFO');
//            EHR.Server.Utils.addError(scriptErrors, 'volume', 'Must supply either amount or volume', 'INFO');
//        }

    if (row.qualifier && row.qualifier.match(/\//)){
        EHR.Server.Utils.addError(scriptErrors, 'qualifier', 'This field contains a /. This likely means you need to pick one of the options', 'INFO');
    }

    //we need to store something in the date field during the draft stage, so i use header date
    //we swap begindate in here instead
    //any form that is an encounter should show begindate, not date
    //other forms will not show begindate, so this shouldnt matter here
    if (row.begindate)
        row.date = row.begindate;

   }
