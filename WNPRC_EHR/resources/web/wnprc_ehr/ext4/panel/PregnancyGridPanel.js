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
     * Edit event handler. Updates the estimated due date of the passed row based on any changes to the conception date.
     *
     * @param sender
     * @param {{field, originalValue, value}} args
     * @this Component
     * @private
     */
    function _onEdit(sender, args) {

        // short-circuit if the value did not actually change
        if (args.originalValue === args.value)
            return;

        // get the model for the selected/active row
        const model = this.getSelectionModel().getSelection()[0];

        var id = model.get('Id');
        var gestationPeriod;
        if (id != null && id.startsWith('cy')) {
            //Cynomolgus
            gestationPeriod = 155;
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