/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.RoomTransferWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Transfer Entire Room',
            modal: true,
            bodyStyle: 'padding: 5px;',
            width: 430,
            defaults: {
                border: false,
                width: 400
            },
            items: [{
                html: 'This helper will take all the animals from the source room, and move them to the destination room, preserving cage location, if applicable.',
                style: 'padding-bottom: 10px;',
                border: false
            },{
                xtype: 'ehr-roomfieldsingle',
                itemId: 'sourceField',
                fieldLabel: 'Source Room'
            },{
                xtype: 'ehr-roomfieldsingle',
                itemId: 'destField',
                fieldLabel: 'Destination Room'
            },{
                xtype: 'xdatetime',
                itemId: 'dateField',
                fieldLabel: 'Transfer Date'
            },{
                xtype: 'labkey-combo',
                itemId: 'reasonField',
                fieldLabel: 'Reason',
                valueField: 'value',
                displayField: 'value',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'housing_reason',
                    filterArray: [LABKEY.Filter.create('date_disabled', null, LABKEY.Filter.Types.ISBLANK)],
                    autoLoad: true
                }
            },{
                xtype: 'textfield',
                itemId: 'performedbyField',
                fieldLabel: 'Performed By',
                value: LABKEY.Security.currentUser.displayName
            },{
                xtype: 'checkbox',
                itemId: 'copyCagesField',
                fieldLabel: 'Copy Cages?'
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    onSubmit: function(){
        var source = this.down('#sourceField').getValue();
        var dest = this.down('#destField').getValue();
        var date = this.down('#dateField').getValue();
        var reason = this.down('#reasonField').getValue();
        var performedby = this.down('#performedbyField').getValue();

        if (!source || !dest || !date || !reason){
            Ext4.Msg.alert('Error', 'Must supply the source room, destination room, date, reason and performed by');
            return;
        }

        Ext4.Msg.wait('Loading...');

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            filterArray: [
                LABKEY.Filter.create('isActive', true),
                LABKEY.Filter.create('room', source)
            ],
            columns: 'Id,room,cage',
            sort: 'room,cage,Id',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onLoad
        });
    },

    onLoad: function(results){
        Ext4.Msg.hide();

        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.alert('No Animals', 'No animals were found in this location');
            return;
        }

        var dest = this.down('#destField').getValue();
        var date = this.down('#dateField').getValue();
        var reason = this.down('#reasonField').getValue();
        var performedby = this.down('#performedbyField').getValue();
        var copyCages = this.down('#copyCagesField').getValue();

        var toAdd = [];
        Ext4.Array.forEach(results.rows, function(r){
            toAdd.push(this.targetStore.createModel({
                Id: r.Id,
                date: date,
                room: dest,
                cage: copyCages ? r.cage :  null,
                reason: reason,
                performedby: performedby
            }))
        }, this);

        if (toAdd.length){
            this.targetStore.add(toAdd);
        }

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('ROOM_TRANSFER', function(config){
    return Ext4.Object.merge({
        text: 'Mass Transfer',
        xtype: 'button',
        tooltip: 'Click to transfer animals from one room to another, preserving cage',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('EHR.window.RoomTransferWindow', {
                targetStore: grid.store
            }).show();
        }
    });
});