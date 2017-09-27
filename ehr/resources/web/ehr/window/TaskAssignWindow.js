/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.TaskAssignWindow', {
    extend: 'Ext.window.Window',

    statics: {
        buttonHandler: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.create('EHR.window.TaskAssignWindow', {
                dataRegionName: dataRegionName
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Assign Tasks',
            modal: true,
            closeAction: 'destroy',
            defaults: {
                border: false
            },
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This will allow you to re-assign the selected tasks to the individual or group selected below.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'ehr-usersandgroupscombo',
                itemId: 'assignedTo',
                fieldLabel: 'Assigned To',
                width: 400
            }],
            buttons: [{
                text: 'Submit',
                handler: this.onSubmit,
                scope: this
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    onSubmit: function(btn){
        var assignedTo = this.down('#assignedTo').getValue();
        if (!assignedTo){
            Ext4.Msg.alert('Error', 'Must select a user or group');
            return;
        }

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LDK.Assert.assertNotEmpty('Unable to find DataRegion in TaskAssignWindow', dataRegion);

        var rows = [];
        Ext4.Array.forEach(dataRegion.getChecked(), function(taskId){
            rows.push({
                taskid: taskId,
                assignedTo: assignedTo
            });
        }, this);

        if (rows.length){
            Ext4.Msg.wait('Updating...');

            LABKEY.Query.updateRows({
                method: 'POST',
                schemaName: 'ehr',
                queryName: 'tasks',
                rows: rows,
                failure: LDK.Utils.getErrorCallback(),
                success: this.onSuccess,
                scope: this
            });
        }
        else {
            Ext4.Msg.alert('No Rows', 'No rows were selected')
        }

    },

    onSuccess: function(){
        Ext4.Msg.hide();

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        dataRegion.refresh();

        this.close();
    }
});