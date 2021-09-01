require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
    });
    helper.decodeExtraContextProperty('waterInForm');
    helper.decodeExtraContextProperty('clientEncounterDate');

    helper.registerRowProcessor(function (helper, row){
        if (!row)
            return;
        if(!row.Id || !row.volume){
            return;
        }

        var waterInForm = helper.getProperty('waterInForm');
        waterInForm = waterInForm || {};
        waterInForm[row.Id] = waterInForm[row.Id] || [];

        var clientEncounterDate = helper.getProperty('clientEncounterDate');
        clientEncounterDate = clientEncounterDate || {};
        clientEncounterDate[row.Id] = clientEncounterDate [row.Id] || [];

        if (row.objectid){
            LABKEY.ExtAdapter.each(waterInForm[row.Id], function(r){
                if (r.objectid == row.objectid){
                    if(r.volume != row.volume){
                        r.volume = row.volume;
                    }
                    else{
                        return false;
                    }
                }
            }, this)

            LABKEY.ExtAdapter.each(clientEncounterDate[row.Id], function(r){
                if (r.objectid == row.objectid){
                    if(r.date != row.date){
                        r.date = row.date;
                    }
                    else{
                        return false;
                    }
                }
            }, this)
        }
        helper.setProperty('waterInForm',waterInForm);
        helper.setProperty('clientEncounterDate',clientEncounterDate);
    });

}

function onUpsert(helper, scriptErrors, row, oldRow) {

    if (row.date){
        var map = helper.getProperty('clientEncounterDate');

        var clientEncounterDate = [];
        if (map && map[row.Id]){
            clientEncounterDate = map[row.Id];

        }
        let errorMessage = WNPRC.Utils.getJavaHelper().checkEncounterTime(row.Id,row.date,clientEncounterDate, 'waterAmount');
        if (errorMessage != null){
            EHR.Server.Utils.addError(scriptErrors,'date',errorMessage,'ERROR');
        }

    }

    if (row.recordSource=="LabWaterForm"){
        var fixdate = new Date(row.date);
        fixdate.setHours(14);
        fixdate.setMinutes(1);
        row.date = fixdate;
        if (!row.skipWaterRegulationCheck){
            row.qcstate = EHR.Server.Security.getQCStateByLabel('Scheduled').rowid;
            row.QCStateLabel = EHR.Server.Security.getQCStateByLabel('Scheduled').Label;
        }

        if (row.assignedTo == "animalcare" && row.volume && !row.skipWaterRegulationCheck){
            let errorMessage = WNPRC.Utils.getJavaHelper().checkUploadTime(row.id,row.date,row.recordSource,row.assignedTo, 'waterAmount');
            if (errorMessage != null){
                EHR.Server.Utils.addError(scriptErrors,'assignedTo',errorMessage,'INFO');
            }
        }
        if (row.volume && row.waterSource == "regulated" && !row.skipWaterRegulationCheck){
            var map = helper.getProperty('waterInForm');
            var waterInForm = [];
            if (map && map[row.Id]){
                waterInForm = map[row.Id];
            }

            let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterSchedule(row.id,row.date,row.objectid,row.volume,waterInForm);
            if (jsonArray != null){
                for (var i = 0; i < jsonArray.length; i++ ){
                    let errorObject = JSON.parse(jsonArray[i]);
                    EHR.Server.Utils.addError(scriptErrors,errorObject.field, errorObject.message,errorObject.severity);

                }
            }
            
        }

    }

}