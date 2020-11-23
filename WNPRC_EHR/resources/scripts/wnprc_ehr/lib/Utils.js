var LABKEY = require("labkey");

var Utils = {};
exports.Utils = Utils;

Utils.getJavaHelper = function() {
    return org.labkey.wnprc_ehr.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id)
};

Utils.lookupGender = function(gCode) {
    return Utils.getJavaHelper().lookupGender(gCode);
};

Utils.splitIds = function(subjectIds){
    var subjectArray = [];
    if (!subjectIds){
        return subjectArray;
    }

    subjectIds = subjectIds.trim();
    subjectIds = subjectIds.replace(/[\s,;]+/g, ';');
    subjectIds = subjectIds.replace(/(^;|;$)/g, '');
    subjectIds = subjectIds.toLowerCase();

    if (subjectIds){
        subjectArray = subjectIds.split(';');
    }
    else {
        subjectArray = [];
    }

    return subjectArray;
};

Utils.contains = function(v,arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === v) {
            return true;
        }
    }
    return false;
};

Utils.unique = function (chk) {
    var arr = [];
    var contain = false;
    for (var i = 0; i < chk.length; i++) {
        if (!Utils.contains(chk[i],arr)) {
            arr.push(chk[i]);
        }
        else {
            contain = true;
        }
    }
    return !contain;
}
