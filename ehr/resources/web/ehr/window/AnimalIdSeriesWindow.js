/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.AnimalIdSeriesWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Enter Series of IDs',
            border: true,
            bodyStyle: 'padding: 5px',
            width: 350,
            defaults: {
                border: false,
                width: 320
            },
            items: [{
                fieldLabel: 'Starting Number',
                itemId: 'startNumber',
                xtype: 'ehr-animalgeneratorfield'
            },{
                xtype: 'numberfield',
                itemId: 'totalIds',
                hideTrigger: true,
                fieldLabel: 'Total IDs'
            }],
            buttons: [{
                text:'Submit',
                scope: this,
                handler: this.getAnimals
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    getAnimals: function(){
        var startNumber = this.down('#startNumber').getValue();
        var totalIds = this.down('#totalIds').getValue();

        if (!startNumber || !totalIds){
            Ext4.Msg.alert('Error', 'Must enter a starting number and total number of animals');
            return;
        }

        var records = [];
        for (var i=0;i<totalIds;i++){
            records.push(this.targetStore.createModel({Id: (startNumber + i)}));
        }

        if (records.length)
            this.targetStore.add(records);

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('ANIMAL_ID_SERIES', function(config){
    return Ext4.Object.merge({
        text: 'Add Series of IDs',
        tooltip: 'Click to add a series of IDs, incrementing one number per row',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('EHR.window.AnimalIdSeriesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
