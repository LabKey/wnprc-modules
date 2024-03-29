Ext4.define('WNPRC_Billing.form.field.MiscChargesDateField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.wnprc_billing-miscchargesdatefield',

    initComponent: function(){

        this.addListener({
            scope:this,
            render: function (field, newVal) {
                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {
                    if (!field.getValue()) {
                        field.setValue(Ext4.Date.format(new Date(), 'Y-m-d'));
                    }
                    //Non-Animal Charges bulk edit doesn't like the above date setting
                    if (!field.getValue()) {
                        field.setValue(new Date());
                    }
                }
            },
            change: function (field, newVal) {

                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {

                    var unitCostField = this.up("form").getForm().findField("unitCost");
                    if (unitCostField) {
                        unitCostField.setValue(null);
                    }

                    var chargeIdField = this.up("form").getForm().findField("chargeId");
                    if (chargeIdField) {
                        chargeIdField.setValue(null);
                    }

                    var chargeGroupField = this.up("form").getForm().findField("chargeGroup");
                    if (chargeGroupField) {
                        chargeGroupField.setValue(null);
                    }

                    var projectField = this.up("form").getForm().findField("project");
                    if (projectField) {
                        projectField.setValue(null);
                    }

                    var debitedAccount = this.up("form").getForm().findField("debitedaccount");
                    if (debitedAccount) {
                        debitedAccount.setValue(null);
                    }

                }
                //for data entry grid
                else {
                    //if date is changed, reset below values since unitCost is retrieved from ehr_billing.chargeRates based on the date entered along with its coupled selections (chargeGroup (labeled as Group), which is coupled with chargeId (labeled as Charge Item))
                    EHR.DataEntryUtils.setSiblingFields(field, {
                        chargeGroup: null,
                        chargeId: null,
                        unitCost: null,
                        project: null,
                        debitedAccount: null
                    });
                }
            }});
        this.callParent();
    }
});