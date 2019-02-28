Ext4.define('WNPRC_Billing.form.field.MiscChargesDateField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.wnprc_billing-miscchargesdatefield',

    initComponent: function(){

        this.addListener({
            scope:this,
            change: function (combo, val) {

                //if date is changed, reset below values since unitCost is retrieved from ehr_billing.chargeRates based on the date entered along with its coupled selections (chargetype (labeled as Charge Unit), which is coupled with chargeId (labeled as Charge Item))
                EHR.DataEntryUtils.setSiblingFields(combo, {
                    chargetype: null,
                    chargeId: null,
                    unitCost: null
                });
            }});
        this.callParent();
    }
});