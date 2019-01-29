
Ext4.define('WNPRC_Billing.form.field.ChargeItemField', {
    extend: 'EHR_Billing.form.field.EHRBillingRowObserverEntryField',
    alias: 'widget.wnprc_billing-chargeitemfield',

    initComponent: function(){

        this.addListener({scope:this, select: function (combo, recs) {
                if (Ext4.isArray(recs) && recs.length === 1) {
                    var rec = recs[0];
                    EHR.DataEntryUtils.setSiblingFields(combo, {
                        unitCost: rec.get('unitCost')
                    });
                }
            }});
        this.callParent();
    }
});