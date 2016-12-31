/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg dataEntryPanel
 */
Ext4.define('EHR.window.EncounterAddRecordWindow', {
    extend: 'Ext.window.Window',
    width: 500,

    initComponent: function(){
        var data = EHR.DataEntryUtils.getEncountersRecords(this.dataEntryPanel);

        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Add Record',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'Please choose which procedure is associated with this record, or select multiple procedures to add more than 1 record:',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'checkcombo',
                itemId: 'comboField',
                addAllSelector: true,
                mutliSelect: true,
                width: 400,
                displayField: 'title',
                valueField: 'parentid',
                store: {
                    type: 'store',
                    fields: ['title', 'parentid', 'Id', 'date', 'project'],
                    data: data
                },
                forceSelection: true
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        if (!data.length) {
            this.on('beforeshow', function(){
                Ext4.Msg.alert('No Records', 'Cannot add results to this section without a corresponding procedure above.  Note: the procedure must have an Id/date in order to enter results');
                this.close();
                return false;
            }, this);
        }
        else if (data.length == 1){
            var parentid = data[0].parentid;
            this.on('beforeshow', function(){
                this.processParentIds([parentid]);
                return false;
            }, this);
        }
    },

    onSubmit: function(){
        var parentids = this.down('#comboField').getValue();
        if (!parentids.length){
            Ext4.Msg.alert('Error', 'Must select at least 1 record');
            return;
        }

        this.processParentIds(parentids);
    },

    processParentIds: function(parentids){
        var combo = this.down('#comboField');
        var cellEditing = this.targetGrid.getPlugin('cellediting');
        if (cellEditing)
            cellEditing.completeEdit();

        var toAdd = [];
        Ext4.Array.forEach(parentids, function(parentid){
            var recIdx = combo.store.findExact('parentid', parentid);

            LDK.Assert.assertTrue('Unable to find record', recIdx != -1);
            var rec = combo.store.getAt(recIdx);

            var model = this.targetGrid.store.createModel({});
            var obj = {};
            Ext4.Array.forEach(['Id', 'date', 'parentid', 'project'], function(field){
                if (this.targetGrid.store.getFields().get(field)){
                    obj[field] = rec.get(field);
                }
            }, this);

            model.set(obj);
            toAdd.push(model);
        }, this);

        this.targetGrid.store.add(toAdd);

        if (cellEditing)
            cellEditing.startEditByPosition({row: 0, column: this.targetGrid.firstEditableColumn || 0});

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('ENCOUNTERADD', function(config){
    return Ext4.Object.merge({
        text: 'Add Record',
        tooltip: 'Click to add a row',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var panel = grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in ENCOUNTERADD button', panel);

            var store = panel.storeCollection.getClientStoreByName('encounters');
            LDK.Assert.assertNotEmpty('Unable to find encounters store in ENCOUNTERADD button', store);

            Ext4.create('EHR.window.EncounterAddRecordWindow', {
                targetGrid: grid,
                dataEntryPanel: panel
            }).show();
        }
    }, config);
});