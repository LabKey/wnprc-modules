
Ext4.define('WNPRC_Billing.form.field.ProjectEntryField', {
    extend: 'EHR_Billing.form.field.EHRBillingProjectEntryField',
    alias: 'widget.wnprc_billing-projectentryfield',

    initComponent: function(){

        this.addListener({
            scope:this,
            select: function (field, val) {

                //get debit acct value
                var projectRec = field.store.getAt(field.store.find('project', field.getValue()));
                var acct = null;
                if(projectRec) {
                    acct = projectRec.get('account');
                }

                //on project change, reset investigator
                //for bulk edit window
                if (field.up("form") && field.up("form").getForm()) {
                    var invesField = field.up("form").getForm().findField("investigator");
                    if (invesField) {
                        invesField.disabled = false;
                        invesField.setValue(null);
                    }

                    var debitedacct = field.up("form").getForm().findField("debitedaccount");
                    if (debitedacct) {
                        debitedacct.disabled = false;
                        debitedacct.setValue(acct);
                    }
                }
                //for data entry grid
                else {

                    EHR.DataEntryUtils.setSiblingFields(field, {
                        investigator: null,
                        debitedaccount: acct
                    });
                }
            }
        });
        this.callParent();
    }
});