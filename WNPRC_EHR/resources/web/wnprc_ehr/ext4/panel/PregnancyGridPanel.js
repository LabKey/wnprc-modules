/**
 * @external Ext4
 */
/**
 * @typedef {Object} Component
 * @prop {Function} define
 * @prop {Function} getSelectionModel
 * @prop {Function} mon
 */
(function () {
    /**
     * Edit event handler. Updates the estimated conception and due dates of the passed row.
     *
     * @param sender
     * @param {{field, originalValue, value}} args
     * @this Component
     * @private
     */
    function _onEdit(sender, args) {

        // short-circuit if the value did not actually change
        if (args.originalValue === args.value) {
            return;
        }

        // get the model for the selected/active row
        const model = this.getSelectionModel().getSelection()[0];

        var id = model.get('Id');
        var gestationPeriod;
        if (id != null && id.startsWith('cy')) {
            //Cynomolgus
            gestationPeriod = 165;
        } else if (id != null && id.startsWith('cj')) {
            //Marmoset
            gestationPeriod = 144;
        } else {
            //Rhesus
            gestationPeriod = 165;
        }

        switch (args.field) {
            case 'date_conception': {
                model.set("date_due", Ext4.Date.add(args.value, Ext4.Date.DAY, gestationPeriod));
                break;
            }
            case 'date_due': {
                model.set("date_conception", Ext4.Date.add(args.value, Ext4.Date.DAY, -gestationPeriod));
                break;
            }
            case 'breedingencounterid': {
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'breeding_encounters',
                    columns: 'date,enddate',
                    filterArray: [
                        LABKEY.Filter.create('lsid', args.value, LABKEY.Filter.Types.EQUALS)
                    ],
                    scope: this,
                    success: function(data) {
                        if (data.rows && data.rows.length) {
                            var row = data.rows[0];
                            var early = LDK.ConvertUtils.parseDate(row.date, 'Y/m/d H:i:s');
                            //Conception can occur up to 3 days after the breeding window has ended
                            if (row.enddate) {
                                var late = Ext4.Date.add(LDK.ConvertUtils.parseDate(row.enddate, 'Y/m/d H:i:s'), Ext4.Date.DAY, 3);
                                model.set("date_conception_early", early);
                                model.set("date_conception_late", late);
                                model.set("date_due_early", Ext4.Date.add(early, Ext4.Date.DAY, gestationPeriod));
                                model.set("date_due_late", Ext4.Date.add(late, Ext4.Date.DAY, gestationPeriod));
                            }
                        }
                    },
                    failure: EHR.Utils.onFailure
                });
                break;
            }
        }
    }

    Ext4.define('WNPRC.grid.PregnancyGridPanel', {
        extend: 'WNPRC.grid.AppendRecordGridPanel',
        alias: 'widget.wnprc-pregnancygridpanel',

        initComponent: function () {
            this.callParent(arguments);
            this.mon(this, 'edit', _onEdit, this);
        }
    });
})();