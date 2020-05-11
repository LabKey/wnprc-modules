/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext4").Ext;
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

// Some shortcuts to imported modules
var logger = WNPRC.Logger;

// noinspection JSUnresolvedVariable
exports.init = function (EHR) {
    // Here is the list of trigger scripts to execute:
    var scriptsToLoad = [
        "study/Deaths.js",
        "study/PrenatalDeaths.js",
        "study/Necropsies.js"
        /*,
        "wnprc/vvc.js"*/
    ];

    // Set up a shorthand function.
    var registerHandler = function (event, schema, query, callback) {
        return EHR.Server.TriggerManager.registerHandlerForQuery(event, schema, query, callback);
    };

    // Loop over each of the above-mentioned scripts and execute their registerTriggers call.
    Ext.each(scriptsToLoad, function (scriptName) {
        scriptName = scriptName.replace(/\.js$/, '');
        var trigger = {};

        try {
            trigger = require("wnprc_ehr/queries/" + scriptName);
            logger.debug("Successfully loaded script: " + scriptName);
        }
        catch (e) {
            logger.error("Failed to load trigger: " + scriptName);
        }

        if (Ext.isFunction(trigger.registerTriggers)) {
            trigger.registerTriggers(EHR, registerHandler, EHR.Server.TriggerManager.Events);
        }
        else {
            logger.error("Trigger script (" + scriptName + ") doesn't expose a 'registerTriggers' function.")
        }
    });

    //NOTE: this is getting passed the LK errors object, rather than the EHR wrapper
    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr', 'cage', function (helper, scriptErrors, row) {
        //pad cage to 4 digits if numeric
        if (row.cage && !isNaN(row.cage)) {
            row.cage = EHR.Server.Utils.padDigits(row.cage, 4);
        }

        if (row.room)
            row.room = row.room.toLowerCase();

        row.location = row.room;
        if (row.cage)
            row.location += '-' + row.cage;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.INIT, 'study', 'treatment_order', function (event, helper) {
        helper.setScriptOptions({
            removeTimeFromDate: true,
            removeTimeFromEndDate: true
        });
    });

    // This allows the client to signal that it is saving a scheduled record, and so it is unnecessary to check
    // the dates for future dates, since they're supposed to be in the future.
    var allowFutureDatesForScheduledRecords = function (helper) {
        if (helper.getExtraContext().isScheduledTask) {
            helper.setScriptOptions({
                allowFutureDates: true
            });
        }
    };

    // Allow future records for the Necropsy sections that care, so that we can edit Scheduled Necropsies.
    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.INIT, 'study', 'weight', function (event, helper) {
        allowFutureDatesForScheduledRecords(helper);
    });
    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.INIT, 'study', 'bcs', function (event, helper) {
        allowFutureDatesForScheduledRecords(helper);
    });
    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.INIT, 'study', 'alopecia', function (event, helper) {
        allowFutureDatesForScheduledRecords(helper);
    });


    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'treatment_order', function (helper, scriptErrors, row) {
        if (row.date && row.enddate) {
            var startDate = EHR.Server.Utils.normalizeDate(row.date);
            var endDate = EHR.Server.Utils.normalizeDate(row.enddate);

            if (startDate - endDate === 0) {
                EHR.Server.Utils.addError(scriptErrors, 'enddate', 'Single Day Treatment', 'INFO');
            }
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'drug', function (helper, scriptErrors, row) {
        if (row.volume && row.concentration) {
            var expected = Math.round(row.volume * row.concentration * 1000) / 1000;
            if (Math.abs(row.amount - expected) > 0.2) { //allow for rounding
                EHR.Server.Utils.addError(scriptErrors, 'amount', 'Amount does not match volume for this concentration. Expected: ' + expected, 'INFO');
                //EHR.Server.Utils.addError(scriptErrors, 'volume', 'Volume does not match amount for this concentration. Expected: '+expected, 'WARN');
            }
        }

        EHR.Server.Validation.checkRestraint(row, scriptErrors);
    });

    /**
     * A helper that will infer the species based on regular expression patterns and the animal ID
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    EHR.Server.TriggerManager.registerHandler(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, function (helper, scriptErrors, row) {
        var species;
        if (row.Id && !helper.isETL()) {
            if (row.Id.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)|(^rh-([0-9]{3})$)|(^rh[a-z]{2}([0-9]{2})$)/))
                species = 'Rhesus';
            else if (row.Id.match(/(^cy?([0-9]{4,5})$)|(^c([0-9]{5})$)/))
                species = 'Cynomolgus';
            else if (row.Id.match(/(^ag([0-9]{4})$)|(^v([0-9]{5})$)/))
                species = 'Vervet';
            else if (row.Id.match(/^cj([0-9]{4})$/))
                species = 'Marmoset';
            else if (row.Id.match(/^so([0-9]{4})$/))
                species = 'Cotton-top Tamarin';
            else if (row.Id.match(/(^pt([0-9,a-z]{4})$)|(^p[0-9]{5})/))
                species = 'Pigtail';
            else if (row.Id.match(/^pd([0-9]{4})$/)) {
                if (row.species)
                    species = row.species;
                else
                    species = 'Infant';
            }

            //these are to handle legacy data:
            else if (row.Id.match(/(^rha([a-z])([0-9]{2}))$/))
                species = 'Rhesus';
            else if (row.Id.match(/(^rh-([a-z])([0-9]{2}))$/))
                species = 'Rhesus';
            else if (row.Id.match(/(^rh([0-9,a-z]{4})$)|(^rh\+([0-9]{3})$)/))
                species = 'Rhesus';
            //Special naming for a rhesus and stump tail monkey from the 70s.
            else if (row.Id.match(/(^sr-n([0-9]{2})$)/))
                species = 'Rhesus';
            else if (row.Id.match(/^cja([0-9]{3})$/))
                species = 'Marmoset';
            else if (row.Id.match(/^m([0-9]{5})$/))
                species = 'Marmoset';
            else if (row.Id.match(/^tx([0-9]{4})$/))
                species = 'Marmoset';
            //and this is to handle automated tests
            else if (row.Id.match(/^test[0-9]+$/))
                species = 'Rhesus';
            else if (row.Id.match(/(^st([0-9]{4})$)|(^s([0-9]{5})$)|(^st([0-9,a-z]{4})$)|(^st-([0-9,a-z]{3})$)/))
                species = 'Stump Tailed';
            else if (row.id.match(/(^ca([0-9]{4})$)|(^a([0-9]{5})$)/))
                species = 'Capuchin';
            else if (row.id.match(/(^gc([0-9]{4})$)/))
                species = 'Galago Crassicaudatus';
            else
                species = 'Unknown';
        }
        row.species = species;

        //check Id format
        if (!helper.isETL() && !helper.isSkipIdFormatCheck()) {
            if (row.Id && species) {
                if (species === 'Unknown') {
                    EHR.Server.Utils.addError(scriptErrors, 'Id', 'Invalid Id Format', 'INFO');
                }
                else if (species === 'Infant') {
                    species = null;
                }
            }
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'arrival', function (row) {
        var description = [];

        if (row.source)
            description.push('Source: ' + row.source);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'assignment', function (row, helper) {
        //we need to set description for every field
        var description = [];

        description.push('Start Date: ' + helper.getJavaHelper().formatDate(row.Date, null, true));
        description.push('Removal Date: ' + (row.enddate ? helper.getJavaHelper().formatDate(row.enddate, null, true): ''));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'birth', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.conception)
            description.push('Conception: ' + row.conception);

        if (row.gender)
            description.push('Gender: ' + EHR.Server.Utils.nullToString(row.gender));
        if (row.dam)
            description.push('Dam: ' + EHR.Server.Utils.nullToString(row.dam));
        if (row.sire)
            description.push('Sire: ' + EHR.Server.Utils.nullToString(row.sire));
        if (row.room)
            description.push('Room: ' + EHR.Server.Utils.nullToString(row.room));
        if (row.cage)
            description.push('Cage: ' + EHR.Server.Utils.nullToString(row.cage));
        if (row.cond)
            description.push('Cond: ' + EHR.Server.Utils.nullToString(row.cond));
        if (row.weight)
            description.push('Weight: ' + EHR.Server.Utils.nullToString(row.weight));
        if (row.wdate)
            description.push('Weigh Date: ' + EHR.Server.Utils.nullToString(row.wdate));
        if (row.origin)
            description.push('Origin: ' + row.origin);
        if (row.type)
            description.push('Type: ' + row.type);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'chemistryresults', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.testid)
            description.push('Test: ' + EHR.Server.Utils.nullToString(row.testid));
        if (row.method)
            description.push('Method: ' + row.method);

        if (row.result)
            description.push('Result: ' + EHR.Server.Utils.nullToString(row.result) + ' ' + EHR.Server.Utils.nullToString(row.units));
        if (row.qualResult)
            description.push('Qual Result: ' + EHR.Server.Utils.nullToString(row.qualResult));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'encounters', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.type)
            description.push('Type: ' + row.type);
        if (row.title)
            description.push('Title: ' + row.title);
        if (row.caseno)
            description.push('CaseNo: ' + row.caseno);
        if (row.major)
            description.push('Is Major?: ' + row.major);
        if (row.performedby)
            description.push('Performed By: ' + row.performedby);
        if (row.enddate)
            description.push('Completed: ' + EHR.Server.Utils.datetimeToString(row.enddate));

        //NOTE: only show this for non-final data
        if (row.servicerequested && row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData === false)
            description.push('Service Requested: ' + row.servicerequested);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'clinical_observations', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.category)
            description.push('Category: ' + row.category);
        if (row.area)
            description.push('Area: ' + row.area);
        if (row.observation)
            description.push('Observation: ' + row.observation);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'clinpathruns', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.type)
            description.push('Type: ' + row.type);

        if (row.serviceRequested)
            description.push('Service Requested: ' + row.servicerequested);

        if (row.sampleType)
            description.push('Sample Type: ' + row.sampleType);

        if (row.sampleId)
            description.push('Sample Id: ' + row.sampleId);

        if (row.collectedBy)
            description.push('Collected By: ' + row.collectedBy);

        if (row.collectionMethod)
            description.push('Collection Method: ' + row.collectionMethod);

        if (row.clinremark)
            description.push('Clinical Remark: ' + row.clinremark);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'deaths', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.cause)
            description.push('Cause: ' + row.cause);
        if (row.manner)
            description.push('Manner: ' + row.manner);
        if (row.necropsy)
            description.push('Necropsy #: ' + row.necropsy);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'departure', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.authorize)
            description.push('Authorized By: ' + row.authorize);

        if (row.destination)
            description.push('Destination: ' + row.destination);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'drug', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.code)
            description.push('Code: ' + EHR.Server.Utils.snomedToString(row.code, row.meaning, helper));
        if (row.route)
            description.push('Route: ' + row.route);
        if (row.volume)
            description.push('Volume: ' + row.volume + ' ' + EHR.Server.Utils.nullToString(row.vol_units));
        if (row.amount)
            description.push('Amount: ' + row.amount + ' ' + EHR.Server.Utils.nullToString(row.amount_units));


        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'hematologyresults', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.testid)
            description.push('Test: ' + EHR.Server.Utils.nullToString(row.testid));
        if (row.method)
            description.push('Method: ' + row.method);

        if (row.result)
            description.push('Result: ' + EHR.Server.Utils.nullToString(row.result));

        if (row.qualResult)
            description.push('Qualitative Result: ' + EHR.Server.Utils.nullToString(row.qualResult));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'histology', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.slideNum)
            description.push('Slide No: ' + row.slideNum);
        if (row.tissue)
            description.push('Tissue: ' + EHR.Server.Utils.snomedToString(row.tissue, null, helper));
        if (row.diagnosis)
            description.push('Diagnosis: ' + row.diagnosis);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'housing', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.room)
            description.push('Room: ' + row.room);
        if (row.cage)
            description.push('Cage: ' + row.cage);
        if (row.cond)
            description.push('Condition: ' + row.cond);

        description.push('In Time: ' + row.Date);
        description.push('Out Time: ' + EHR.Server.Utils.nullToString(row.enddate));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'notes', function (row) {
        //we need to set description for every field
        var description = [];

        description.push('Start Date: ' + (row.Date ? EHR.Server.Utils.datetimeToString(row.Date) : ''));
        description.push('End Date: ' + (row.EndDate ? EHR.Server.Utils.datetimeToString(row.EndDate) : ''));

        if (row.category)
            description.push('Category: ' + row.category);
        if (row.value)
            description.push('Value: ' + row.value);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'organ_weights', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.tissue)
            description.push('Organ/Tissue: ' + EHR.Server.Utils.snomedToString(row.tissue, row.tissueMeaning, helper));
        if (row.weight)
            description.push('Weight: ' + row.weight);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'parasitologyresults', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.organism || row.meaning)
            description.push('Organism: ' + EHR.Server.Utils.snomedToString(row.organism, row.meaning, helper));
        if (row.method)
            description.push('Method: ' + row.method);

        if (row.result)
            description.push('Result: ' + EHR.Server.Utils.nullToString(row.result) + ' ' + EHR.Server.Utils.nullToString(row.units));
        if (row.qualResult)
            description.push('Qual Result: ' + EHR.Server.Utils.nullToString(row.qualResult));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'problem', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.category)
            description.push('Category: ' + row.problem_no);

        if (row.problem_no)
            description.push('Problem No: ' + row.problem_no);

        description.push('Date Observed: ' + EHR.Server.Utils.datetimeToString(row.date));
        description.push('Date Resolved: ' + EHR.Server.Utils.datetimeToString(row.enddate));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'tissue_samples', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.tissue)
            description.push('Tissue: ' + EHR.Server.Utils.snomedToString(row.tissue, helper));
        if (row.qualifier)
            description.push('Qualifier: ' + row.qualifier);
        if (row.diagnosis)
            description.push('Diagnosis: ' + row.diagnosis);
        if (row.recipient)
            description.push('Recipient: ' + row.recipient);
        if (row.container_type)
            description.push('Container: ' + row.container_type);
        if (row.accountToCharge)
            description.push('Account to Charge: ' + row.accountToCharge);
        if (row.ship_to)
            description.push('Ship To: ' + row.ship_to);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'treatment_order', function (row, helper) {
        //we need to set description for every field
        var description = [];

        if (row.meaning)
            description.push('Meaning: ' + row.meaning);
        if (row.code || row.snomedMeaning)
            description.push('Code: ' + EHR.Server.Utils.snomedToString(row.code, row.snomedMeaning, helper));
        if (row.route)
            description.push('Route: ' + row.route);
        if (row.concentration)
            description.push('Conc: ' + row.concentration + ' ' + EHR.Server.Utils.nullToString(row.conc_units));
        if (row.dosage)
            description.push('Dosage: ' + row.dosage + ' ' + EHR.Server.Utils.nullToString(row.dosage_units));
        if (row.volume)
            description.push('Volume: ' + row.volume + ' ' + EHR.Server.Utils.nullToString(row.vol_units));
        if (row.amount)
            description.push('Amount: ' + row.amount + ' ' + EHR.Server.Utils.nullToString(row.amount_units));

        description.push('EndDate: ' + (row.enddate ? row.enddate : 'none'));


        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'urinalysisresults', function (row) {
        var description = [];

        if (row.testid)
            description.push('Test: ' + EHR.Server.Utils.nullToString(row.testid));
        if (row.method)
            description.push('Method: ' + row.method);

        if (row.result)
            description.push('Result: ' + EHR.Server.Utils.nullToString(row.result) + ' ' + EHR.Server.Utils.nullToString(row.units));
        if (row.qualResult)
            description.push('Qual Result: ' + EHR.Server.Utils.nullToString(row.qualResult));

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'weight', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.weight)
            description.push('Weight: ' + row.weight);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_INSERT, 'study', 'problem', function (helper, scriptErrors, row) {
        //autocalculate problem #
        //TODO: testing needed
        if (!helper.isETL() && row.Id) {
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: "SELECT MAX(problem_no)+1 as problem_no FROM study.problem WHERE id='" + row.Id + "'",
                //NOTE: remove QC filter because of potential conflicts: +" AND qcstate.publicdata = TRUE",
                success: function (data) {
                    if (data && data.rows && data.rows.length === 1) {
                        //console.log('problemno: '+data.rows[0].problem_no);
                        row.problem_no = data.rows[0].problem_no || 1;
                    }
                    else {
                        row.problem_no = 1;
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'study', 'blood', function (row) {
        //we need to set description for every field
        var description = [];

        if (row.quantity)
            description.push('Total Quantity: ' + row.quantity);
        if (row.performedby)
            description.push('Performed By: ' + row.performedby);
        if (row.billedby)
            description.push('Billed By: ' + row.billedby);
        if (row.assayCode)
            description.push('Assay Code', row.assayCode);
        if (row.tube_type)
            description.push('Tube Type: ' + row.tube_type);
        if (row.num_tubes)
            description.push('# of Tubes: ' + row.num_tubes);
        if (row.additionalServices)
            description.push('Additional Services: ' + row.additionalServices);

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'housing', function (helper, scriptErrors, row) {
        if (row.cage) {
            row.cage = row.cage.toLowerCase();
        }
        if (!helper.isETL()) {
            if (row.cond && row.cond.match(/x/) && !row.remark) {
                EHR.Server.Utils.addError(scriptErrors, 'cond', 'If you pick a special housing condition (x), you need to enter a remark stating the type', 'ERROR');
            }
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'obs', function (helper, scriptErrors, row) {
        //  Enforce that a trauma location must always be supplied when "Trauma" is selected as an "other observation".
        if (row.other) {
            var other = row.other.split(",");
            if ((other.length > 0) && (other.indexOf("T") >= 0)) {
                if ((row.tlocation === null) || !(row.tlocation)) {
                    EHR.Server.Utils.addError(scriptErrors, 'tlocation', "You must specify a location when indicating trauma to an animal.", 'ERROR');
                }
            }
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr', 'protocol', function (helper, scriptErrors, row) {
        if (row.protocol)
            row.protocol = row.protocol.toLowerCase();
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'blood', function (helper, scriptErrors, row) {
        if (row.additionalServices) {
            // We do not permit requests of 6mL in EDTA with CBC
            if (row.tube_type === 'EDTA' && row.tube_vol === 6 && row.additionalServices.indexOf('CBC') >= 0) {
                EHR.Server.Utils.addError(scriptErrors, 'tube_type', 'May not request draw of 6mL in EDTA with CBC', 'ERROR');
            }
        }

        // WNPRC#4350 - Require restraints for blood draws, but not for requests
        if (row.QCStateLabel === 'Completed') {
            if (!row.restraintDuration) {
                EHR.Server.Utils.addError(scriptErrors, 'restraintDuration', 'You must indicate the restraint time for blood draws.', 'ERROR');
            }
            if (!row.restraint) {
                EHR.Server.Utils.addError(scriptErrors, 'restraint', 'You must indicate the restraint used for blood draws.', 'ERROR');
            }
        }
    });

    function getHousingSQL(row) {
        var date = row.Date;
        date = EHR.Server.Utils.normalizeDate(date);
        var sqlDate = LABKEY.Query.sqlDateTimeLiteral(date);

        var sql = "SELECT Id, room, cage, lsid FROM study.housing h " +
                "WHERE h.room='" + row.room + "' AND " +
                "h.date <= " + sqlDate + " AND " +
                "(h.enddate >= " + sqlDate + " OR h.enddate IS NULL) AND " +
                "h.qcstate.publicdata = true ";

        if (row.cage)
            sql += " AND h.cage='" + row.cage + "'";
        return sql;
    }

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr', 'cage_observations', function (helper, scriptErrors, row) {
        row.performedby = row.performedby || row.userid || null;

        if (row.cage && !isNaN(row.cage)) {
            row.cage = EHR.Server.Utils.padDigits(row.cage, 4);
        }

        // Do not allow someone to mark a cage as okay with observations.
        if (row.no_observations && row.feces) {
            EHR.Server.Utils.addError(scriptErrors, 'no_observations', 'You cannot mark a cage as "OK" if there is an abnormal feces observation.', 'ERROR');
        }

        //verify an animal is housed here
        if (row.Date && row.room) {
            var sql = getHousingSQL(row);
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: sql,
                success: function (data) {
                    if (!data || !data.rows || !data.rows.length) {
                        if (!row.cage)
                            EHR.Server.Utils.addError(scriptErrors, 'room', 'No animals are housed in this room on this date', 'WARN');
                        else
                            EHR.Server.Utils.addError(scriptErrors, 'cage', 'No animals are housed in this cage on this date', 'WARN');
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, 'ehr', 'cage_observations', function (row) {
        var description = [];

        if (row.no_observations === true) {
            if (row.cage) {
                description = ["Cage Okay"]
            }
            else {
                description = ["Room Okay"]
            }
        }
        else {
            description = ['Cage Observation'];

            if (row.feces) {
                description.push('Feces: ' + row.feces);
            }
        }

        return description;
    });

    EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPDATE, 'wnprc', 'vvc', function (helper, scriptErrors, row, oldRow) {
        console.log("wnprc_trigger gets called");
        if (row.QCStateLabel === "Request: Approved" && oldRow.QCStateLabel === "Request: Pending") {
            row.dateapproved = new Date();
        }
    });

    /*EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_INSERT, 'wnprc', 'vvc', function(helper, scriptErrors, row){
        if (row.QCStateLabel == "Request: Pending" && row.requestId){
            var requestid = row.requestId;
            console.log ("new request submitted "+ requestid);
            WNPRC.Utils.getJavaHelper().sendVvcNotification(requestid);
        }
    });*/
};