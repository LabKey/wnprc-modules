var LABKEY = require("labkey");
var Ext = require("Ext4").Ext;
var logger = require("wnprc_ehr/lib/Logger").Logger;

var Validator = {};
exports.Validator = Validator;

Validator.Severity = {
    ERROR: "ERROR",
    INFO:  "INFO",
    WARN:  "WARN"
};

Validator.new = function(EHR, row, scriptErrors, helper) {
    var addToScriptErrors = function(field, message, severity) {
        return EHR.Server.Utils.addError(scriptErrors, field, message, severity);
    };

    var addError = function(field, message) {
        return addToScriptErrors(field, message, Validator.Severity.ERROR);
    };

    var addWarning = function(field, message) {
        return addToScriptErrors(field, message, Validator.Severity.WARN);
    };

    var addInfo = function(field, message) {
        return addToScriptErrors(field, message, Validator.Severity.INFO);
    };

    return {
        ensureUserExists: function(fieldName, value, severity, isDisplayName) {
            var retVal = false;

            if(!Ext.isDefined(value)) {
                value = row[fieldName];
            }

            logger.debug("Checking to see if " + value + " is a user...");

            LABKEY.Query.selectRows({
                schemaName: 'core',
                queryName:  'users',
                filterArray:[
                    LABKEY.Filter.create(isDisplayName ? 'DisplayName' : 'UserId', value, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data) {
                    if (data.rows && data.rows.length > 0) {
                        retVal = true;
                    }
                    else {
                        var message =  "\"" + value + "\" is not a user in EHR.";

                        if (!Ext.isDefined(severity)) {
                            severity = Validator.Severity.ERROR;
                        }
                        addToScriptErrors(fieldName, message, severity);
                    }
                }
            });

            logger.debug(value + " is a " + (!retVal ? "not " : "") + "user...");

            return retVal;
        },

        ensureUserIsPathologist: function(fieldName, value, severity, isDisplayName) {
            var retVal = false;

            if (!Ext.isDefined(value)) {
                value = row[fieldName];
            }

            LABKEY.Query.selectRows({
                schemaName: 'ehr_lookups',
                queryName:  'pathologists',
                filterArray:[
                    LABKEY.Filter.create(isDisplayName ? 'UserId' : 'internalUserId', value, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data) {
                    if (data.rows && data.rows.length > 0) {
                        retVal = true;
                    }
                    else {
                        var message =  "\"" + value + "\" is not a Pathologist in EHR.";

                        if (!Ext.isDefined(severity)) {
                            severity = Validator.Severity.ERROR;
                        }
                        addToScriptErrors(fieldName, message, severity);
                    }
                }
            });

            return retVal;
        },

        /*
         * Checks various attributes of an animal, based on a config object.  By default, throws an error if the
         * animal in the specified column doesn't exist.
         */
        checkAnimalInCol: function(fieldName, config, id) {
            var retVal = true;

            if (!Ext.isDefined(id)) {
                id = row[fieldName];
            }

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName:  'demographics',
                filterArray:[
                    LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)
                ],
                columns: ["Id", "gender/origGender", "calculated_status"],
                success: function(data) {
                    var demoData = (data.rows && data.rows.length > 0) ? data.rows[0] : null;

                    // Check to make sure we have a demo record for this animal.
                    if (demoData == null) {
                        addToScriptErrors(fieldName, id + " is not in the demographics table.", config.exists ? config.exists : Validator.Severity.ERROR);

                        // Return, since none of the other tests will work.
                        return;
                    }

                    // Check for alive
                    if (config.isAlive && (demoData["calculated_status"] !== "Alive")) {
                        addToScriptErrors(fieldName, id + " is " + demoData["calculated_status"], config.isAlive);
                    }

                    // Do female check
                    if (config.isFemale && (demoData["gender/origGender"] !== 'f')) {
                        addToScriptErrors(fieldName, id + " is not female.", config.isFemale);
                    }

                }
            });

            return retVal;
        }
    };
};