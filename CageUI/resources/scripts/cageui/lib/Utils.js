var LABKEY = require("labkey");

var Utils = {};
exports.Utils = Utils;

Utils.getJavaHelper = function() {
    return org.labkey.cageui.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id)
};
