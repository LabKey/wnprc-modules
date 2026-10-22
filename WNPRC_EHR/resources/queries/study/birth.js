/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        requiresStatusRecalc: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        skipHousingCheck: true,
        announceAllModifiedParticipants: true
    });

    helper.decodeExtraContextProperty('birthsInTransaction');
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (row.weight && !row.wdate){
        EHR.Server.Utils.addError(scriptErrors, 'wdate', 'This field is required when supplying a weight', 'WARN');
    }

    if (!row.weight && row.wdate){
        EHR.Server.Utils.addError(scriptErrors, 'weight', 'This field is required when supplying a weight date', 'WARN');
    }

    // the highest error this can produce is WARN.  therefore skip this check if we would ignore it anyway in order to save the overhead.
    // this would normally occur when finalizing a form
    if (!helper.isETL() && row.Id && row.weight && row.species && EHR.Server.Utils.shouldIncludeError('WARN', helper.getErrorThreshold(), helper)){
        var msg = helper.getJavaHelper().verifyWeightRange(row.Id, row.weight, row.species);
        if (msg != null){
            EHR.Server.Utils.addError(scriptErrors, 'weight', msg, 'WARN');
        }
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'birth', function(scriptErrors, helper, row, oldRow) {
    var isLiving = EHR.Server.Utils.isLiveBirth(row.birth_condition);
    if (isLiving){
        helper.registerLiveBirth(row.Id, row.date);
    }

    if (!helper.isETL()){
        //if a weight is provided, we insert into the weight table:
        if (row.weight && row.wdate){
            row.wdate = EHR.Server.Utils.normalizeDate(row.wdate);
            row.weight = parseFloat(row.weight);
            helper.getJavaHelper().insertWeight(row.Id, row.wdate, row.weight);
        }

        //if room provided, we insert into housing.  if this animal already has an active housing record, skip
        if (row.room && row.Id && row.date){
            try {
                console.log("Trying to run create housing record");
                WNPRC.Utils.getJavaHelper().createHousingRecord(row.Id, row.date, (isLiving ? null : row.date), row.room, (row.cage || null));
            }catch (e) {
                EHR.Server.Utils.addError(scriptErrors, 'housing', e, 'ERROR');
            }
        }

        if (!helper.isGeneratedByServer()){
            var obj = {
                Id: row.Id,
                gender: row.gender,
                dam: row.dam,
                sire: row.sire,
                birth: row.date,
                date: row.date,
                calculated_status: isLiving ? 'Alive' : 'Dead'
            };

            if (row.origin || row['Id/demographics/origin']) {
                obj.origin = row.origin || row['Id/demographics/origin'];
            }

            //NOTE: the follow is designed to allow the table to either have physical columns for species/origin, or do display the demographics values.  in the latter case, editing the form field will act to update the demographics record
            if (row.species || row['Id/demographics/species']){
                obj.species = row.species || row['Id/demographics/species'];
            }

            if (row.geographic_origin || row['Id/demographics/geographic_origin']){
                obj.geographic_origin = row.geographic_origin || row['Id/demographics/geographic_origin'];
            }

            //find dam, if provided
            if (row.dam && !obj.geographic_origin){
                obj.geographic_origin = helper.getJavaHelper().getGeographicOrigin(row.dam);
            }

            if (row.dam && !obj.species){
                obj.species = helper.getJavaHelper().getSpecies(row.dam);
            }

            if (!isLiving){
                obj.death = row.date;
            }

            //if not already present, we insert into demographics
            helper.getJavaHelper().createDemographicsRecord(row.Id, obj);
        }
    }
});
