/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display WNPRC Investigator.
 */
Ext4.define('WNPRC_BILLING.form.field.InvestigatorFieldFromAlias', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-investigatorfieldfromalias',
    containerPath: LABKEY.moduleContext.ehr['EHRStudyContainer'],

    displayField: 'investigatorName',
    valueField: 'investigatorName',

    initComponent: function() {
        this.callParent(arguments);
        this.addListener({
            scope: this,
            focus: function() {

                var filter = undefined;

                //for data entry grid
                if (this.up("grid")) {

                    var debitedAcctVal = EHR.DataEntryUtils.getSiblingValue(this, "debitedaccount");
                    if (debitedAcctVal) {
                       filter = LABKEY.Filter.create('alias', debitedAcctVal, LABKEY.Filter.Types.EQUAL);
                    }
                }

                //for bulk edit window
                var form = this.up("form") ? this.up("form").getForm() : undefined;
                if (form) {

                    var debitedAcctField = form.findField("debitedaccount");

                    //for charges form without animal Ids, get investigator based on debited account selection
                    if (debitedAcctField) {
                        filter = LABKEY.Filter.create('alias', debitedAcctField.value, LABKEY.Filter.Types.EQUAL);
                    }
                }

                this.store.filterArray = [filter];
                this.store.load();
            }
        });
        this.callParent();
    }
});