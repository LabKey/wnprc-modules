var LABKEY = require("labkey");

var Utils = {};
exports.Utils = Utils;

Utils.getJavaHelper = function() {
    return org.labkey.wnprc_ehr.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id)
};

Utils.lookupGender = function(gCode) {
    return Utils.getJavaHelper().lookupGender(gCode);
};

Utils.splitIds = function(subjectArray){
    if (!subjectArray){
        return [];
    }

    //subjectArray = Ext4.String.trim(subjectArray);
    subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
    subjectArray = subjectArray.replace(/(^;|;$)/g, '');
    subjectArray = subjectArray.toLowerCase();

    if (subjectArray){
        subjectArray = subjectArray.split(';');
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
