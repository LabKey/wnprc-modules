/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display WNPRC Investigator.
 */
Ext4.define('WNPRC_BILLING.form.field.InvestigatorField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-investigatorfield',
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
                    var projectVal = EHR.DataEntryUtils.getSiblingValue(this, "project");
                    if (projectVal) {
                        filter = LABKEY.Filter.create('project', projectVal, LABKEY.Filter.Types.EQUAL)
                    }
                }

                //for bulk edit window
                var form = this.up("form") ? this.up("form").getForm() : undefined;
                if (form) {

                    //for charges form with animal Ids, get investigator based on project selection
                    var projectField = form.findField("project");

                    if (projectField) {
                        filter = LABKEY.Filter.create('project', projectField.value, LABKEY.Filter.Types.EQUAL);
                    }
                }

                this.store.filterArray = [filter];
                this.store.load();
            }
        });
        this.callParent();
    }
});