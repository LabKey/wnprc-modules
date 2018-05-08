(function () {
    // pseudo-parameterized SQL
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

        _changes: [],

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
            this.mon(this, 'edit', this._onEdit, this);
            this.mon(this, 'edit', this._applyQueuedChanges, this);
        },
        _onAfterRender: function () {
            Ext4.util.KeyMap.create({
                defaultEventAction: 'stopEvent',
                fn: this._onAppendKeypress,
                ignoreInputFields: true,
                key: 187, // =
                scope: this,
                shift: true,
                target: this.getEl()
            });
            // for whatever reason, we need to wait for a half second in order for the "perfomed by" column
            // to populate to its default. if there's a more sure-fire way to do this, by all means, let's
            // do it that way instead - clay, 08 May 2018
            setTimeout(this._onAppendKeypress.bind(this), 500);
        },
        _onAppendKeypress: function () {
            this.down('button[itemId=appendRecordBtn]').getEl().dom.click()
        },
        _applyQueuedChanges: function () {
            // execute any queued model changes. this is helpful to avoid a strange UI situation where
            // the next field we tab into is somehow rendered in the center of the screen
            while (this._changes.length)
                this._changes.shift()();
        },
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
        _updatePregnancy: function (model, value) {
            model.set('pregnancyid', null);
            LABKEY.Query.executeSql({
                failure: function (error) {
                    console.error('unable to retrieve default pregnancy: id=' + value);
                    console.error(error.exception);
                },
                schemaName: 'study',
                scope: this,
                sql: Ext4.String.format(GET_ACTIVE_PREGNANCY_LSID_BY_ID_SQL, LABKEY.Query.sqlStringLiteral(value)),
                success: function (data) {
                    if (data.rowCount)
                        this._changes.push(model.set.bind(model, 'pregnancyid', data.rows[0].lsid));
                }
            });
        }
    });
})();