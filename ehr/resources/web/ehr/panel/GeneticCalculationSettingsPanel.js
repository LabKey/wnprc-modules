/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.GeneticCalculationSettingsPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        Ext4.apply(this, {
            //width: 550,
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page allows admins to schedule a nightly pipeline job that will refresh kinship and other genetic data on the colony.  The boxes below control whether the job is scheduled to run, and the time of day (24-hour clock) when it is scheduled to run.  The containerPath should be the location of the EHR study.',
                style: 'padding-bottom: 20px'
            },{
                xtype: 'displayfield',
                fieldLabel: 'Is Scheduled?',
                itemId: 'isScheduled'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Is Enabled?',
                itemId: 'enabled'
            },{
                xtype: 'numberfield',
                hideTrigger: true,
                fieldLabel: 'Hour Of Day',
                itemId: 'hourOfDay',
                width: 400
            },{
                xtype: 'textfield',
                fieldLabel: 'Container Path',
                itemId: 'containerPath',
                width: 400
            }],
            buttons: [{
                text: 'Save Settings',
                handler: function(btn){
                    btn.up('panel').saveData();
                }
            },{
                text: 'Run Now',
                scope: this,
                handler: function(btn){
                    window.location = LABKEY.ActionURL.buildURL('ehr', 'doGeneticCalculations');
                }
            },{
                text: 'Cancel',
                scope: this,
                handler: function(btn){
                    window.location = LABKEY.ActionURL.buildURL('project', 'start');
                }
            }]
        });

        this.callParent();
        this.doLoad();
    },

    doLoad: function(){
        Ext4.Msg.wait('Loading...');

        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'getGeneticCalculationTaskSettings'),
            method : 'POST',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onDataLoad, this)
        });
    },

    onDataLoad: function(results){
        Ext4.Msg.hide();

        this.down('#isScheduled').setValue(results.isScheduled);
        this.down('#enabled').setValue(results.enabled);
        this.down('#hourOfDay').setValue(results.hourOfDay);
        this.down('#containerPath').setValue(results.containerPath);
    },

    saveData: function(){
        Ext4.Msg.wait('Saving...');
      LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'setGeneticCalculationTaskSettings'),
            params: {
                containerPath: this.down('#containerPath').getValue(),
                enabled: this.down('#enabled').getValue(),
                hourOfDay: this.down('#hourOfDay').getValue()
            },
            method : 'POST',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(result){
                Ext4.Msg.hide();

                Ext4.Msg.alert('Success', 'Settings Updated', function(){
                    this.doLoad();
                }, this);
            }
        });
    }
});