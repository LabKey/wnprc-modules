Ext4.define('WNPRC_Billing.form.field.UnitCostField', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.wnprc_billing-unitcostfield',
    initComponent: function() {

        this.addListener({
            scope:this,
            change: function (field, val) {

                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {

                    var quantity = this.up("form").getForm().findField("quantity");
                    var totalCost = this.up("form").getForm().findField("totalCost");
                    totalCost.disabled = false;
                    if (quantity && quantity.getValue()) {
                        totalCost.setValue(val * quantity.getValue());
                    }
                    else {
                        totalCost.setValue(null);
                    }
                }
                //for data entry grid
                else {
                    if (this.up("grid")) {
                        var quantity = EHR.DataEntryUtils.getSiblingValue(this, "quantity");
                        EHR.DataEntryUtils.setSiblingFields(field, {
                            totalCost: quantity ? (val * quantity) : null
                        });
                    }
                }
            }});
        this.callParent();
    }
});