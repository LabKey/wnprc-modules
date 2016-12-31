/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.RecordDeleteSettingsPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        Ext4.apply(this, {
            //width: 550,
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page allows admins to schedule a daily job that will delete any records marked as \'Delete Requested\' or \'Request: Denied\' or \'Request: Cancelled\'.',
                style: 'padding-bottom: 20px'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Is Enabled?',
                itemId: 'enabled'
//            },{
//                xtype: 'numberfield',
//                hideTrigger: true,
//                fieldLabel: 'Hour Of Day',
//                itemId: 'hourOfDay',
//                width: 400
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
                    window.location = LABKEY.ActionURL.buildURL('ehr', 'deletedRecordsRunner');
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
            url : LABKEY.ActionURL.buildURL('ehr', 'getRecordDeleteSettings'),
            method : 'POST',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onDataLoad, this)
        });
    },

    onDataLoad: function(results){
        Ext4.Msg.hide();

        this.down('#enabled').setValue(results.enabled);
    },

    saveData: function(){
        Ext4.Msg.wait('Saving...');
      LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'setRecordDeleteSettings'),
            params: {
                enabled: this.down('#enabled').getValue()
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