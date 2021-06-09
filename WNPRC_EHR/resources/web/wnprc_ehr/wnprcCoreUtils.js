/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// Ensure that the parent objects exist, but don't overwrite them.
var WNPRC_EHR = WNPRC_EHR || {};
WNPRC_EHR.Utils = WNPRC_EHR.Utils || {};

WNPRC_EHR.API = {
    controllerActions: (function(){
        var getURLForAction = function(action) {
            return WebUtils.API.makeURL(action, {
                controller: "wnprc_ehr" // Okay to hard-code because these are all calls to the wnprc_ehr controller.
            });
        };

        var getChanges = function() {
            var url = getURLForAction('getChanges');
            return WNPRC.API.getJSON(url);
        };

        return {
            getChanges: getChanges
        };
    })()
};

(function() {
    WNPRC_EHR.container = LABKEY.getModuleProperty("ehr", "EHRStudyContainer");

    var qcStore;

    WNPRC_EHR.initQCStates = function () {
        qcStore = LABKEY.ext4.Util.getLookupStore({
            lookup: {
                schemaName:    'study',
                queryName:     'QCState',
                keyColumn:     'RowId',
                displayColumn: 'Label',
                container:      WNPRC_EHR.container
            }
        });
    }


    // A function to lookup the display value of a QCState based on it's rowid/number/code.
    var getQCStateLabel = function(rowid) {
        var index = qcStore.find("RowId", rowid);

        if (index == -1) {
            return "";
        }
        else {
            var rec = qcStore.getAt(index);
            return rec.get("Label");
        }
    };

    var getQCValueFromLabel = function(label) {
        var index = qcStore.find("Label", label);

        if (index == -1) {
            return "";
        }
        else {
            var rec = qcStore.getAt(index);
            return rec.get("RowId");
        }
    };

    // Returns a promise that resolves with the store as it's data once the store is loaded.
    var when$QCStoreLoads = function() {
        return new Promise(function(resolve, reject) {
            if (qcStore.isLoading()) {
                qcStore.on("load", function() {
                    resolve(qcStore);
                }, null, {single: true});
            }
            else {
                resolve(qcStore);
            }
        });
    };

    WNPRC_EHR.qc = {
        getQCStateLabel:     getQCStateLabel,
        getQCValueFromLabel: getQCValueFromLabel,
        when$QCStoreLoads:   when$QCStoreLoads
    }
})();