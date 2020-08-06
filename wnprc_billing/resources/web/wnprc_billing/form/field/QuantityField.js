Ext4.define('WNPRC_Billing.form.field.QuantityField', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.wnprc_billing-quantityfield',
    initComponent: function() {

        this.addListener({
            scope:this,
            change: function (field, val) {

                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {

                    var unitCost = this.up("form").getForm().findField("unitCost");
                    var totalCost = this.up("form").getForm().findField("totalCost");
                    totalCost.disabled = false;
                    if (unitCost && unitCost.getValue()) {
                        totalCost.setValue(val * unitCost.getValue());
                    }
                    else {
                        totalCost.setValue(null);
                    }
                }
                //for data entry grid
                else {
                    if (this.up("grid")) {
                        var unitCost = EHR.DataEntryUtils.getSiblingValue(this, "unitCost");
                        EHR.DataEntryUtils.setSiblingFields(field, {
                            totalCost: unitCost ? (val * unitCost) : null
                        });
                    }
                }
            }});
        this.callParent();
    }
});