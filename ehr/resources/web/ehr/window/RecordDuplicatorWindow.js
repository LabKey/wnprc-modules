/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This provides the UI to duplicate one or more records from a DataEntryPanel.  It allows the user to pick the number of copies
 * per record and which fields to copy
 *
 * @cfg targetGrid
 * @cfg formConfig
 */
Ext4.define('EHR.window.RecordDuplicatorWindow', {
    extend: 'Ext.window.Window',
    width: 500,

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Duplicate Selected',
            border: true,
            bodyStyle: 'padding:5px',
            defaults: {
                border: false,
                bodyBorder: false
            },
            items: [{
                html: 'This helper will create copies of the selected records.  It will only copy the fields you have selected below.',
                //maxWidth: 400,
                style: 'margin-bottom: 20px;'
            },{
                xtype: 'ldk-numberfield',
                minValue: 0,
                labelWidth: 150,
                fieldLabel: 'Number of Copies',
                helpPopup: 'This determines how many copies will be made of each record',
                itemId: 'newRecs',
                value: 1
            },{
                xtype: 'checkbox',
                labelWidth: 150,
                fieldLabel: 'Bulk Edit?',
                helpPopup: 'If checked, you will have the option to bulk edit the newly created records.',
                itemId: 'doBulkEdit'
            },{
                html: 'Choose Fields to Copy:',
                style: 'padding-top: 10px;padding-bottom: 5px;'
            },{
                xtype: 'form',
                items: [{
                    xtype: 'checkboxgroup',
                    columns: 2,
                    labelAlign: 'top',
                    defaults: {
                        width: 200
                    },
                    items: this.getCheckboxes()
                }]
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    this.duplicate();
                    this.close();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    getCheckboxes: function(){
        var items = [];
        this.targetGrid.store.getFields().each(function(f){
            if (f.alwaysDuplicate){
                items.push({
                    xtype: 'checkbox',
                    hidden: true,
                    dataIndex: f.dataIndex || f.name,
                    name: f.dataIndex || f.name,
                    boxLabel: f.fieldLabel || f.caption,
                    checked: true
                });
            }
            else if (!f.hidden && f.shownInInsertView && f.allowDuplicateValue!==false){
                items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex || f.name,
                    name: f.dataIndex || f.name,
                    boxLabel: f.fieldLabel || f.caption,
                    checked: !f.noDuplicateByDefault
                });
            }
        }, this);

        return items;
    },

    duplicate: function(){
        var toAdd = [];
        var selected = this.targetGrid.getSelectionModel().getSelection();

        for (var i=0;i<this.down('#newRecs').getValue();i++){
            Ext4.each(selected, function(rec){
                var data = {};
                this.down('form').getForm().getFields().each(function(f){
                    if (f.checked){
                        data[f.dataIndex] = Ext4.clone(rec.get(f.dataIndex));
                    }
                }, this);

                toAdd.push(this.targetGrid.store.createModel(data));
            }, this);
        }

        if (toAdd.length){
            //NOTE: when duplicating records, always insert after the highest selected row
            var insertIdx = -1;
            var selected = this.targetGrid.getSelectionModel().getSelection();
            Ext4.Array.forEach(selected, function(r){
                var idx = r.store.indexOf(r);
                if (idx > insertIdx)
                    insertIdx = idx;
            }, this);

            insertIdx++;

            var choose = this.down('#doBulkEdit').getValue();
            if (choose){
                Ext4.create('EHR.window.BulkEditWindow', {
                    suppressConfirmMsg: true,
                    records: toAdd,
                    targetStore: this.targetGrid.store,
                    formConfig: this.targetGrid.formConfig,
                    insertIndex: insertIdx
                }).show();
                this.close();
            }
            else {
                this.targetGrid.store.insert(insertIdx, toAdd);
            }
        }
    }
});

EHR.DataEntryUtils.registerGridButton('DUPLICATE', function(config){
    return Ext4.Object.merge({
        text: 'Duplicate Selected',
        tooltip: 'Click to duplicate selected rows',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selected = grid.getSelectionModel().getSelection();
            if (!selected || !selected.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.RecordDuplicatorWindow', {
                targetGrid: grid
            }).show();
        }
    }, config);
});