var Ext = require("Ext4").Ext;
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var moment = require("dbutils/lib/moment");

// noinspection JSUnresolvedVariable
exports.registerTriggers = function (EHR, registerGenericHandler, Events) {
    var registerHandler = function (event, callback) {
        registerGenericHandler(event, "study", "necropsy", callback);
    };

    registerHandler(Events.BEFORE_UPSERT, function (helper, scriptErrors, row) {
        var validator = WNPRC.Validator.new(EHR, row, scriptErrors);

        var pdRegex = /^pd/i;
        if (row.Id && pdRegex.test(row.Id) && !row.is_prenatal_necropsy) {
            EHR.Server.Utils.addError(scriptErrors, 'Id', "Animal ID looks like a prenatal death.  'Fetal Necropsy' should be checked?", "WARN");
        }

        if (row.is_prenatal_necropsy && !row.dam) {
            EHR.Server.Utils.addError(scriptErrors, 'dam', "Dam is required for pre-natal necropsies.  If dam is not known, you may enter a descriptive placeholder here, such as 'rUNKOWN' for an as of yet unspecified rhesus animal.", "ERROR");
        }

        if ('dam' in row && row.dam) {
            validator.checkAnimalInCol("dam", {
                exists: WNPRC.Validator.Severity.WARN,
                isAlive: WNPRC.Validator.Severity.WARN,
                isFemale: WNPRC.Validator.Severity.ERROR
            });
        }

        // Warn if the pathologist is not a pathologist and throw an error if they are not a user.
        if (Ext.isDefined(row.performedby)) {
            // Only check that the user exists for records after 2013, because there are some older records
            // that need to reference users that don't exist.
            if (row.date && moment(row.date.getTime()).isAfter(moment('2013-01-01'))) {
                validator.ensureUserExists("performedby", undefined, WNPRC.Validator.Severity.ERROR, true);
            }
            validator.ensureUserIsPathologist("performedby", undefined, WNPRC.Validator.Severity.WARN, true);
        }

        // For each assistant (comma-delimited), warn if they are not a pathlogist and throw an error
        // if they are not a user.
        if (row.assistant) {
            Ext.each(row.assistant.split(","), function (user) {
                // Only check that the user exists for records after 2013, because there are some older records
                // that need to reference users that don't exist.
                if (row.date && moment(row.date.getTime()).isAfter(moment('2013-01-01'))) {
                    validator.ensureUserExists("assistant", user, WNPRC.Validator.Severity.ERROR, true);
                }
                validator.ensureUserIsPathologist("assistant", user, WNPRC.Validator.Severity.WARN, true);
            });
        }

        // Enforce on the Server Side that requests should not be <10 days out.
        if (row.date && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest) {
            var requestedTime = moment(row.date.getTime());
            var today = moment();

            if (requestedTime.isBefore(today.add(10, 'days'), 'day')) {
                EHR.Server.Utils.addError(scriptErrors, "date", "Please contact pathology directly if you need to schedule a necropsy in less than 10 days", 'ERROR');
            }
        }
    });

};