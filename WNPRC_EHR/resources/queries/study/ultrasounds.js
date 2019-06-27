var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){
    if (row && row.Id){
        WNPRC.Utils.getJavaHelper().updateUltrasoundFollowup(row.Id, row.date);

        //row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;
        row.QCStateLabel = EHR.Server.Security.getQCStateByLabel('Completed').Label;
    }
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (row && row.Id){
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
                            LABKEY.Query.selectRows({
                                schemaName: 'wnprc',
                                queryName: 'getGestationalDay',
                                parameters: {
                                    SPECIES: species,
                                    SEARCH_COLUMN_NAME: gestationField,
                                    SEARCH_VALUE: row[gestationField]
                                },
                                success: function(data){
                                    let gestationDayField = gestationField.slice(0, -3) + '_gest_day';
                                    if(data && data.rows && data.rows.length){
                                        row[gestationDayField] = data.rows[0].gestational_day;
                                    } else {
                                        row[gestationDayField] = null;
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

function setDescription(row, helper){
    var description = [];

    description.push('Type: Imaging');
    if(row.reason) {
        description.push('Date: ' + row.date);
    }
    if(row.fetal_heartbeat) {
        description.push('Fetal HB: ' + (!!row.beats_per_minute ? row.beats_per_minute : 'true'));
    } else {
        description.push('Fetal HB: false');
    }
    if (row.gest_sac_mm) {
        description.push('Gestational Sac (mm): ' + Number(row.gest_sac_mm.toFixed(2)));
    }
    if(row.crown_rump_mm) {
        description.push('Crown Rump (mm): ' + Number(row.crown_rump_mm.toFixed(2)));
    }
    if (row.biparietal_diameter_mm) {
        description.push('Biparietal Diameter (mm): ' + Number(row.biparietal_diameter_mm.toFixed(2)));
    }
    if (row.femur_length_mm) {
        description.push('Femur Length (mm): ' + Number(row.femur_length_mm.toFixed(2)));
    }
    if (row.yolk_sac_diameter_mm) {
        description.push('Yolk Sac Diameter (mm): ' + Number(row.yolk_sac_diameter_mm.toFixed(2)));
    }
    if (row.head_circumference_mm) {
        description.push('Head Circumference (mm): ' + Number(row.head_circumference_mm.toFixed(2)));
    }
    if (row.followup_required) {
        description.push('Followup Required: ' + row.followup_required);
    }
    if (row.performedby) {
        description.push('Performed By: ' + row.performedby);
    }

    return description;
}