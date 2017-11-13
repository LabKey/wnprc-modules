var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext4").Ext;
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

exports.registerTriggers = function(EHR, registerGenericHandler, Events) {
    var registerHandler = function(event, callback) {
        registerGenericHandler(event, "study", "Prenatal Deaths", callback);
    };

    registerHandler(Events.COMPLETE, function(event, errors, helper) {
        var ids = helper.getRows().map(function(row) {
            return row.row.id;
        });

        // Trigger the update through Java.
        WNPRC.Utils.getJavaHelper().sendDeathNotification(ids);
    });
};