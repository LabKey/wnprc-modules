/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var LABKEY = require("labkey");
var console = require("console");

function afterDelete(row, errors, oldRow){
    if(row.entityid){
        var toUpdate = [];
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('templateid', row.entityid, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data.rows && data.rows.length){
                    var rowData;
                    for (var i=0;i<data.rows.length;i++){
                        rowData = data.rows[i];
                        toUpdate.push({rowid: rowData.rowid});
                    }
                }
            },
            failure: function(error){
                console.log('Select rows error');
                console.log(error);
            }
        });

        //console.log('Records to update: '+toUpdate.length);

        if(toUpdate.length){
            LABKEY.Query.deleteRows({
                schemaName: 'ehr',
                queryName: 'formtemplaterecords',
                rows: toUpdate,
                success: function(data){
                    console.log('Success updating formpanelsections')
                },
                failure: function(error){
                    console.log('deleteRows Error');
                    console.log(error);
                }
            });
        }
    }
}
