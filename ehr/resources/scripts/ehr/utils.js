/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};


/**
 * A server-side class of helpers, similar to the client-side EHR.Utils.  The two overlap slightly (the server-side code is a subset of client-side); however,
 * since code cannot truly to shared between client/server at the time of writing there are differences.
 * @class
 */
EHR.Server.Utils = {};

EHR.Server.Utils = new function(){
    var principalMap = {};

    return {
        /**
         * A helper to return the string displayName of a Principal based on their numeric Id.  This helper caches calls to core.principals
         * in a local variable so it should not need to repeatedly query the server on subsequent calls.
         * @param {integer} id The ID of the principal, which should correspond to a row in core.principals.
         * @returns {string} The string Name of the user, or an empty string if not found
         */
        findPrincipalName: function(id){
            if (!principalMap)
                principalMap = {};

            if (principalMap[id])
                return principalMap[id];

            LABKEY.Query.selectRows({
                schemaName: 'core',
                queryName: 'UsersAndGroups',
                columns: 'UserId,DisplayName',
                filterArray: [
                    LABKEY.Filter.create('UserId', id, LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: function(data){
                    if (data.rows && data.rows.length)
                        principalMap[id] = data.rows[0].DisplayName;
                },
                failure: EHR.Server.Utils.onFailure
            });

            return principalMap[id] || '';
        },

        /**
         * A helper that will test whether the passed object is empty (ie. {}) or not.
         * @param {object} o The object to test
         * @returns True/false depending on whether the passed object is empty
         */
        isEmptyObj: function(o){
           for (var i in o)
               return false;
           return true;
        },

        /**
         * Provides a generic error callback.  This helper will print the error to the console
         * and will log the error to the audit log table. The user must have insert permissions on /Shared for
         * this to work.
         * @param {Object} error The error object passed to the callback function
         * */
        onFailure: function(error){
            var stackTrace = (error.stackTrace && LABKEY.ExtAdapter.isArray(error.stackTrace) ? error.stackTrace.join('\n') : null);
            var message  = error.exception || error.statusText || error.msg || error.message || '';

            var toLog = [
                'User: ' + LABKEY.Security.currentUser.email,
                'Message: ' + message
            ];
            if (error.exceptionClass)
                toLog.push('Exception class: ' + error.exceptionClass);
            if (stackTrace)
                toLog.push(stackTrace);

            console.error(toLog.join('\n'));
        },
        
        getMonthString: function(monthValue){
        	var mString;
            switch (monthValue){
               case 0:
                    mString = 'January';
                    break;
               case 1:
                    mString = 'February';
                    break;
               case 2:
                    mString = 'March';
                    break;
               case 3:
                    mString = 'April';
                    break;
               case 4:
                    mString = 'May';
                    break;
               case 5:
                    mString = 'June';
                    break;
               case 6:
                    mString = 'July';
                    break;
               case 7:
                    mString = 'August';
                    break;
               case 8:
                    mString = 'September';
                    break;
               case 9:
                    mString = 'October';
                    break;
               case 10:
                    mString = 'November';
                    break;
               default:
                    mString = 'December';

            }
            return mString;
        },

        /**
         * Create a combined function call sequence of the original function + the passed function.
         * The resulting function returns the results of the original function.
         */
        createSequence: function(originalFn, newFn, scope) {
            if (!newFn) {
                return originalFn;
            }
            else {
                return function() {
                    var result = originalFn.apply(this, arguments);
                    newFn.apply(scope || this, arguments);
                    return result;
                };
            }
        },

        trim: function(input){
            return input.replace(/^\s+|\s+$/g, '');
        },

        /**
         * The purpose of this method is to normalize the passed object is a JS date object.
         * @param row
         * @param fieldName
         * @return the normalized date value.  the row is not altered
         */
        normalizeDate: function(val, supppressErrors){
            if (!val){
                return null;
            }

            var normalizedVal;

            if (typeof val === '[object Date]'){
                normalizedVal = val;
            }
            else if (LABKEY.ExtAdapter.isString(val)){
                if (!supppressErrors)
                    console.warn('EHR trigger script is being passed a date object as a string: ' + val);

                var javaDate = org.labkey.api.data.ConvertHelper.convert(val, java.util.Date);
                if (javaDate){
                    normalizedVal = new Date(javaDate.getTime());
                }
                else {
                    console.error('Unable to parse date string: ' + val);
                }
            }
            else if (!isNaN(val)){
                // NOTE: i'm not sure if we should really attempt this.  this should really never happen,
                // and it's probably an error if it does
                normalizedVal = new Date(val);
            }
            else {
                if (val['getTime']){
                    normalizedVal = new Date(val.getTime());
                }
                else {
                    if (!supppressErrors)
                        console.error('Unknown datatype for date value.  Type was: ' + (typeof val) + ' and value was: ' + val);
                }
            }

            // NOTE: in cases where dates are expected to match, like contiguous housing, it is important
            // for dates to line up exactly
            if (normalizedVal && normalizedVal.setMilliseconds)
                normalizedVal.setMilliseconds(0);

            return normalizedVal;
        },

        /**
         * A helper designed to simplify appending errors to the error object.  You should exclusively use this to append errors rather than interacting with the error object directly.
         * @param {object} errors The errors object.  In most cases, this is the scriptErrors object passed internally within rowInit(), not the labkey-provided errors object.
         * @param {string}field The name of the field for which to add the error.  Treat as case-sensitive, because client-side code will be case-sensitive.
         * @param {string} msg The message associated with this error
         * @param {string} severity The error severity.  Should match a value from EHR.Server.Utils.errorSeverities.
         */
        addError: function(errors, field, msg, severity){
            if (!errors[field])
                errors[field] = [];

            errors[field].push({
                message: msg,
                severity: severity || 'ERROR'
            });
        },

        /**
         * A helper used to process errors generated internally in EHR.Server.Triggers into the errors object returned to LabKey.  Primarily used internally by rowEnd()
         */
        processErrors: function(row, globalErrors, scriptErrors, errorThreshold, helper){
            var error;
            var totalErrors = 0;

            //extraContext will be roundtripped  back to the client, so we cache skipped errors in it
            //NOTE: this method is not longer used in 13.2 and beyond
            for (var i in scriptErrors){
                for (var j=0;j<scriptErrors[i].length;j++){
                    error = scriptErrors[i][j];

                    if (!EHR.Server.Utils.shouldIncludeError(error.severity, errorThreshold, helper)){
                        if (row._recordid){
                            error.field = i;
                            helper.addSkippedError(row._recordid, error);
                        }
                        else if (!helper.isETL()){
                            console.log('No _recordId provided, cannot serialize skipped error');
                        }
                        continue;
                    }

                    if (!globalErrors[i])
                        globalErrors[i] = {};

                    globalErrors[i].push(error.severity + ': ' + error.message);
                    totalErrors++;
                }
            }

            return totalErrors;
        },

        /**
         * Assigns numeric values to error severity strings
         * @private
         */
        errorSeverity: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        },

        shouldIncludeError: function(error, threshold, helper){
            //NOTE: with the newer style validation and 13.1 API, we always process every error.
            //this step should be deprecated, but we still support it for the old-style code
            if (!threshold || (helper.isValidateOnly() && !helper.isLegacyFormat())){
                return true;
            }

            return EHR.Server.Utils.errorSeverity[error] > EHR.Server.Utils.errorSeverity[threshold];
        },

        /**
         * A helper to remove the time-portion of a datetime field.
         * @param row The row object
         * @param errors The errors object
         * @param fieldname The name of the field from which to remove the time portion
         */
        removeTimeFromDate: function(row, errors, fieldname){
            fieldname = fieldname || 'date';
            var date = row[fieldname];

            if (!date){
                return null;
            }

            //normalize to a javascript date object
            date = new Date(date.getTime());
            row[fieldname] = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return row[fieldname];
        },

        /**
         * A helper to convert a date object into a display string.  By default is will use YYYY-mm-dd.
         * @param date The date to convert
         * @returns {string} The display string for this date or an empty string if unable to convert
         */
        dateToString: function (date){
            if (date){
                date = EHR.Server.Utils.normalizeDate(date);
                return (date.getFullYear() ? date.getFullYear() + '-' + EHR.Server.Utils.padDigits(date.getMonth() + 1, 2) + '-' + EHR.Server.Utils.padDigits(date.getDate(), 2) : '');
            }
            else
                return '';
        },

        /**
         * A helper to convert a datetime object into a display string.  By default is will use YYYY-mm-dd H:m.
         * @param date The date to convert
         * @returns {string} The display string for this date or an empty string if unable to convert
         */
        datetimeToString: function (date){
            if (date){
                date = EHR.Server.Utils.normalizeDate(date);
                return date.getFullYear() + '-' + EHR.Server.Utils.padDigits(date.getMonth() + 1, 2) + '-' + EHR.Server.Utils.padDigits(date.getDate(), 2) + ' ' + EHR.Server.Utils.padDigits(date.getHours(), 2) + ':' + EHR.Server.Utils.padDigits(date.getMinutes(), 2);
            }
            else
                return '';
        },

        /**
         * Converts an input value into a display string.  Used to generate description fields when the input value could potentially be null.
         * @param value The value to convert
         * @returns {string} The string value or an empty string
         */
        nullToString: function(value){
            return (value ? value : '');
        },

        /**
         * A utility that will take an input value and pad with left-hand zeros until the string is of the desired length
         * @param {number} n The input number
         * @param {integer} totalDigits The desired length of the string.  The input will be padded with zeros until it reaches this length
         * @returns {number} The padded number
         */
        padDigits: function(n, totalDigits){
            n = n.toString();
            var pd = '';
            if (totalDigits > n.length){
                for (var i=0; i < (totalDigits-n.length); i++){
                    pd += '0';
                }
            }
            return pd + n;
        },

        /**
         * A helper to return a display string based on a SNOMED code.  It will normally display the meaning of the code, followed by the code in parenthesis.
         * @param code The SNOMED code
         * @param meaning The meaning.  This is optional and will be queried if not present.  However, if the incoming row has the meaning, this saves overhead.
         */
        snomedToString: function (code, meaning, helper){
            if (!meaning){
                console.log('QUERYING SNOMED TERM');
                meaning = helper.getJavaHelper().getSnomedMeaning(code);
            }

            return meaning ? meaning+(code ? ' (' + code + ')' : '') : (code ? code : '');
        },

        /**
         * A helper for sending emails from validation scripts that wraps LABKEY.Message.  The primary purpose is that this allows emails to be sent based on EHR notification types (see ehr.notificationtypes table).  Any emails should use this helper.
         * @param config The configuration object
         * {Array} [config.recipients] An array of recipient object to receive this email.  The should have been created using LABKEY.Message.createRecipient() or LABKEY.Message.createPrincipalIdRecipient()
         * {String} [config.notificationType] The notificationType to use, which should match a record in ehr.notificationtypes.  If provided, any users/groups 'subscribed' to this notification type (ie. containing a record in ehr.notificationrecipients for this notification type) will receive this email.
         * {String} [config.msgFrom] The email address from which to send this message
         * {String} [config.msgSubject] The subject line of the email
         * {String} [config.msgContent] The content for the body of this email
         */
//TODO: move to java code
        sendEmail: function(config){
            console.log('Sending emails');

            if (!config.recipients)
                config.recipients = [];

            if (config.notificationType){
                LABKEY.Query.selectRows({
                    schemaName: 'ehr',
                    queryName: 'notificationRecipients',
                    filterArray: [LABKEY.Filter.create('notificationType', config.notificationType, LABKEY.Filter.Types.EQUAL)],
                    success: function(data){
                        for (var i=0;i<data.rows.length;i++){
                            config.recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, data.rows[i].recipient));
                            //console.log('Recipient: ' + data.rows[i].recipient);
                        }
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }

            console.log('This email has ' + config.recipients.length + ' recipients');
            if (config.recipients.length){
                var siteEmail = config.msgFrom;
                if (!siteEmail){
                    //TODO: module property?
                    LABKEY.Query.selectRows({
                        schemaName: 'ehr',
                        queryName: 'module_properties',
                        scope: this,
                        filterArray: [LABKEY.Filter.create('prop_name', 'site_email', LABKEY.Filter.Types.EQUAL)],
                        success: function(data){
                            if (data && data.rows && data.rows.length){
                                siteEmail = data.rows[0].stringvalue;
                            }
                        },
                        failure: EHR.Server.Utils.onFailure
                    });
                }

                if (!siteEmail){
                    console.log('ERROR: site email not found');
                }

                LABKEY.Message.sendMessage({
                    msgFrom: siteEmail,
                    msgSubject: config.msgSubject,
                    msgRecipients: config.recipients,
                    msgContent: [
                        LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, config.msgContent)
                    ],
                    success: function(){
                        console.log('Success sending emails');
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }
        },

        /**
         * A helper that will return and cache the row in study.demographics for the provided animal.  These rows are stored in scriptContext.demographicsMap,
         * so subsequent calls do not need to hit the server.
         * @param config The configuration object
         * @param [config.participant] The participant (aka animal ID) to return
         * @param [config.callback] The success callback function
         * @param [config.scope] The scope to use for the callback
         * @param [config.helper] The scriptHelper
         */
        findDemographics: function(config){
            if (!config || !config.participant || !config.callback || !config.scope){
                EHR.Server.Utils.onFailure({
                    msg: 'Error in EHR.Server.Utils.findDemographics(): missing Id, scope or callback'
                });
                throw 'Error in EHR.Server.Utils.findDemographics(): missing Id, scope or callback';
            }

            var start = new Date();
            var helper = config.helper;

            if (!helper){
                throw "Error in EHR.Server.Utils.findDemographics(): No scriptHelper provided";
            }

            var ar = helper.getJavaHelper().getDemographicRecord(config.participant);
            var load = (((new Date()) - start) / 1000);
            if (load > 2)
                console.log('Find demographics java load time for ' + config.participant + ': ' + load);

            if (ar){
                var row = {
                    Id: ar.getId(),
                    birth: ar.getBirth() ? new Date(ar.getBirth().getTime()) : null,
                    hasBirthRecord: ar.hasBirthRecord(),
                    hasArrivalRecord: ar.hasArrivalRecord(),
                    death: ar.getDeath() ? new Date(ar.getDeath().getTime()) : null,
                    species: ar.getSpecies(),
                    dam: null,
                    gender: ar.getGender(),
                    'gender/origGender': ar.getOrigGender(),
                    geographic_origin: ar.getGeographicOrigin(),
                    calculated_status: ar.getCalculatedStatus(),
                    departure: ar.getMostRecentDeparture() ? new Date(ar.getMostRecentDeparture().getTime()) : null,
                    sire: null,
                    'id/curlocation/room': ar.getCurrentRoom(),
                    'id/curlocation/cage': ar.getCurrentCage(),
                    mostRecentWeight: ar.getMostRecentWeight(),
                    mostRecentWeightDate: ar.getMostRecentWeightDate() ? new Date(ar.getMostRecentWeightDate().getTime()) : null
                }

                //cache results
                helper.cacheDemographics(row.Id, row);
                config.callback.apply(config.scope || this, [row]);
            }
            else {
                config.callback.apply(config.scope || this);
            }
        },

        //note: can be overriden by modules
        isLiveBirth: function(birthCondition){
            return true;
        }
    }
};

