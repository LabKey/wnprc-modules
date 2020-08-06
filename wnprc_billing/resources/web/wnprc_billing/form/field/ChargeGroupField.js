Ext4.define('WNPRC_Billing.form.field.ChargeGroupEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-chargegroupentryfield',
    initComponent: function(){

        this.addListener({
            scope:this,
            select: function (combo, recs) {

                //on chargeGroup (labeled as Group) change, reset chargeId (labeled as Charge Item) and unitCost.
                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {

                    var chargeIdField = this.up("form").getForm().findField("chargeId");
                    if (chargeIdField) {
                        chargeIdField.disabled = false;
                        chargeIdField.setValue(null);
                    }

                    var unitCostField = this.up("form").getForm().findField("unitCost");
                    if (unitCostField) {
                        unitCostField.disabled = false;
                        unitCostField.setValue(null);
                    }
                    var totalCostField = this.up("form").getForm().findField("totalCost");
                    if (totalCostField) {
                        totalCostField.disabled = false;
                        totalCostField.setValue(null);
                    }
                }
                //for data entry grid
                else {
                    EHR.DataEntryUtils.setSiblingFields(combo, {
                        chargeId: null,
                        unitCost: null,
                        totalCost: null
                    });
                }
            }});
        this.callParent();
    }
});