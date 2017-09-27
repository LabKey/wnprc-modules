var LABKEY = require("labkey");

var Utils = {};
exports.Utils = Utils;

Utils.getJavaHelper = function() {
    return org.labkey.wnprc_ehr.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id)
};

Utils.lookupGender = function(gCode) {
    return Utils.getJavaHelper().lookupGender(gCode);
};
