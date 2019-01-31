Ext4.define('WNPRC_Billing.form.field.MiscChargesDebitAcctEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-miscchargesdebitacctentryfield',

    schemaName: 'ehr_billing',
    queryName: 'aliases',

    initComponent: function() {

        this.addListener({
                scope:this,
                select: function (combo, recs) {

                    //clear the investigator field if alias (labeled as 'Debited Account' on data entry form) value is changed
                    EHR.DataEntryUtils.setSiblingFields(combo, {
                        investigator: null
                    });
                }
        });
        this.callParent(arguments);
    }
});