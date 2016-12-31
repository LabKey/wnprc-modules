/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @cfg casePrefix
 * @cfg encounterType
 */
Ext4.define('EHR.form.field.PathologyCaseNoField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-pathologycasenofield',

    triggerCls: 'x4-form-search-trigger',
    triggerToolTip: 'Click to calculate the case number',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (record){
            Ext4.create('EHR.window.CaseNumberWindow', {
                targetRecord: record,
                encounterType: this.encounterType,
                casePrefix: this.casePrefix
            }).show();
        }
    }
});