exports.init = function (EHR) {

    //region -- imports --

    const console = require('console');
    const LABKEY = require('labkey');
    const PrimateID = new (require('primateid/gen/primateid.webpack')).PrimateID.Sync();

    //endregion

    //region -- helper variables and functions --

    // helper log function, to add a prefix to each relevant line
    const _log = function (msg) {
        console.log("[primateid] " + msg);
    };

    // helper instance of the TriggerManager (to save typing later)
    // noinspection JSUnresolvedVariable
    const TM = EHR.Server.TriggerManager;

    // helper function to retrieve the container-specific prefix for the PrimateId.
    // uses an AJAX request to core.getModuleProperties because the JavaScript
    // helper method in not available to server-side trigger scripts
    const getPrimateIdPrefix = function (callback) {
        // noinspection JSUnresolvedFunction
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('core', 'getModuleProperties', null), method: 'POST',
            headers: {'Content-Type': 'application/json'},
            jsonData: {moduleName: 'PrimateId', includePropertyValues: true},
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                // noinspection JSUnresolvedVariable
                callback(response.values['PrimateIdPrefix'].effectiveValue);
            }, this),
            failure: EHR.Server.Utils.onFailure
        });
    };

    // helper function to create and insert a PrimateId for a given participant
    const createAndInsertPrimateId = function (participantId) {
        getPrimateIdPrefix(function(prefix) {
            const primateid = PrimateID.Generate(prefix);
            // noinspection JSUnresolvedFunction
            LABKEY.Query.insertRows({
                schemaName: 'primateid',
                queryName: 'unique_ids',
                rows: [{
                    'participantid': participantId,
                    'primateid': primateid
                }],
                success: function () {
                    _log("inserted new primateid successfully: " +
                            "participant = " + participantId + ", primateid = " + primateid);
                },
                failure: EHR.Server.Utils.onFailure
            });
        });
    };

    //endregion

    const afterInsertTrigger = function (_, __, row) {
        // noinspection JSUnresolvedFunction, JSUnresolvedVariable
        LABKEY.Query.selectRows({
            schemaName: 'primateid',
            queryName: 'unique_ids',
            columnNames: ['primateid'],
            filterArray: [LABKEY.Filter.create('participantid', row['participantid'], LABKEY.Filter.Types.EQUAL)],
            requiredVersion: 17.1,
            success: function (data) {

                // Getting the participantId field is the normal case, but in auto-tests we need to grab the Id field
                var participantid = row['participantid'] || row['Id'];

                // noinspection JSUnresolvedFunction
                if (data.getRowCount() === 0)
                    createAndInsertPrimateId(participantid);
                else
                    _log("PrimateID present for subject: " + participantid)
            },
            failure: EHR.Server.Utils.onFailure
        });
    };

    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    TM.registerHandlerForQuery(TM.Events.AFTER_INSERT, 'study', 'Arrival', afterInsertTrigger);
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    TM.registerHandlerForQuery(TM.Events.AFTER_INSERT, 'study', 'Birth', afterInsertTrigger);
};