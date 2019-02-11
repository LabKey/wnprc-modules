
Ext4.define('WNPRC_Billing.form.field.ProjectEntryField', {
    extend: 'EHR_Billing.form.field.EHRBillingProjectEntryField',
    alias: 'widget.wnprc_billing-projectentryfield',

    initComponent: function(){

        this.addListener({scope:this, select: function (combo, recs) {
                //clear the investigator field if the project is changed
                EHR.DataEntryUtils.setSiblingFields(combo, {
                    investigator: null
                });
            }});
        this.callParent();
    }
});