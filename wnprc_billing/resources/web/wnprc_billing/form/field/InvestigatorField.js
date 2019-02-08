/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display WNPRC Investigator.
 */
Ext4.define('WNPRC_BILLING.form.field.InvestigatorField', {
    extend: 'EHR_Billing.form.field.EHRBillingRowObserverEntryField',
    alias: 'widget.wnprc_billing-investigatorfield',
    containerPath: LABKEY.moduleContext.ehr['EHRStudyContainer'],

    initComponent: function() {
        this.callParent(arguments);
    }

});