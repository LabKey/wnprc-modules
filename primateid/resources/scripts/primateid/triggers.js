exports.init = function (EHR) {

    //region -- imports --

    const console = require('console');
    const LABKEY = require('labkey');
    const PrimateID = new (require('primateid/primateid.webpack')).PrimateID.Sync();

    //endregion

    //region -- helper variables and functions --

    // helper log function, to add a prefix to each relevant line
    const _log = function (msg) {
        console.log("[primateid] " + msg);
    };

    // helper instance of the TriggerManager (to save typing later)
    // noinspection JSUnresolvedVariable
    const TM = EHR.Server.TriggerManager;

    // helper function to retrieve the site-specific prefix for the PrimateId
    const getPrimateIdPrefix = function () {
        // noinspection JSUnresolvedFunction
        const prefix = LABKEY.getModuleProperty('primateid', 'PrimateIdPrefix');
        if (prefix === null)
            _log("WARNING: PrimateId prefix is not set. Please set the value of the PrimateIdPrefix property via the LabKey Module Properties")
        return prefix;
    };

    // helper function to create and insert a PrimateId for a given participant
    const createAndInsertPrimateId = function (participantId) {
        _log("generating primate id for " + participantId);
        // noinspection JSUnresolvedFunction
        LABKEY.Query.insertRows({
            schemaName: 'primateid',
            queryName: 'unique_ids',
            rows: [{
                'participantid': participantId,
                'primateid': PrimateID.Generate(getPrimateIdPrefix())
            }],
            success: function () {
                _log("inserted new primateid successfully")
            },
            failure: EHR.Server.Utils.onFailure
        })
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
                // noinspection JSUnresolvedFunction
                if (data.getRowCount() === 0)
                    createAndInsertPrimateId(row['participantid']);
                else
                    _log("PrimateID present for subject: " + row['participantid'])
            },
            failure: EHR.Server.Utils.onFailure
        });
    }

    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    TM.registerHandlerForQuery(TM.Events.AFTER_INSERT, 'study', 'arrival', afterInsertTrigger);
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    TM.registerHandlerForQuery(TM.Events.AFTER_INSERT, 'study', 'birth', afterInsertTrigger);

};