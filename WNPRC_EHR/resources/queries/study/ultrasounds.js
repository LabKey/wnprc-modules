var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){


    if (row && row.Id){
        WNPRC.Utils.getJavaHelper().updateUltrasoundFollowup(row.Id, row.date);

        row.followup_required = !!row.followup_required;
        row.fetal_heartbeat = !!row.fetal_heartbeat;

        let gestation_fields = ['gest_sac_mm', 'crown_rump_mm', 'biparietal_diameter_mm', 'femur_length_mm'];

        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function (demographics) {
                if (demographics) {
                    if (demographics['species']) {
                        let species = demographics['species'];

                        gestation_fields.forEach(function(gestationField) {
                            console.log('field: ' + gestationField);
                            console.log('value: ' + row[gestationField]);
                            LABKEY.Query.selectRows({
                                schemaName: 'study',
                                queryName: 'getGestationalDay',
                                parameters: {
                                    SPECIES: species,
                                    SEARCH_COLUMN_NAME: gestationField,
                                    SEARCH_VALUE: row[gestationField]
                                },
                                success: function(data){
                                    if(data && data.rows && data.rows.length){
                                        let gestationLengthField = gestationField.
                                        console.log(JSON.stringify(data.rows[0]));
                                    }
                                },
                                failure: EHR.Server.Utils.onFailure
                            });
                        });
                    }
                }
            }
        });
    }
}