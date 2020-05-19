Ext4.define('WNPRC_Billing.form.field.NonAnimalChargesDebitAcctField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-nonanimalchargesdebitacctfield',

    initComponent: function() {

        this.addListener({
            scope:this,
            select: function(field, newValue) {
                //on alias (labeled as 'Debited Account') change, reset investigator
                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {

                    var invesField = this.up("form").getForm().findField("investigator");
                    if (invesField) {
                        invesField.disabled = false;
                        invesField.setValue(null);
                    }
                }
                else {
                    //for data entry grid
                    EHR.DataEntryUtils.setSiblingFields(this, {
                        investigator: null
                    });
                }
            }
        });
        this.callParent(arguments);
    }
});