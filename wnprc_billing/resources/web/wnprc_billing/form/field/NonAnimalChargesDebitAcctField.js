Ext4.define('WNPRC_Billing.form.field.NonAnimalChargesDebitAcctField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-nonanimalchargesdebitacctfield',
    containerPath: LABKEY.moduleContext.ehr['EHRStudyContainer'],

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
            },

            focus: function() {

                var dateEntered = undefined;
                //for bulk edit window
                if (this.up("form") && this.up("form").getForm()) {
                    var dateFieldVal = this.up("form").getForm().findField("date");

                    if (dateFieldVal && dateFieldVal.getValue()) {
                        dateEntered = dateFieldVal.getValue();
                    }
                }
                else {
                    if (this.up("grid")) {
                        dateEntered = EHR.DataEntryUtils.getSiblingValue(this, "date");
                    }
                }

                //filter debitedAccount based on alias.budgetStartDate and alias.budgetEndDate w.r.t the date entered
                if (dateEntered) {
                    this.store.filterArray = [LABKEY.Filter.create('budgetStartDate', Ext4.Date.format(dateEntered, 'Y-m-d'), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL),
                                        LABKEY.Filter.create('budgetEndDate', Ext4.Date.format(dateEntered, 'Y-m-d'), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)];
                    this.store.load();
                }
            }
        });
        this.callParent(arguments);
    }
});