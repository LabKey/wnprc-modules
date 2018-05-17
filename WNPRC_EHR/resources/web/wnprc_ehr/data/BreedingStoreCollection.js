(function () {
    const ID_FIELD_NAME = 'Id';
    const PERFORMED_BY_FIELD_NAME = 'performedby';

    // noinspection JSUnresolvedVariable
    Ext4.define('WNPRC_EHR.data.BreedingStoreCollection', {
        extend: 'EHR.data.TaskStoreCollection',

        /**
         * Sets the default values for the passed client model object.
         * @param model
         * @override
         */
        setClientModelDefaults: function (model) {
            model.suspendEvents();
            if (model.fields.containsKey(ID_FIELD_NAME) && !model.get(ID_FIELD_NAME))
                model.set(ID_FIELD_NAME, this._getParticipantId());
            if (model.fields.containsKey(PERFORMED_BY_FIELD_NAME) && !model.get(PERFORMED_BY_FIELD_NAME))
                model.set(PERFORMED_BY_FIELD_NAME, LABKEY.user.displayName);
            model.resumeEvents();
            return this.callParent([model]);
        },

        /**
         * Retrieves the participant id from the "parent" breeding encounter record
         * @returns participant id to use for the record or null if the parent cannot be found
         * @private
         */
        _getParticipantId: function () {
            // noinspection JSUnresolvedFunction: inherited from DataEntryClientStore
            var parent = this.getServerStoreForQuery('study', 'breeding_encounters').getAt(0);
            if (parent) return parent.get(ID_FIELD_NAME);

            console.error('Unable to retrieve participant id from parent breeding encounter');
            return null;
        }
    });
})();