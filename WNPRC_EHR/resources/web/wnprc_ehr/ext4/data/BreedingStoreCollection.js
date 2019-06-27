// noinspection JSUnusedGlobalSymbols
Ext4.define('WNPRC.ext.data.BreedingStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    /**
     * Default participant id to display when adding new records
     *
     * @private
     */
    _participantId: null,

    /**
     * "Parent" pregnancy id used to set defaults and filter displayed records
     *
     * @private
     */
    _pregnancyId: null,

    /**
     * "Parent" pregnancy lsid used to set the default for any new rows added
     *
     * @private
     */
    _pregnancyLsid: null,

    /**
     * Creates the store and requests the lsid and participant id of the "parent" pregnancy, if there is one.
     *
     * @override
     */
    constructor: function () {
        this.callParent(arguments);
        if (this._pregnancyId = (Ext4.Object.fromQueryString(window.location.search.substring(1)) || {})['pregnancyid']) {
            LABKEY.Query.executeSql({
                failure: function (error) {
                    console.error('error retrieving participant id and lsid from pregnancy: id=' + this._pregnancyId);
                    console.error(error.exception);
                },
                scope: this,
                schemaName: 'study',
                sql: 'select p.Id, p.lsid from pregnancies p where p.objectid = \'' + this._pregnancyId + '\'',
                success: function (data) {
                    if (data.rowCount) {
                        this._participantId = data.rows[0]['Id'];
                        this._pregnancyLsid = data.rows[0]['lsid'];
                    }
                }
            });
        }
    },

    /**
     * Adds a filter for the child records based on the pregnancy id, if one is provided in the URL query string
     *
     * @param config
     * @override
     */
    addServerStoreFromConfig: function (config) {
        try {
            const modded = Ext4.applyIf({filterArray: []}, config);
            if (this._pregnancyId) {
                modded.filterArray.push(LABKEY.Filter.create('pregnancyid', this._pregnancyId, LABKEY.Filter.Types.CONTAINS));
            } else {
                modded.filterArray.push(LABKEY.Filter.create('date', new Date(), LABKEY.Filter.Types.DATE_GREATER_THAN));
            }
            modded.sort = 'date';
            this.callParent([modded]);
        }
        catch (e) {
            console.error('error setting pregnancy id filter on server store, falling back to parent class behavior');
            console.error(e);
            this.callParent([config]);
        }
    },

    /**
     * Sets the default values for the passed client model object.
     *
     * @param model
     * @override
     */
    setClientModelDefaults: function (model) {
        if (this.hasLoaded) {
            model.suspendEvents(true);
            if (this._participantId) {
                model.set('Id', this._participantId);
            }
            if (model.caseInsensitiveFieldMap && model.caseInsensitiveFieldMap.pregnancyid) {
                model.set('pregnancyid', this._pregnancyLsid);
            }
            //model.set('performedby', LABKEY.user.displayName);
            model.resumeEvents();
        }
        return this.callParent([model]);
    }
});