/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.LowestCageField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-lowestcagefield',

    triggerCls: 'x4-form-search-trigger',
    triggerToolTip: 'Click to set this to match the current cage',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(e){
        var rec = EHR.DataEntryUtils.getBoundRecord(this);
        if (rec){
            var cage = rec.get('cage');
            if (cage)
                this.setValue(cage);
        }
    }
});