/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row){
    if (!helper.isETL() && row.Id && row.date){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT age_in_months(d.birth, CONVERT('"+EHR.Server.Validation.dateToString(row.date)+"', DATE)) as age FROM study.demographics d WHERE d.id='"+row.Id+"'",
            success: function(data){
                if(data && data.rows && data.rows.length){
                    row.age = data.rows[0].age;
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.Date)
        description.push('Start: '+EHR.Server.Utils.datetimeToString(row.Date));
    if(row.enddate)
        description.push('End: '+EHR.Server.Utils.datetimeToString(row.enddate));
    if(row.age)
        description.push('Age: '+row.age);
    if(row.inves)
        description.push('Investigator: '+row.inves);
    if(row.surgeon)
        description.push('Surgeon: '+row.surgeon);
    if(row.major)
        description.push('Is Major?: '+row.major);

    return description;
}
