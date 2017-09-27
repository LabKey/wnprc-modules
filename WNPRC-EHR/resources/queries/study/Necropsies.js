/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        allowDatesInDistantPast: true
    });
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    description.push('Case No: '+EHR.Server.Utils.nullToString(row.caseno));

    return description;
}

function onUpsert(helper, scriptErrors, row){
    if (!helper.isETL() && row.caseno)
        EHR.Server.Validation.verifyCasenoIsUnique(helper, row, scriptErrors);

    if (row.Id){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if(data){
                    if(!row.project){
                        EHR.Server.Utils.addError(scriptErrors, 'project', 'Must enter a project for all center animals.', 'WARN');
                    }
                }
            }
        });
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Birth', function(scriptErrors, helper, row, oldRow) {
    if(!helper.isETL()){
        //if not already present, we insert into demographics
        var doSubmit = false;
        if(row.Id.match(/^pd/)){
            doSubmit = true;
        }
        else {
            EHR.Server.Utils.findDemographics({
                participant: row.Id,
                helper: helper,
                scope: this,
                callback: function(data){
                    if(data){
                        doSubmit = true;
                    }
                }
            });
        }

        if(doSubmit){
            var obj = {
                Id: row.Id,
                project: row.project,
                date: (row.timeofdeath ? new Date(row.timeofdeath.toGMTString()) : null),
                cause: row.causeofdeath,
                manner: row.mannerofdeath,
                necropsy: row.caseno,
                parentid: row.objectid
            };

            var queryName;
            if(row.Id.match(/^pd/))
                queryName = 'Prenatal Deaths';
            else
                queryName = 'Deaths';

            //we look for a deaths record
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: queryName,
                filterArray: [
                    LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        obj.lsid = data.rows[0].lsid;
                        LABKEY.Query.updateRows({
                            schemaName: 'study',
                            queryName: queryName,
                            scope: this,
                            rows: [obj],
                            success: function(data){
                                console.log('Success updating '+queryName+' from necropsy for '+row.Id)
                            },
                            failure: EHR.Server.Utils.onFailure
                        });
                    }
                    //otherwise we create a new record
                    else {
    //                    LABKEY.Query.insertRows({
    //                        schemaName: 'study',
    //                        queryName: queryName,
    //                        scope: this,
    //                        rows: [obj],
    //                        success: function(data){
    //                            console.log('Success inserting into '+queryName+' from necropsy for '+row.Id)
    //                        },
    //                        failure: EHR.Server.Utils.onFailure
    //                    });
                        EHR.Server.Utils.addError(scriptErrors, 'Id', 'No death record exists.  Please use the button near the bottom of the page to create one.', 'ERROR');
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
});