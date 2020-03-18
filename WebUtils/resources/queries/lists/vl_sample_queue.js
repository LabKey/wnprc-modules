var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function beforeUpdate(row, oldRow, errors){
    console.log(oldRow);
    console.log(row);
    console.log(row.CreatedBy)
    var key  = row.key;
    var animalid = row.Id;
    var hostName =  'https://' + LABKEY.serverName;
    var createdByUid = '';
    var createdByEmail = '';

    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'lists',
        queryName: 'vl_sample_queue',
        columns: 'CreatedBy',
        scope: this,
        filterArray: [
            LABKEY.Filter.create('Key', key, LABKEY.Filter.Types.EQUAL)],
        success: function (results) {
            console.log(results);
            if (results.rows.length){
                console.log(results.rows[0].CreatedBy.value);
                createdByUid = results.rows[0].CreatedBy.value;

                LABKEY.Query.selectRows({
                    requiredVersion: 9.1,
                    schemaName: 'core',
                    queryName: 'UsersAndGroups',
                    columns: 'UserId/Email',
                    filterArray: [
                        LABKEY.Filter.create('UserId/UserId', createdByUid, LABKEY.Filter.Types.EQUAL)],
                    success: function (results) {
                        if (results.rows.length){
                            console.log(results.rows[0])
                            createdByEmail = results.rows[0]["UserId/Email"].value;
                            WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(key, animalid, createdByEmail, hostName);
                        }
                    }
                });

            }
        },
        //failure: EHR.Server.Utils.onFailure
    });


    //TODO compare old vs new status, new status = completed
    /*
    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'lists',
        queryName: 'status',
        scope: this,
        filterArray: [
            LABKEY.Filter.create('Status', row.Status, LABKEY.Filter.Types.EQUAL)],
        success: function (results) {
            console.log(results);
        }
    })*/
}

function getUserEmailGivenId (id) {
    return new Promise (function (resolve, reject) {
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'lists',
            queryName: 'vl_sample_queue',
            columns: 'CreatedBy',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('Key', id, LABKEY.Filter.Types.EQUAL)],
            success: function (results) {
                resolve(results);
            },
            failure: function (results){
                reject(results);
            }
        });
    });
};

