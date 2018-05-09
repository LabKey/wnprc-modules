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
        extend: 'WNPRC.grid.AppendRecordGridPanel',
        alias: 'widget.wnprc-pregnancygridpanel',

        /**
         * Initializes the panel.
         *
         * @override
         */
        initComponent: function () {
            this.callParent(arguments);

            this.mon(this, 'edit', this._onEdit, this);
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
                    if (data.rowCount) this.enqueueEditAction(model.set.bind(model, 'pregnancyid', data.rows[0].lsid));
                }
            });
        }
    });
})();