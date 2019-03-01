require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){


    if (row && row.Id){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'ultrasounds',
            //columns: 'species',
            filterArray: [
                    LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('followup_required', true, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('date', row.date, LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL)
            ],
            scope: this,
            success: function(results) {
                if (results.rows && results.rows.length) {
                    var toUpdate = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows[i];
                        row.followup_required = false;
                        toUpdate.push(row);
                    }

                    LABKEY.Query.updateRows({
                        schemaName: 'study',
                        queryName: 'ultrasounds',
                        rows: toUpdate,
                        scope: this,
                        success: function(){
                            console.log('ultrasound \'followup_required\' field successfully updated');
                        },
                        failure: EHR.Server.Utils.onFailure
                    });
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }
}