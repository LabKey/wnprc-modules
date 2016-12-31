/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 */
Ext4.define('EHR.window.RepeatSelectedWindow', {
    extend: 'Ext.window.Window',
    width: 500,

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Repeat Selected',
            border: true,
            bodyStyle: 'padding:5px',
            defaults: {
                border: false,
                bodyBorder: false
            },
            items: [{
                html: 'This helper allows you to repeat the selected rows, incrementing by a set number of days.  An example of when this is used would be to order a medication or set of medications daily for a week, once per week, etc.',
                style: 'margin-bottom: 20px;'
            },{
                layout: {
                    type: 'table',
                    columns: 3
                },
                defaults: {
                    border: false,
                    style: 'margin-right: 10px;'
                },
                items: [{
                    html: 'Repeat every: '
                },{
                    xtype: 'numberfield',
                    hideTrigger: true,
                    itemId: 'incrementField',
                    value: 1,
                    width: 40
                },{
                    html: ' days'
                },{
                    html: 'A total of: '
                },{
                    xtype: 'numberfield',
                    hideTrigger: true,
                    itemId: 'durationField',
                    width: 40
                },{
                    html: ' times'
                }]
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
    },

    onSubmit: function(){
        var toAdd = [];

        var increment = this.down('#incrementField').getValue();
        var duration = this.down('#durationField').getValue();
        if (!duration || !increment){
            Ext4.Msg.alert('Error', 'Must enter both fields');
            return;
        }
        //NOTE: we want to sort in the same order as the original grid
        var selected = this.targetGrid.getSelectionModel().getSelection();
        selected = selected.sort(function(a, b){
            var aIdx = a.store.indexOf(a);
            var bIdx = b.store.indexOf(b);

            if (aIdx < bIdx) {
                return -1;
            } else if (aIdx > bIdx) {
                return 1;
            }

            return 0;
        });

        for (var i=1;i<=duration;i++){
            Ext4.each(selected, function(rec){
                var data = {};
                rec.fields.each(function(f){
                    if (['lsid', 'objectid'].indexOf(f.name) == -1){
                        data[f.name] = rec.get(f.name);
                    }
                }, this);

                //now adjust date
                if (data.date){
                    data.date = Ext4.Date.add(data.date, Ext4.Date.DAY, (i * increment));
                }

                toAdd.push(this.targetGrid.store.createModel(data));
            }, this);
        }

        if (toAdd.length){
            //NOTE: when duplicating records, always insert after the highest selected row
            var insertIdx = -1;
            Ext4.Array.forEach(selected, function(r){
                var idx = r.store.indexOf(r);
                if (idx > insertIdx)
                    insertIdx = idx;
            }, this);

            insertIdx++;

            this.targetGrid.store.insert(insertIdx, toAdd);
        }

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('REPEAT_SELECTED', function(config){
    return Ext4.Object.merge({
        text: 'Repeat Selected',
        tooltip: 'Click to repeat the selected rows, such as a recurring daily med',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selected = grid.getSelectionModel().getSelection();
            if (!selected || !selected.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.RepeatSelectedWindow', {
                targetGrid: grid
            }).show();
        }
    }, config);
});