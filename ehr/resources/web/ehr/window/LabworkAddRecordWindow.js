/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg dataset
 */
Ext4.define('EHR.window.LabworkAddRecordWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        var data = this.getData();

        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Add Record',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'Please choose which panel is associated with this result:',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'combo',
                itemId: 'comboField',
                width: 400,
                displayField: 'title',
                valueField: 'runid',
                store: {
                    type: 'store',
                    fields: ['title', 'runid', 'Id', 'date'],
                    data: this.getData()
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
                Ext4.Msg.alert('No Records', 'Cannot add results to this section without a corresponding panel above.  Note: the panels must have an Id/date in order to enter results');
                this.close();
                return false;
            }, this);
        }
        else if (data.length == 1){
            var runId = data[0].runid;
            this.on('beforeshow', function(){
                this.processRunId(runId);
                return false;
            }, this);
        }
    },

    onSubmit: function(){
        var runId = this.down('#comboField').getValue();
        if (!runId){
            Ext4.Msg.alert('Error', 'You must choose which panel is associated with this result');
            return;
        }

        this.processRunId(runId);
    },

    processRunId: function(runId){
        var combo = this.down('#comboField');
        var recIdx = combo.store.findExact('runid', runId);

        LDK.Assert.assertTrue('Unable to find record', recIdx != -1);
        var rec = combo.store.getAt(recIdx);

        var cellEditing = this.targetGrid.getPlugin('cellediting');
        if (cellEditing)
            cellEditing.completeEdit();

        var model = this.targetGrid.store.createModel({});
        LDK.Assert.assertNotEmpty('runid is null in LabworkAddRecordWindow', rec.get('runid'));
        model.set({
            Id: rec.get('Id'),
            date: rec.get('date'),
            runid: rec.get('runid')
        });

        this.targetGrid.store.insert(0, [model]); //add a blank record in the first position

        if (cellEditing)
            cellEditing.startEditByPosition({row: 0, column: this.targetGrid.firstEditableColumn || 0});

        this.close();
    },

    getData: function(){
        var data = [];
        this.runsStore.each(function(r){
            if (r.get('type') == this.dataset && r.get('Id') && r.get('date')){
                var title = r.get('Id') + ': ' + r.get('servicerequested');
                data.push({
                    title: title,
                    runid: r.get('objectid'),
                    Id: r.get('Id'),
                    date: r.get('date')
                });
            }
        }, this);

        return data;
    }
});