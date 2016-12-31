/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * Include the appropriate external scripts and export them
 */
var console = require("console");
exports.console = console;

var LABKEY = require("labkey");
exports.LABKEY = LABKEY;

var EHR = {};
exports.EHR = EHR;

/**
 * A namespace for server-side JS code that is used in trigger/validation scripts.
 * @namespace
 */
EHR.Server = {};

EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

EHR.Server.Security = require("ehr/security").EHR.Server.Security;

EHR.Server.TriggerManager = require("ehr/triggerManager").EHR.Server.TriggerManager;

EHR.Server.Validation = require("ehr/validation").EHR.Server.Validation;

EHR.Server.ScriptHelper = require("ehr/ScriptHelper").EHR.Server.ScriptHelper;

EHR.Assert = require("ldk/Assert").LDK.Server.Assert;

/**
 * This class handles the server-side validation/transform that occurs in the EHR's trigger scripts.  It should be used by every EHR dataset.  The purpose is to centralize
 * complex code into one single pathway for all incoming records.  The trigger scripts of individual records can include this code (see example script below).  This
 * replaces the default functions LabKey expects including beforeInsert, beforeUpdate, etc.  Without the dataset's trigger script, you will include this code, then
 * create functions only to handle the dataset-specific needs.  For example, the Blood Draws dataset contains extra validation that is needed prior to every insert/update.
 * As a result, this script includes an additional onUpsert() function that will get called.  The minimal code needed in each dataset's validation script is:
 * <p>
 *
 * require("ehr/triggers").initScript(this);
 *
 * <p>
 * This line of code will import method to handle all LabKey's core events, like beforeInsert(), beforeUpdate, afterInsert(), etc.
 * If your script needs to inject other custom code, see the TriggerManager to register handlers.
 *
 * @name EHR.Server.Triggers
 * @class
 */
EHR.Server.Triggers = {};


/**
 * This overrides the default init() function on scripts inheriting this code.  It performs the following:
 * <br>1. Sets up the ScriptHelper, which used to pass information between method and to track information such as the distinct participants modified in this script
 * <br>2. If the dataset's trigger script contains a function named onInit(), it will be called and passed the following arguments:
 * <br>
 * <li>event: the name of this event (ie. insert, update, delete)</li>
 * <li>helper: The script helper
 * @param {string} event The name of the event, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.init = function(event, errors){
    var fileParse = (this['javax.script.filename']).split('/');
    this.extraContext.schemaName = fileParse[1];
    this.extraContext.queryName = fileParse[2].replace(/\.js$/, '');

    // even though it is cached globally, force code to use local passed reference 
    this.scriptHelper = new EHR.Server.ScriptHelper(this.extraContext, event, EHR);
    var helper = this.scriptHelper;

    console.log('** evaluating: ' + this['javax.script.filename'] + ' for: ' + (helper.isValidateOnly() ? 'validation/' : '') + event);

    EHR.Server.Security.init(helper);

    var handlers = [];
    if (this.onInit){
        handlers.push(this.onInit);
    }

    var initHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.INIT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (initHandlers.length)
        handlers = handlers.concat(initHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, event, helper, EHR);
        }
    }
};
exports.init = EHR.Server.Triggers.init;


/**
 * This should override the default beforeInsert() function on scripts inheriting this code.  Will be called once for each row being inserted.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. Calls EHR.Server.Triggers.rowInit(), which is a method shared by both insert/update actions.
 * <br>3. If the incoming record is a request, it forces this newly inserted record to have a future date
 * <br>4. If the dataset's trigger script contains a function named onUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>helper: The script helper
 * <li>scriptErrors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <br>5. If the dataset's trigger script contains a function named onInsert(), it will be called and pass the same arguments as onUpsert():
 * <br>6. Calls EHR.Server.Triggers.rowEnd(), which is a method shared by both insert/update actions.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeInsert = function(row, errors){
    var scriptErrors = {};
    
    var helper = this.scriptHelper;
    helper.logDebugMsg("beforeInsert: ");
    helper.logDebugMsg(row);

    if (EHR.Server.Security.verifyPermissions('insert', row) === false){
        errors._form = 'Insufficient permissions to insert: ' + helper.getQueryName() + ' with status: ' + row.QCStateLabel;
        return;
    }

    //NOTE: it would be better not to call in the same scope, but we currently
    //let scripts place methods like onBecomePublic in the global scope
    EHR.Server.Triggers.rowInit.call(this, helper, scriptErrors, row, null);

    //force newly inserted requests to have future dates
    if (!helper.shouldAllowRequestsInPast() && row.date && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest){
        var now = new Date();
        // NOTE: the removeTimeFromDate flag indicates that that tables only considers date (not datetime).  therefore we need to
        // use a different value when considering past dates
        if (helper.shouldRemoveTimeFromDate()) {
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        //if the row's date appears to be date-only, we adjust now accordingly
        if (row.date.getHours()==0 && row.date.getMinutes()==0) {
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        now = now.getTime();
        var timeDiffMills = now - row.date.getTime();

        //allow a reasonable window to support inserts from other scripts
        if (!helper.doSkipRequestInPastCheck() && timeDiffMills > (1000 * 60 * 10)) { //10 minutes
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot place a request in the past', 'ERROR');
        }

        //TODO: conditionalize range?
        if ((-1 * timeDiffMills) > (1000 * 60 * 60 * 24 * 30)) //30 days
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot place a request more than 30 days in the future', 'ERROR');
    }

    //dataset-specific beforeInsert
    var handlers = [];
    if (this.onUpsert){
        handlers.push(this.onUpsert);
    }

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if (this.onInsert){
        handlers.push(this.onInsert);
    }

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_INSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, helper, scriptErrors, row);
        }
    }

    EHR.Server.Triggers.rowEnd.call(this, helper, errors, scriptErrors, row, null);
};
exports.beforeInsert = EHR.Server.Triggers.beforeInsert;


/**
 * This should override the default afterInsert() function on scripts inheriting this code.  Will be called once for each row being inserted.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>helper: The script helper
 * <li>scriptErrors: The error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <br>3. If the dataset's trigger script contains a function named onAfterInsert(), it will be called and passed the same arguments as onAfterUpsert().
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterInsert = function(row, errors){
    var helper = this.scriptHelper;
    
    helper.logDebugMsg('after insert');

    EHR.Server.Triggers.afterEvent('insert', helper, errors, row, null);

    var handlers = [];
    if (this.onAfterUpsert)
        handlers.push(this.onAfterUpsert);

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if (this.onAfterInsert)
        handlers.push(this.onAfterInsert);

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_INSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, helper, errors, row);
        }
    }
};
exports.afterInsert = EHR.Server.Triggers.afterInsert;


/**
 * This should override the default beforeUpdate() function on scripts inheriting this code.  Will be called once for each row being updated.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. Calls EHR.Server.Triggers.rowInit(), which is a method shared by both insert/update actions.
 * <br>3. If the dataset's trigger script contains a function named onUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>helper: The script helper, which provides context and helper methods for this script
 * <li>scriptErrors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * <br>4. If the dataset's trigger script contains a function named onUpdate(), it will be called and pass the same arguments as onUpsert():
 * <br>5. Calls EHR.Server.Triggers.rowEnd(), which is a method shared by both insert/update actions.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeUpdate = function(row, oldRow, errors){
    var helper = this.scriptHelper;
    var scriptErrors = {};

    helper.logDebugMsg('beforeUpdate: ');
    helper.logDebugMsg(row);

    if (EHR.Server.Security.verifyPermissions('update', row, oldRow) === false){
        errors._form = 'Insufficient permissions to update: ' + helper.getQueryName() + ' to status: ' + row.QCStateLabel + ', from: ' + (oldRow ? oldRow.QCStateLabel : '<none>');
        return;
    }

    // NOTE: this is designed to merge the old row into the new one.  this would be important if you do an update and only provide
    // the property to be changed.  the other properties would remain unchanged
    for (var prop in oldRow){
        if (!row.hasOwnProperty(prop) && LABKEY.ExtAdapter.isDefined(oldRow[prop])){
            row[prop] = oldRow[prop];
        }
    }

    //NOTE: it would be better not to call in the same scope, but we currently
    //let scripts place methods like onBecomePublic in the global scope
    EHR.Server.Triggers.rowInit.call(this, helper, scriptErrors, row, oldRow);

    //NOTE: if this record is a cancelled request, do not allow it to be part of a task
    if (row.QCStateLabel == 'Request: Cancelled' || row.QCStateLabel == 'Request: Denied'){
        row.taskId = null;
    }

    //dataset-specific beforeUpdate
    var handlers = [];
    if (this.onUpsert){
        handlers.push(this.onUpsert);
    }

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if (this.onUpdate)
        handlers.push(this.onUpdate);

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPDATE, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, helper, scriptErrors, row, oldRow);
        }
    }

    EHR.Server.Triggers.rowEnd.call(this, helper, errors, scriptErrors, row, oldRow);
};
exports.beforeUpdate = EHR.Server.Triggers.beforeUpdate;


/**
 * This should override the default afterUpdate() function on scripts inheriting this code.  Will be called once for each row being updated.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>helper: The script helper
 * <li>scriptErrors: The local error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * <br>3. If the dataset's trigger script contains a function named onAfterUpdate(), it will be called and passed the same arguments as onAfterUpsert().
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterUpdate = function(row, oldRow, errors){
    var helper = this.scriptHelper;
    helper.logDebugMsg('after update');

    EHR.Server.Triggers.afterEvent('update', helper, errors, row, oldRow);

    //table-specific handlers
    var handlers = [];
    if (this.onAfterUpsert)
        handlers.push(this.onAfterUpsert);

    var afterUpsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (afterUpsertHandlers.length)
        handlers = handlers.concat(afterUpsertHandlers);

    if (this.onAfterUpdate)
        handlers.push(this.onAfterUpdate);

    var afterUpdateHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPDATE, helper.getSchemaName(), helper.getQueryName(), true) || [];
    if (afterUpdateHandlers.length)
        handlers = handlers.concat(afterUpdateHandlers);

    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, helper, errors, row, oldRow);
        }
    }
};
exports.afterUpdate = EHR.Server.Triggers.afterUpdate;


/**
 * This should override the default beforeDelete() function on scripts inheriting this code.  Will be called once for each row being deleted.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. If the dataset's trigger script contains a function named onDelete(), it will be called and passed the following arguments:
 * <br>
 * <li>helper: The script helper
 * <li>errors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>row: The row object, as passed by LabKey</li>
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeDelete = function(row, errors){
    var helper = this.scriptHelper;
    helper.logDebugMsg('beforeDelete: ');

    if (EHR.Server.Security.verifyPermissions('delete', row) === false){
        errors._form = 'Insufficient permissions to delete: ' + helper.getQueryName() + ' with status: ' + row.QCStateLabel;
        return;
    }

    //table-specific handlers
    var handlers = [];
    if (this.onDelete)
        handlers.push(this.onDelete);

    var beforeDeleteHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_DELETE, helper.getSchemaName(), helper.getQueryName(), true);
    if (beforeDeleteHandlers.length)
        handlers = handlers.concat(beforeDeleteHandlers);
    
    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, helper, errors, row);
        }
    }
}
exports.beforeDelete = EHR.Server.Triggers.beforeDelete;


/**
 * This should override the default afterDelete() function on scripts inheriting this code.  Will be called once for each row being deleted.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterDelete(), it will be called and passed the following arguments:
 * <br>
 * <li>helper The script helper
 * <li>errors: The LabKey error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterDelete = function(row, errors){
    var helper = this.scriptHelper;
    
    EHR.Server.Triggers.afterEvent('delete', helper, errors, row, null);

    if (!helper.isETL() && helper.getSNOMEDCodeFieldName()){
        if (!row.objectid){
            console.error('Record lacks objectid, cannot delete snomed tags');
            console.log(row);
        }
        else {
            helper.getJavaHelper().deleteSnomedTags(row.objectid);
        }
    }

    //table-specific handlers
    if (!helper.isETL()){
        var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_DELETE, helper.getSchemaName(), helper.getQueryName(), true) || [];

        if (this.onAfterDelete)
            handlers.unshift(this.onAfterDelete);

        if (handlers && handlers.length){
            for (var i=0;i<handlers.length;i++){
                handlers[i].call(this, helper, errors, row);
            }
        }
    }
}
exports.afterDelete = EHR.Server.Triggers.afterDelete;


/**
 * This should override the default complete() function on scripts inheriting this code.  It performs the following:
 * <br>1. If the dataset's trigger script contains a function named onComplete(), it will be called and passed the following arguments:
 * <br>
 * <li>event: the name of this event (ie. insert, update, delete)</li>
 * <li>errors: the LabKey errors object</li>
 * <li>helper: The script helper
 * <br>2. If the current table is not ehr.requests, and if helper.getRequestsCompleted() or helper.getRequestsDenied() have items, then emails will be sent to the notification recipients for each completed/denied request
 * @param {string} event The name of the event, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.complete = function(event, errors) {
    var helper = this.scriptHelper;
    
    helper.logDebugMsg('Event complete: '+event);
    if (helper.getParticipantsModified().length > 100) {
        helper.logDebugMsg(helper.getParticipantsModified().length + ' participants modified.');
    }
    else {
        helper.logDebugMsg('Participants modified: ' + helper.getParticipantsModified());
    }

    if (helper.getPKsModified().length > 100) {
        helper.logDebugMsg(helper.getPKsModified().length + ' PKs modified.');
    }
    else {
        helper.logDebugMsg('PKs modified: ' + helper.getPKsModified());
    }

    if (helper.isValidateOnly()){
        helper.logDebugMsg('Validating, so skipping onComplete');
        return;
    }

    var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.COMPLETE, helper.getSchemaName(), helper.getQueryName(), true) || [];

    if (this.onComplete)
        handlers.unshift(this.onComplete);

    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, event, errors, helper);
        }
    }

    if (helper.isRequiresStatusRecalc() && helper.getPublicParticipantsModified().length && !helper.isETL()){
        helper.doUpdateStatusField();
    }

    //only do this if we're not in the ehr.requests script
    if ((helper.getQueryName() && !helper.getQueryName().match(/requests/i))){
        if (helper.getRequestsModified() && helper.getRequestsModified().length){
            helper.logDebugMsg('requests modified:');
            helper.logDebugMsg(helper.getRequestsModified());
        }

        var requestsDenied = helper.getRequestDeniedArray();
        if (!LABKEY.ExtAdapter.isEmpty(requestsDenied)){
            helper.logDebugMsg('requests denied:');
            helper.logDebugMsg(requestsDenied);

            helper.getJavaHelper().processDeniedRequests(requestsDenied);
        }

        var requestsCompleted = helper.getRequestCompletedArray();
        if (!LABKEY.ExtAdapter.isEmpty(requestsCompleted)){
            //console.log('The following requests were completed in this batch:');
            //console.log(requestsCompleted);
            helper.getJavaHelper().processCompletedRequests(requestsCompleted);
        }
    }

    if (helper.announceAllModifiedParticipants() && helper.getParticipantsModified().length){
        helper.getJavaHelper().announceIdsModified(helper.getTablesModified(), helper.getParticipantsModified(), helper.isETL());
    }
    else if (helper.getPublicParticipantsModified().length && !helper.skipAnnounceChangedParticipants()){
        helper.getJavaHelper().announceIdsModified(helper.getTablesModified(), helper.getPublicParticipantsModified(), helper.isETL());
    }

    if (helper.getRows().length){
        console.log('Trigger script time for ' + (helper.isValidateOnly() ? 'validation/' : '') + event + ' of ' + helper.getRows().length + ' rows into ' + helper.getQueryName() + ': ' + helper.getTimeElapsed());
    }
};
exports.complete = EHR.Server.Triggers.complete;


/**
 * This performs a set of checks shared by both beforeInsert() and beforeUpdate().  It is meant to be called internally and should not be used directly.
 * It includes the following:
 * <br>1. Converts any empty strings in the row to null
 * <br>2. Queries and caches the study.demographics record (if extraContext.quickValidation is not true).  If this record is found, it performes the following:
 * <br>
 * <li>If the row has a property called 'id/curlocation/location', this will be populated with the current room/cage of the animal/</li>
 * <li>Checks whether this ID exists in study.demographics and is currently located at the center.  If not, it will return an error of severity INFO.  However, if this record is a request QCState, the error will be a warning, which prevents submission.</li>
 * <br>4. If a project is provided and it is not numeric, an error is thrown
 * <br>5. If an Id, date and project are provided, it checks whether the current animal is assigned to that project on the supplied date.  This is skipped for the assignment table or if helper.isQuickValidation() is true.
 * <br>6. If Id, Date and room or cage are provided it will verify whether the animal was housed in the specified room/cage at the date provided.  This is skipped for the house & birth tables or if helper.isQuickValidation() is true.
 * <br>7. If enddate is supplied, verify it is after the start date
 * <br>8. If the QCState is 'Completed', it will not allow future dates
 * <br>9. The account will be converted to lowercase, if provided
 * <br>10. Dates more than 1 year in the future or 60 in the past will be flagged as suspicious
 * <br>11. If this record is becoming public (meaning either it is inserted as a public QCState or it is updated from a non-public QCState to a public one), then the following occurs:
 * <li>If the current row has a value for project, it will store the account associated with this record.  This is useful as the 'account at the time', since the account associated with a project could change at future dates</li>
 * <li>If the script contains a function called onBecomePublic(), it will be called with the following arguments:</li>
 * <ul>
 * <li>errors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>helper: The script helper
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * </ul>
 *
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.rowInit = function(helper, scriptErrors, row, oldRow){
    helper.logDebugMsg('rowInit: ' + helper.getTimeElapsed());
    helper.logDebugMsg(row);

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (LABKEY.ExtAdapter.isEmpty(row[i])){
            row[i] = null;
        }
    }

    //trim spaces around fields that may contain Ids
    var fieldNames = ['Id', 'dam', 'sire'];
    for (var fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
        var field = fieldNames[fieldIndex];
        if (row[field]) {
            row[field] = EHR.Server.Utils.trim(row[field]);
        }
    }

    //normalize these values to JS date objects
    //NOTE: it is important to only assign a value to these if they started with a value
    if (row.date) {
        row.date = EHR.Server.Utils.normalizeDate(row.date);
    }
    if (row.begindate){
        row.begindate= EHR.Server.Utils.normalizeDate(row.begindate);
    }
    if (row.enddate) {
        row.enddate = EHR.Server.Utils.normalizeDate(row.enddate);
    }

    if (helper.isETL()){
        helper.logDebugMsg('Row is from ETL');

        //we ignore all errors from ETL records.  they will get flagged as review required
        helper.setErrorThreshold('WARN');

        //this allows for individual modules to provide custom ETL code, acting per row
        if (EHR.ETL)
            EHR.ETL.fixRow(helper, scriptErrors, row);
    }

    //NOTE: this is placed after fixRow(), because this method may place a value for null dates, and we still want to truncate it
    if (!helper.isETL() && helper.shouldRemoveTimeFromDate())
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors);
    if (!helper.isETL() && row.enddate && helper.shouldRemoveTimeFromEndDate())
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors, 'enddate');

    //allows scripts to register scripts to run against this row.  currently used primarily to track high level summaries
    helper.runRowProcessors(row);

    if (row.Id && !helper.isQuickValidation() && !helper.isETL()){
        EHR.Server.Validation.validateAnimal(helper, scriptErrors, row, 'Id');

        //TODO: might want to remove this and handle client-side
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    //certain forms display current location.  if the row has this property, but it is blank, we add it.
                    //not validation per se, but useful to forms
                    if (row.Id && row.hasOwnProperty('id/curlocation/location')){
                        var location = data['id/curlocation/room'] || '';

                        if (data['id/curlocation/cage'])
                            location += '-' + data['id/curlocation/cage'];

                        row['id/curlocation/location'] = location;
                    }
                }
            }
        });
    }

    //validate project / assignment to that project
    //also add account if the project is found
    if (row.project && isNaN(row.project)){
        EHR.Server.Utils.addError(scriptErrors, 'project', 'Project must be numeric: ' + row.project, 'ERROR');
        delete row.project;
    }

    //skip if doing assignments
    if (!helper.isQuickValidation() &&
        !helper.isETL() &&
        row.project && row.Id && row.date &&
        !helper.getJavaHelper().isDefaultProject(row.project) &&
        !helper.isSkipAssignmentCheck()
    ){
        var assignmentErrors = helper.getJavaHelper().validateAssignment(row.Id, row.project, row.date);
        if (assignmentErrors){
            EHR.Server.Utils.addError(scriptErrors, 'project', assignmentErrors, helper.getErrorSeveritiyForImproperAssignment());
        }
    }

    //validate housing if present
    if (!helper.isQuickValidation() &&
        !helper.isETL() &&
        row.room && row.Id && row.date &&
        !helper.isSkipHousingCheck()
    ){
        helper.logDebugMsg('Verifying room/cage:');
        if (!helper.getJavaHelper().validateHousing(row.Id, row.room, row.cage, row.date)){
            EHR.Server.Utils.addError(scriptErrors, 'room', 'Not housed in this location on this date', helper.getErrorSeveritiyForImproperHousing());
        }
    }

    //enddate: verify either blank or not prior to date
    if (!helper.isETL() && row.enddate && row.date){

        var start = row.date.getTime();
        var end = row.enddate.getTime();

        if (row.begindate){
           start = row.begindate.getTime();
        }

        if (start > end){
            EHR.Server.Utils.addError(scriptErrors, 'enddate', 'End date must be after start date', 'WARN');
        }
    }

    //lookup validations
    if (helper.getLookupValidationFields() && helper.getLookupValidationFields().length){
        var lookupFields = helper.getLookupValidationFields();
        for (var i=0;i<lookupFields.length;i++){
            var f = lookupFields[i];
            var val = row[f];
            if (!LABKEY.ExtAdapter.isEmpty(val)){
                var normalizedVal = helper.getValidationHelper().getLookupValue(val, f);
                if (LABKEY.ExtAdapter.isEmpty(normalizedVal)){
                    EHR.Server.Utils.addError(scriptErrors, f, 'Unknown value for field: ' + f + '. Value was: ' + val, helper.isEHRDataEntry() ? 'WARN' : 'ERROR');
                }
                else {
                    row[f] = normalizedVal;  //cache value for purpose of normalizing case
                }
            }
        }
    }

    //dont allow future dates on completed records
    if (row.date && row.QCStateLabel == 'Completed' && !helper.isAllowFutureDates()){
        var now = new Date();
        if (helper.shouldRemoveTimeFromDate())
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var timeDiff = (row.date.getTime() - now.getTime()) / 1000;
        if (timeDiff > 3600){
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Date is in the future', 'INFO');
        }
    }

    //if the current user is a vet, review is implied, otherwise null out vetreview
    if (!helper.isETL() && !helper.isValidateOnly()){
        if (helper.isVet()){
            row.vetreview = LABKEY.Security.currentUser.displayName;
            row.vetreviewdate = new Date();
        }
        else {
            row.vetreview = null;
        }
    }

    if (row._becomingPublicData){
        //automatically track the date the record was finalized, which may be important for billing or general auditing
        //because the ETL can cause previously created records to be re-sent, we must assume the record's date is the finalized date for those
        if (helper.isETL()){
            row.datefinalized = row.date;
        }
        else {
            //note: if date is in future, defer to the row date
            row.datefinalized = new Date();
            if (row.date && row.date.getTime() > row.datefinalized.getTime()){
                row.datefinalized = row.date;
            }
        }

        //set account based on project.  do differently depending on insert/update.
        //we only do this one time when the row becomes public, b/c project/account relationships can change
        if (helper.doCacheAccount() && !helper.isETL() && !row.account && row.project){
            var account = helper.getJavaHelper().getAccountForProject(row.project);
            helper.logDebugMsg('setting account to: ' + account);
            row.account = account;
        }

        var handlers = [];
        if (this.onBecomePublic)
            handlers.push(this.onBecomePublic);

        var otherHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, helper.getSchemaName(), helper.getQueryName(), true) || [];
        if (otherHandlers.length)
            handlers = handlers.concat(otherHandlers);

        if (handlers.length){
            for (var i=0;i<handlers.length;i++){
                handlers[i](scriptErrors, helper, row, oldRow);
            }
        }
    }

    if (row.date){
        //flags dates more than 1 year in the future or 60 in the past
        EHR.Server.Validation.flagSuspiciousDate(row, scriptErrors, helper);

        if (!helper.isETL()){
            EHR.Server.Validation.verifyDate(row, scriptErrors, helper)
        }
    }

    //update SNOMED tags if necessary.  note: this must occur prior to actual insert, since LK strips out properties that do not match actual fields
    if (!helper.isETL() && helper.getSNOMEDCodeFieldName() && !helper.isValidateOnly()){
        if (row && oldRow && row.codesRaw === oldRow.codesRaw){
            console.log('codes match: ' + (oldRow.codesRaw || 'none'));
        }

        if (row.objectid){
            console.log('updating snomed tags: ' + row.codesRaw);
            helper.getJavaHelper().updateSNOMEDTags(row.Id, row.objectid, (row.codesRaw ? row.codesRaw : null));
        }
    }

    helper.logDebugMsg('rowInit end:' + helper.getTimeElapsed);
    helper.logDebugMsg(row);
};


/**
 * This performs a set of checks shared by both beforeInsert() and beforeUpdate().  It is run as the final step of each row's validation.  It should not be called directly.
 * It includes the following:
 * <br>1. If helper.isValidateOnly() is true, it will add an additional error to force the operation to fail.
 * <br>2. If will prune any errors from scriptErrors with threshold below that specified in helper.getErrorThreshold().  This value defaults to 'WARN'.
 * <br>3.
 * <br>
 * <li>If the row has a property called 'id/curlocation/location', this will be populated with the current room/cage of the animal/</li>
 * <li>Checks whether this ID exists in study.demographics and is currently located at the center.  If not, it will return an error of severity INFO.  However, if this record is a request QCState, the error will be a warning, which prevents submission.</li>
 * <br>4. If a project is provided and it is not numeric, an error is thrown
 * <br>5. If an Id, date and project are provided, it checks whether the current animal is assigned to that project on the supplied date.  This is skipped for the assignment table or if helper.isQuickValidation() is true.
 * <br>6. If Id, Date and room or cage are provided it will verify whether the animal was housed in the specified room/cage at the date provided.  This is skipped is this script has set skipHousingCheck=true on the script helper or if helper.isQuickValidation() is true.
 *
 * @param {object} helper The script helper
 * @param {object} globalErrors The global errors object, as passed from LabKey.
 * @param {object} scriptErrors The errors object used during rowInit()
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 */
EHR.Server.Triggers.rowEnd = function(helper, globalErrors, scriptErrors, row, oldRow){
    helper.logDebugMsg('row:');
    helper.logDebugMsg(row);
    helper.logDebugMsg('oldRow:');
    helper.logDebugMsg(oldRow);

    //this check moved to rowEnd() from rowInit(), since custom handlers could set these properties
    //check required fields.
    for (var fieldName in row){
        var msg = helper.getValidationHelper().validateRequiredField(fieldName, LABKEY.ExtAdapter.isEmpty(row[fieldName]) ? null : row[fieldName]);
        if (msg){
            EHR.Server.Utils.addError(scriptErrors, fieldName, msg, helper.isEHRDataEntry() ? 'WARN' : 'ERROR');
        }
    }

    //use this flag to filters errors below a given severity
    var errorThreshold = helper.getErrorThreshold() || 'WARN';

    //this flag is to let records be validated, but forces failure of validation.  has been deprecated, but we still support it
    //NOTE: have reverted to adding a dummy error in order to force LK to skip downstream DB insert, which can be slow
    if (helper.isValidateOnly()){   //&& helper.isLegacyFormat()
        EHR.Server.Utils.addError(scriptErrors, '_validateOnly', 'Ignore this error');
    }

    //this converts error objects into an array of strings
    //it also separates errors below the specified threshold
    var totalErrors = EHR.Server.Utils.processErrors(row, globalErrors, scriptErrors, errorThreshold, helper);
    if (!totalErrors){
        row.description = row.description || null;
        if (this.setDescription){
            row.description = this.setDescription(row, helper).join(',\n');
        }
        else {
            var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.DESCRIPTION, helper.getSchemaName(), helper.getQueryName(), true);
            if (handlers.length){
                if (handlers.length > 1){
                    console.error('More than 1 description handler has been registered for the table: ' + helper.getSchemaName() + '.' + helper.getQueryName());
                }

                var description = handlers[0].call(this, row, helper)
                if (description && description.length > 0) {
                    row.description = description.join(',\n');
                }
            }
        }

        if (row.description && row.description.length > 4000)
            row.description = row.description.substring(0, 3999);

        row.QCState = EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).RowId || null;
    }
    else {
        row.description = [];
        for (var i in globalErrors){
            for (var j=0;j<globalErrors[i].length;j++){
                row.description.push(globalErrors[i][j]);
            }

            //we want all ETL records to get imported, but flag them for review.  this wipes the global errors object for this field
            if (helper.isETL()){
                globalErrors[i] = [];
            }
        }
        row.description = row.description.join(',\n');

        row.QCState = EHR.Server.Security.getQCStateByLabel(helper.getErrorQcLabel()).RowId || null;
        row.QCStateLabel = EHR.Server.Security.getQCStateByLabel(helper.getErrorQcLabel()).Label || null;
    }

    helper.logDebugMsg('QCState: ' + row.QCState + '/' + row.QCStateLabel);

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (LABKEY.ExtAdapter.isEmpty(row[i])){
            row[i] = null;
        }
    }

    helper.logDebugMsg('New row: ');
    helper.logDebugMsg(row);
};


/**
 * This primarily handles bookkeeping necessary to track event between individual rows.  The purpose is to track
 * a number of values across all the rows in a given action.  In theory this allows certain actions to be batched
 * and performed once per set of imports, rather than once per record.  This method performs the following:
 * 1. Normalizes the QCState and/or QCStateLabel (this also happened earlier in the script, but this work would be reset after the event completed)
 * 2. Adds a reference to the row and oldRow (if present) objects to helper.rows
 * 3. If a function called afterBecomePublic() is defined, it will be called with the following arguments:
 * <li>errors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>helper: The script helper
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * 4. If not already present, the value of row.Id will be added to the array this.helper.getParticipantsModified()
 * 5. If this.extraContext.keyField is defined, row[this.extraContext.keyField] will be passed to helper.addPKsModified()
 * 6. If row.requestId is defined, the request Id will be passed to helper.addRequestsModified()
 * 7. If row.requestId is defined and this request is was denied in this transaction then the requestId will be passed to helper.getRequestsDenied()
 * 8. If row.requestId is defined and this request is was marked complete in this transaction then the requestId passed to helper.getRequestsCompleted()
 * 9. If row.taskId is defined, then it is passed to helper.getTasksModified()
 * 10. If oldRow is defined, the same steps are performed on it
 * @param {string} event The event, as pased from LabKey
 * @param {object} helper The script helper
 * @param {object} errors The errors object, as passed from LabKey.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * */
EHR.Server.Triggers.afterEvent = function (event, helper, errors, row, oldRow){
    helper.logDebugMsg('After Event: '+event);
    helper.logDebugMsg('Time: ' + helper.getTimeElapsed());

    //normalize QCState
    if (row.QCState && !row.QCStateLabel){
        row.QCStateLabel = EHR.Server.Security.getQCStateByRowId(row.QCState).Label
    }
    if (oldRow && oldRow.QCState && !oldRow.QCStateLabel){
        oldRow.QCStateLabel = EHR.Server.Security.getQCStateByRowId(oldRow.QCState).Label
    }

    //NOTE: necessary to populate the _becomingPublicData flag
    EHR.Server.Security.normalizeQcState(row, oldRow);
    if (row._becomingPublicData){
        var handlers = [];
        var otherHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_BECOME_PUBLIC, helper.getSchemaName(), helper.getQueryName(), true) || [];
        if (otherHandlers.length)
            handlers = handlers.concat(otherHandlers);

        if (handlers.length){
            for (var i=0;i<handlers.length;i++){
                handlers[i](errors, helper, row, oldRow);
            }
        }
    }

    helper.addRow({
        row: row,
        oldRow: oldRow
    });

    helper.addParticipantModified(row.Id, row.QCStateLabel);

    if (helper.getKeyField()){
        var key = row[helper.getKeyField()];

        helper.addPKModified(key, row.QCStateLabel);
    }

    if (row.requestId){
        helper.addRequestModified(row.requestId, row, row.QCStateLabel, (oldRow ? oldRow.QCStateLabel : null));
    }

    if (row.taskId){
        helper.addTaskModified(row.taskId, row.QCStateLabel);
    }

    if (oldRow){
        helper.addParticipantModified(oldRow.Id, oldRow.QCStateLabel);

        if (helper.getKeyField()){
            var key = oldRow[helper.getKeyField()];
            helper.addPKModified(key, oldRow.QCStateLabel);
        }

        if (oldRow.requestId){
            helper.addRequestModified(oldRow.requestId);
        }

        if (oldRow.taskId){
            helper.addTaskModified(oldRow.taskId);
        }
    }
};

var extraScripts = org.labkey.ehr.utils.TriggerScriptHelper.getScriptsToLoad(LABKEY.Security.currentContainer.id);
LABKEY.ExtAdapter.each(extraScripts, function(script){
    script = script.replace(/^[\\\/]*scripts[\/\\]*/, '');
    script = script.replace(/\.js$/, '');

    var contents = require(script);
    if (!contents || !contents.init){
        console.error('An EHR trigger script has been registered that lacks an init() function: ' + script);
        return;
    }

    contents.init(EHR);
}, this);

/**
 * A call to this method should be the first line of any trigger script associated with EHR.
 * This will setup the default handlers and load dependencies.
 * @param scope
 */
EHR.Server.initScript = function(scope){
    var props = ['EHR', 'LABKEY', 'Ext', 'console', 'init', 'beforeInsert', 'afterInsert', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete', 'complete'];
    for (var i=0;i<props.length;i++)
    {
        var prop = props[i];
        scope[prop] = exports[prop];
    }
}
exports.initScript = EHR.Server.initScript;
