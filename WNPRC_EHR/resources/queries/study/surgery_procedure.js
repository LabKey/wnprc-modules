var console = require("console");
require("ehr/triggers").initScript(this);
require("labkey");

//FYI: Get's called on every single key press!
function onInit(event, helper){
    // console.log('onInit');
    // helper.registerRowProcessor(function(helper, row) {
    //     if (!row)
    //         return;
    //
    //     if (!row.requestId || !row.protocol)
    //     {
    //         return;
    //     }
    // })

}
//
// function onBeforeInsert(row, errors){
//     // if (this.extraContext.targetQC) {
//     //     row.QCStateLabel = this.extraContext.targetQC;
//     // }
//     console.log('onBeforeInsert');
//     console.log('row: ' + JSON.stringify(row));
//     //EHR.Server.Utils.onFailure;
// }
//
// function onAfterInsert(row, errors) {
//     console.log('onAfterInsert');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onBeforeUpdate(row, errors) {
//     console.log('onBeforeUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onAfterUpdate(row, errors) {
//     console.log('onAfterUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onInsert(row, errors) {
//     console.log('onInsert');
//     console.log('row: ' + JSON.stringify(row));
// }

function onInsert(helper, scriptErrors, row, oldRow) {
    if (row.linkToExisting && row.linkedRequest) {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'surgery_procedure',
            filterArray: [LABKEY.Filter.create('objectid', row.linkedRequest, LABKEY.Filter.Types.EQUAL)],
            success: function (data) {
                if (data.rows && data.rows.length > 0) {
                    var updateRow = data.rows[0];
                    updateRow.linkToExisting = true;
                    updateRow.linkedRequest = row.objectid;
                    //updateRow.lsid = 'asdfasdfadsf';
                }
                LABKEY.Query.updateRows({
                    schemaName: 'study',
                    queryName: 'surgery_procedure',
                    rows: [updateRow],
                    success: function () {
                        console.log('success');
                    },
                    failure: function(){
                        console.log('failure');
                    }
                });
            }
        });
    }

    // if (row.project) {
    //     LABKEY.Query.selectRows({
    //         schemaName: 'ehr',
    //         queryName: 'project',
    //         filterArray: [LABKEY.Filter.create('project', row.project, LABKEY.Filter.Types.EQUAL)],
    //         scope: this,
    //         success: function (data) {
    //             if (data && data.rows.length) {
    //                 var protocol = data.rows[0].protocol;
    //                 row.protocol = protocol;
    //             }
    //             if (row.protocol) {
    //                 LABKEY.Query.selectRows({
    //                     schemaName: 'ehr',
    //                     queryName: 'protocol',
    //                     filterArray: [LABKEY.Filter.create('protocol', row.protocol, LABKEY.Filter.Types.EQUAL)],
    //                     scope: this,
    //                     success: function (data) {
    //                         if (data && data.rows.length) {
    //                             var pi = data.rows[0].inves;
    //                             row.pi = pi;
    //                         }
    //                     },
    //                 });
    //             }
    //         },
    //     });
    // }
}

function onUpsert(helper, scriptErrors, row, oldRow){

}

// function onUpdate(row, errors) {
//     console.log('onUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onComplete(event,errors, helper) {
//     console.log('onComplete');
// }