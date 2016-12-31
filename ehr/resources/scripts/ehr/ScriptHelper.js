/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};

/**
 * A helper that is passed internally within the script to track values and aggregate errors
 * @class
 * @param extraContext
 * @constructor
 */
EHR.Server.ScriptHelper = function(extraContext, event, EHR){
    var startTime = new Date();
    var validationHelper = null;

    var props = {
        event: event,
        javaHelper: org.labkey.ehr.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id),
        rows: [],
        startTime: new Date(),
        extraContext: extraContext || {},
        queryName: extraContext.queryName,
        schemaName: extraContext.schemaName,
        tablesModified: [(extraContext.schemaName + ';' + extraContext.queryName).toString()],
        notificationRecipients : [],
        participantsModified: [],
        publicParticipantsModified: [],
        importPathway: extraContext.importPathway,
        tasksModified: [],
        requestsModified: [],
        requestsDenied: {},
        requestsCompleted: {},
        missingParticipants: [],
        PKsModified: [],
        publicPKsModified: [],
        demographicsMap: {},
        errorQcLabel: 'Review Required',
        verbosity: 0,
        quickValidation: false,
        errorThreshold: null,
        newIdsAdded: {}
    };

    //test to see if GUID persisted across tables
    props.sessionGUID = extraContext.sessionGUID || LABKEY.Utils.generateUUID();

    var scriptOptions = {
        datasetsToClose: ['Assignment', 'Cases', 'Housing', 'Treatment Orders', 'Notes', 'Problem List'],
        allowFutureDates: false,
        removeTimeFromDate: false,
        removeTimeFromEndDate: false,
        allowRequestsInPast: false,
        allowDeadIds: false,
        allowAnyId: false,
        skipIdFormatCheck: false,
        skipHousingCheck: false,
        skipAssignmentCheck: false,
        notificationTypes: null,
        errorSeveritiyForImproperHousing: 'WARN',
        errorSeveritiyForImproperAssignment: 'INFO',
        requiresStatusRecalc: false,
        allowDatesInDistantPast: false,
        lookupValidationFields: [],
        cacheAccount: true,
        announceAllModifiedParticipants: false,
        doStandardProtocolCountValidation: true
    };

    var cachedValues = {
        liveBirths: {},
        deaths: {},
        arrivals: {},
        departures: {},
        housing: {}
    };

    //allow scripts to register handlers that aggregate row data in this transaction
    var rowProcessors = [];

    function cacheValue(id, date, type){
        if (!cachedValues[type][id]){
            cachedValues[type][id] = [];
        }

        if (cachedValues[type][id].indexOf(date) == -1){
            cachedValues[type][id].push(date);
        }
        else {
            console.log('aready exists');
        }
    }

    //NOTE: do i need to call this after init() runs?
    setScriptOptionsFromExtraContext();

    //we allow the client to pass limited options using extraContext
    //this function is where all processing of client JSON -> server options should reside
    function setScriptOptionsFromExtraContext(){
        LABKEY.ExtAdapter.each(['skipIdFormatCheck', 'allowAnyId', 'allowDatesInDistantPast'], function(name){
            if (extraContext[name])
                scriptOptions[name] = extraContext[name];
        }, this);
    }

    return {
        setScriptOptions: function(opts){
            LABKEY.ExtAdapter.apply(scriptOptions, opts);
        },

        getValidationHelper: function(){
            if (validationHelper == null)
                validationHelper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, extraContext.schemaName, extraContext.queryName);

            return validationHelper;
        },

        getLookupValidationFields: function(){
            return scriptOptions.lookupValidationFields;
        },

        shouldRemoveTimeFromDate: function(){
            return scriptOptions.removeTimeFromDate;
        },

        shouldAllowRequestsInPast: function(){
            return scriptOptions.allowRequestsInPast;
        },

        shouldRemoveTimeFromEndDate: function(){
            return scriptOptions.removeTimeFromEndDate;
        },

        isSkipIdFormatCheck: function(){
            return scriptOptions.skipIdFormatCheck;
        },

        getExtraContext: function(){
            return props.extraContext;
        },

        getScriptOptions: function(){
            return scriptOptions;
        },

        getSchemaName: function(){
            return props.schemaName;
        },

        getQueryName: function(){
            return props.queryName;
        },

        logDebugMsg: function(msg){
            if (props.verbosity > 0)
                console.log(msg);
        },

        getJavaHelper: function(){
            return props.javaHelper;
        },

        getImportPathway: function(){
            return props.importPathway;
        },

        isEHRDataEntry: function(){
            return this.getImportPathway() == 'ehr-ext4DataEntry' || this.getImportPathway() == 'ehr-ext3DataEntry'
        },

        //validateOnly is the old-style flag, and must be differentiated in some places
        isValidateOnly: function(){
            return !!(props.extraContext.isValidateOnly || props.extraContext.validateOnly);
        },

        getTargetQCStateLabel: function(){
            return props.extraContext.targetQC;
        },

        doSkipRequestInPastCheck: function(){
            return !!props.extraContext.skipRequestInPastCheck;
        },

        isETL: function(){
            return props.extraContext.dataSource == 'etl';
        },

        shouldSendNotifications: function(){
            return scriptOptions.notificationTypes != null;
        },

        notificationTypes: function(){
            return scriptOptions.notificationTypes;
        },

        getStartTime: function(){
            return startTime;
        },

        getTimeElapsed: function(){
            return ((new Date()) - startTime) / 1000;
        },

        getRows: function(){
            return props.rows
        },

        addRow: function(row){
            props.rows.push(row);
        },

        runRowProcessors: function(row){
            if (rowProcessors.length){
                for (var i=0; i<rowProcessors.length; i++){
                    rowProcessors[i](this, row);
                }
            }
        },

        registerRowProcessor: function(fn){
            rowProcessors.push(fn);
        },

        setErrorThreshold: function(threshold){
                props.errorThreshold = threshold;
        },

        getErrorThreshold: function(){
            return props.errorThreshold;
        },

        setQuickValidation: function(val){
            props.quickValidation = val;
        },

        isQuickValidation: function(){
            return props.quickValidation;
        },

        getDemographicsMap: function(){
            return props.demographicsMap;
        },

        getMissingParticipantArray: function(){
            return props.missingParticipants;
        },

        cacheDemographics: function(id, row){
            props.demographicsMap[id] = row;
        },

        addMissingParticipant: function(id){
            if (props.missingParticipants.indexOf(id) == -1)
                props.missingParticipants.push(id);
        },

        isAllowAnyId: function(){
            return scriptOptions.allowAnyId;
        },

        doStandardProtocolCountValidation: function(){
            return scriptOptions.doStandardProtocolCountValidation;
        },

        isAllowDeadIds: function(){
            return scriptOptions.allowDeadIds;
        },

        isAllowShippedIds: function(){
            return scriptOptions.allowShippedIds;
        },

        addSkippedError: function(recordId, error){
            if (!props.extraContext.skippedErrors)
                props.extraContext.skippedErrors = {};

            if(!props.extraContext.skippedErrors[recordId])
                props.extraContext.skippedErrors[recordId] = [];

            props.extraContext.skippedErrors[recordId].push(error);
        },
        
        isLegacyFormat: function(){
            return props.extraContext.isLegacyFormat;
        },

        getErrorQcLabel: function(){
            return props.errorQcLabel;
        },

        addParticipantModified: function(id, qcLabel){
            if (!id)
                return;

            if (props.participantsModified.indexOf(id) == -1){
                props.participantsModified.push(id);
            }

            if (qcLabel && EHR.Server.Security.getQCStateByLabel(qcLabel).PublicData){
                if (props.publicParticipantsModified.indexOf(id) == -1){
                    props.publicParticipantsModified.push(id);
                }
            }            
        },
        
        getKeyField: function(){
            return props.extraContext.keyField;
        },
        
        addPKModified: function(key, qcLabel){
            if (key && props.PKsModified.indexOf(key) == -1){
                props.PKsModified.push(key);

                if (qcLabel && EHR.Server.Security.getQCStateByLabel(qcLabel).PublicData)
                    props.publicPKsModified.push(key);
            }            
        },
        
        addRequestModified: function(requestId, row, qcLabel, oldQcLabel){
            if (props.requestsModified.indexOf(requestId) == -1)
                props.requestsModified.push(requestId);

            if (qcLabel){
                //track requests being denied
                if (qcLabel == 'Request: Denied' || qcLabel == 'Request: Cancelled'){
                    if (oldQcLabel != 'Request: Denied' && oldQcLabel != 'Request: Cancelled'){
                        if (!props.requestsDenied[requestId])
                            props.requestsDenied[requestId] = [];

                        props.requestsDenied[requestId].push(row);
                    }
                }

                //track requests being completed
                if (qcLabel == 'Completed'){
                    if (oldQcLabel != 'Completed'){
                        if (!props.requestsCompleted[requestId])
                            props.requestsCompleted[requestId] = [];

                        props.requestsCompleted[requestId].push(row);
                    }
                }
            }
        },

        addTaskModified: function(taskId, qcLabel){
            if (props.tasksModified.indexOf(taskId) == -1)
                props.tasksModified.push(taskId);


        },

        getProperty: function(name){
            return props[name];
        },

        setProperty: function(name, val){
            props[name] = val;
        },

        getNotificationRecipients: function(){
            return props.notificationRecipients;
        },

        getRequestsModified: function(){
            return props.requestsModified;
        },

        getRequestsDenied: function(){
            return props.requestsDenied;
        },

        getRequestsCompleted: function(){
            return props.requestsCompleted;
        },

        getParticipantsModified: function(){
            return props.participantsModified;
        },

        getPublicParticipantsModified: function(){
            return props.publicParticipantsModified;
        },

        getPKsModified: function(){
            return props.PKsModified;
        },

        isSkipHousingCheck: function(){
            return scriptOptions.skipHousingCheck
        },

        getTablesModified: function(){
            return props.tablesModified;
        },

        announceAllModifiedParticipants: function(){
            return scriptOptions.announceAllModifiedParticipants;
        },

        // this was added to allow situations like programmatic update of housing records.  the initial update
        // will cause DemographicCache to re-populate, and we dont want the cascade update to trigger this expensive process twice.
        skipAnnounceChangedParticipants: function(){
            return !!props.extraContext.skipAnnounceChangedParticipants;
        },

        isSkipAssignmentCheck: function(){
            return scriptOptions.skipAssignmentCheck
        },

        getRequestDeniedArray: function(){
            var requests = [];
            for (var i in props.requestsDenied){
                var rows = props.requestsDenied[i];
                requests.push(i);
            }

            return requests;
        },

        getRequestCompletedArray: function(){
            var requests = [];
            for (var i in props.requestsCompleted){
                var rows = props.requestsCompleted[i];
                requests.push(i);
            }

            return requests;
        },

        getNewIdsAdded: function(){
            return props.newIdsAdded;
        },

        addNewAnimalForProtocol: function(id, protocol){
            if (!props.newIdsAdded[protocol])
                props.newIdsAdded[protocol] = [];

            if (props.newIdsAdded[protocol].indexOf(id) == -1)
                props.newIdsAdded[protocol].push(id);
        },

        isAllowFutureDates: function(){
            return scriptOptions.allowFutureDates;
        },

        getErrorSeveritiyForImproperHousing: function(){
            return scriptOptions.errorSeveritiyForImproperHousing;
        },

        isGeneratedByServer: function(){
            return props.extraContext.generatedByServer;
        },

        doUpdateStatusField: function(){
            if (this.isGeneratedByServer()){
                console.log('skipping calculated_status update for query: ' + this.getQueryName());
                return;
            }

            var ids = this.getPublicParticipantsModified();
            if (ids && ids.length){
                this.getJavaHelper().updateStatusField(ids, cachedValues['liveBirths'], cachedValues['arrivals'], cachedValues['deaths'], cachedValues['departures']);
            }
        },

        isVet: function(){
            return this.getJavaHelper().isVet();
        },

        registerLiveBirth: function(id, date){
            cacheValue(id, date, 'liveBirths');
        },

        registerDeath: function(id, date){
            cacheValue(id, date, 'deaths');
        },

        registerArrival: function(id, date){
            cacheValue(id, date, 'arrivals');
        },

        registerDeparture: function(id, date){
            cacheValue(id, date, 'departures');
        },

        registerHousingChange: function(id, row){
            cacheValue(id, row, 'housing');
        },

        getDeaths: function(){
            return cachedValues['deaths'];
        },

        getHousingChanges: function(){
            return cachedValues['housing'];
        },

        /**
         * When an animal dies or leaves the center, this will close any open records (ie. the death/depart time inserted into the enddate field) for any records in assignment, housing, problem list and treatment orders.
         * @param participant The Id of the participant
         * @param date The date of the event.
         */
        onDeathDeparture: function(id, date){
            //close housing, assignments, treatments
            console.log('on death departure: ' + id);
            var changedTables = this.getJavaHelper().closeActiveDatasetRecords(scriptOptions.datasetsToClose, id, date);
            if (changedTables){
                changedTables = changedTables.split(';');
                for (var i=0;i<changedTables.length;i++){
                    this.addTableModified('study', changedTables[i]);
                }
            }
        },

        addTableModified: function(schemaName, queryName){
            props.tablesModified.push(schemaName + ';' + queryName);
        },

        isRequiresStatusRecalc: function(){
            return scriptOptions.requiresStatusRecalc;
        },

        getEvent: function(){
            return props.event;
        },

        decodeExtraContextProperty: function(name, defaultValue){
            var prop = props.extraContext[name] || defaultValue || {};
            if (LABKEY.ExtAdapter.isString(prop)){
                prop = LABKEY.ExtAdapter.decode(prop);
            }
            this.setProperty(name, prop);
        },

        getSessionGUID: function(){
            return props.sessionGUID;
        },

        allowDatesInDistantPast: function(){
            //NOTE: if generated by the server, assume we allow past dates.  an example would be birth inserts
            return this.isGeneratedByServer() || scriptOptions.allowDatesInDistantPast;
        },

        getErrorSeveritiyForImproperAssignment: function(){
            return scriptOptions.errorSeveritiyForImproperAssignment;
        },

        getSNOMEDCodeFieldName: function(){
            return scriptOptions.snomedCodeFieldName;
        },

        doCacheAccount: function(){
            return scriptOptions.cacheAccount;
        }
    }
};