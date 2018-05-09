(function () {
    // pseudo-parameterized SQL for retreiving the "current" pregnancy lsid given a participant id
    const GET_ACTIVE_PREGNANCY_LSID_BY_ID_SQL =
            'select lsid \
               from (select p.lsid \
                           ,p.date_conception \
                       from pregnancies p \
                      where p.Id = {0} \
                        and not exists (select * \
                                          from pregnancy_outcomes po \
                                         where po.pregnancyid = p.lsid) \
                                      order by date_conception desc) \
              limit 1'.replace(/\s+/g, ' ');

    Ext4.define('WNPRC.grid.PregnancyGridPanel', {
        extend: 'EHR.grid.Panel',
        alias: 'widget.wnprc-pregnancygridpanel',

        /**
         * Queue of changes (lambdas) to apply on the next edit event to prevent UI weirdness.
         *
         * @type {[function]}
         * @private
         */
        _changes: [],

        /**
         * Initializes the panel.
         *
         * @override
         */
        initComponent: function () {
            Ext4.apply(this, {
                listeners: {
                    afterrender: {
                        fn: this._onAfterRender,
                        scope: this,
                        single: true
                    }
                }
            });
            this.callParent(arguments);
            this.plugins = this.plugins || [];
            this.plugins.push(Ext4.create('WNPRC.plugin.ButtonHotKeyPlugin', {
                buttonId: 'appendRecordBtn',
                keyCode: 187,
                shift: true
            }));
            this.mon(this, 'edit', this._onEdit, this);
            this.mon(this, 'edit', this._applyQueuedChanges, this);
        },

        /**
         * Executes the lambdas in the change queue and empties it for the next event.
         *
         * @private
         */
        _applyQueuedChanges: function () {
            // execute any queued model changes. this is helpful to avoid a strange UI situation where
            // the next field we tab into is somehow rendered in the center of the screen
            while (this._changes.length)
                this._changes.shift()();
        },

        /**
         * After render event handler. Attaches the KeyMap on the '+' key to append a new record. Also appends a
         * new record to the grid immediately.
         *
         * @private
         */
        _onAfterRender: function () {
            // for whatever reason, we need to wait for a half second in order for the "perfomed by" column
            // to populate to its default. if there's a more sure-fire way to do this, by all means, let's
            // do it that way instead - clay, 08 May 2018
            const plugin = this.getPlugin('buttonHotKeyPlugin');
            setTimeout(plugin.execute.bind(plugin), 500);
        },

        /**
         * Edit event handler. Updates the pregnancy id of the passed row based on any changes to the participant id.
         *
         * @param sender
         * @param args
         * @private
         */
        _onEdit: function (sender, args) {
            // only worry about changes to the id field
            if (args.field !== 'Id') return;
            // only worry about _actual_ changes
            if (args.value === args.originalValue) return;

            // find the selected row, and default its pregnancy id to the "active" pregnancy for that animal
            // if there is one or null if not
            const model = this.getSelectionModel().getSelection()[0];
            if (model) this._updatePregnancy(model, args.value);
        },

        /**
         * Updates the pregnancy id of the passed model based on the passed participant id, clearing it on change
         * and setting it to the "active" pregnancy for the participant id, if there is one.
         *
         * @param model
         * @param participantId
         * @private
         */
        _updatePregnancy: function (model, participantId) {
            model.set('pregnancyid', null);
            LABKEY.Query.executeSql({
                failure: function (error) {
                    console.error('unable to retrieve default pregnancy: id=' + participantId);
                    console.error(error.exception);
                },
                schemaName: 'study',
                scope: this,
                sql: Ext4.String.format(GET_ACTIVE_PREGNANCY_LSID_BY_ID_SQL, LABKEY.Query.sqlStringLiteral(participantId)),
                success: function (data) {
                    if (data.rowCount)
                        this._changes.push(model.set.bind(model, 'pregnancyid', data.rows[0].lsid));
                }
            });
        }
    });
})();