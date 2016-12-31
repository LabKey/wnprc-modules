/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.DrugVolumeField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-drugvolumefield',

    triggerCls: 'x4-form-search-trigger',
    triggerToolTip: 'Click to calculate amount based on concentration and volume',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (!record){
            return;
        }

        if (!record.get('code') || !record.get('Id')){
            Ext4.Msg.alert('Error', 'Must enter the Animal Id and treatment');
            return;
        }

        Ext4.create('EHR.window.DrugAmountWindow', {
            targetStore: record.store,
            formConfig: record.sectionCfg,
            boundRecord: record
        }).show();
    }
});