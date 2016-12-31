/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.AnimalIdGeneratorField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-animalgeneratorfield',

    allowDecimals : false,
    allowNegative : false,

    initComponent: function(){
        Ext4.apply({
            triggerToolTip: 'Click to populate with the next available Id'
        });

        this.callParent(arguments);
    },

    onTriggerClick: function(){
        Ext4.Msg.wait('Loading...');

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: 'SELECT max(CAST(Id as integer)) as expr FROM (SELECT Id FROM study.demographics WHERE isNumericId = true UNION ALL SELECT Id FROM study.birth WHERE isNumericId = true UNION ALL SELECT Id FROM study.arrival WHERE isNumericId = true) t',
            maxRows: 1,
            scope: this,
            error: LDK.Utils.getErrorCallback(),
            success: function(results){
                Ext4.Msg.hide();

                if (results && results.rows && results.rows.length){
                    this.setValue(results.rows[0].expr + 1);
                }
            }
        });
    }
});