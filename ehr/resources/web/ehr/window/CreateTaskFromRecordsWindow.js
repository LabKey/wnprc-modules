/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg formType
 * @cfg taskLabel
 */
Ext4.define('EHR.window.CreateTaskFromRecordsWindow', {
    extend: 'Ext.window.Window',

    selectField: 'lsid',
    title: 'Create Task',

    statics: {
        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         */
        createTaskFromRecordHandler: function(dataRegionName, formType, taskLabel){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.CreateTaskFromRecordsWindow', {
                dataRegionName: dataRegionName,
                title: 'Schedule ' + taskLabel + " For Selected Rows",
                formType: formType,
                taskLabel: taskLabel
            }).show();
        }
    },

    initComponent: function(){
        LDK.Assert.assertNotEmpty('Missing formtype in CreateTaskFromRecordsWindow', this.formType);

        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 400,
            items: [{
                xtype: 'form',
                itemId: 'theForm',
                bodyStyle: 'padding: 5px;',
                defaults: {
                    border: false,
                    width: 360
                },
                items: [{
                    html: 'Total Selected: ' + '<br><br>',
                    border: false
                },{
                    xtype: 'radiogroup',
                    itemId: 'type',
                    defaults: {
                        name: 'type',
                        xtype: 'radio'
                    },
                    items: [{
                        boxLabel: 'Create New Task',
                        inputValue: 'createNew',
                        checked: true
                    },{
                        boxLabel: 'Add To Existing Task',
                        inputValue: 'addToExisting'
                    }],
                    listeners: {
                        scope: this,
                        change: function(field, val){
                            var panel = this.down('#taskItems');
                            panel.removeAll();
                            if (val.type == 'createNew'){
                                panel.add(this.getTaskItems());
                            }
                            else {
                                panel.add(this.getAddToExistingItems());
                            }
                        }
                    }
                },{
                    xtype: 'form',
                    itemId: 'taskItems',
                    items: this.getTaskItems(),
                    defaults: {
                        border: false,
                        width: 360
                    }
                }]
            }],
            buttons: this.getButtonCfg()
        });

        this.callParent();

        this.on('render', function(){
            this.setLoading(true);
            this.loadData();
        }, this, {single: true, delay: 100});
    },

    getAddToExistingItems: function(){
        return [{
            xtype: 'labkey-combo',
            itemId: 'taskField',
            fieldLabel: 'Choose Task',
            labelAlign: 'top',
            forceSelection: true,
            displayField: 'title',
            valueField: 'taskid',
            listConfig: {
                innerTpl: ['{rowid}: {title}']
            },
            store: {
                type: 'labkey-store',
                schemaName: 'ehr',
                queryName: 'tasks',
                filterArray: [
                    LABKEY.Filter.create('qcstate/publicData', false, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL)
                ],
                columns: 'taskid,assignedto/DisplayName,title,rowid',
                sort: '-rowid'
            }
        }]
    },

    getTaskItems: function(){
        return [{
            xtype: 'textfield',
            fieldLabel: 'Task Title',
            value: this.taskLabel,
            itemId: 'titleField'
        },{
            xtype: 'xdatetime',
            fieldLabel: 'Date',
            value: new Date(),
            itemId: 'date'
        },{
            xtype: 'combo',
            fieldLabel: 'Assigned To',
            forceSelection: true,
            value: LABKEY.Security.currentUser.id,
            queryMode: 'local',
            store: {
                type: 'labkey-store',
                schemaName: 'core',
                queryName: 'PrincipalsWithoutAdmin',
                columns: 'UserId,DisplayName',
                sort: 'Type,DisplayName',
                autoLoad: true
            },
            displayField: 'DisplayName',
            valueField: 'UserId',
            itemId: 'assignedTo'
        },{
            xtype: 'checkbox',
            fieldLabel: 'View Task After Created?',
            itemId: 'viewAfterCreate',
            checked: true
        }]
    },

    getButtonCfg: function(){
        return [{
            text: 'Submit',
            itemId: 'submitBtn',
            scope: this,
            disabled: true,
            handler: this.onSubmit
        },{
            text: 'Cancel',
            handler: function(btn){
                btn.up('window').close();
            }
        }];
    },

    loadData: function(){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LDK.Assert.assertNotEmpty('Unknown dataregion: ' + this.dataRegionName, dataRegion);

        this.checkedRows = dataRegion.getChecked();

        LABKEY.Query.selectRows({
            method: 'POST',
            requiredVersion: 9.1,
            schemaName: dataRegion.schemaName,
            queryName: dataRegion.queryName,
            sort: 'Id,date',
            columns: 'lsid,Id,date,requestid,taskid,qcstate,qcstate/label,qcstate/metadata/isRequest',
            filterArray: [LABKEY.Filter.create('lsid', this.checkedRows.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            scope: this,
            success: this.onDataLoad,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onDataLoad: function(data){
        if (!data || !data.rows){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'No records found');
            return;
        }

        this.records = [];
        var errors = [];

        //first order these rows based on the source dataregion
        var sortedRows = data.rows;
        var checked = this.checkedRows;
        var pk = this.pkCol;
        sortedRows = sortedRows.sort(function(a, b){
            var rowA = new LDK.SelectRowsRow(a);
            var rowB = new LDK.SelectRowsRow(b);

            var idxA = checked.indexOf(rowA.getValue('lsid'));
            var idxB = checked.indexOf(rowB.getValue('lsid'));
            LDK.Assert.assertTrue('Unable to find row matching: ' + rowA.getValue('lsid'), idxA > -1);
            LDK.Assert.assertTrue('Unable to find row matching: ' + rowB.getValue('lsid'), idxB > -1);

            return idxA > idxB ? 1 : idxA < idxB ? -1 : 0;
        });

        Ext4.Array.forEach(sortedRows, function(json){
            var r = new LDK.SelectRowsRow(json);
            if (r.getValue('taskid')){
                errors.push('One or more records is already part of a task and will be skipped.');
            }
            else if (!r.getValue('qcstate/metadata/isRequest')){
                errors.push('Only requests can be added to tasks.  One or more records was skipped.');
            }
            else {
                this.records.push(r);
            }
        }, this);

        if (errors.length){
            errors = Ext4.Array.unique(errors);
            Ext4.Msg.alert('Error', errors.join('<br>'));
        }

        var form = this.down('#theForm');
        form.remove(0);
        form.insert(0, {
            html: 'Total Selected: ' + this.records.length + '<br><br>',
            border: false
        });

        this.down('#submitBtn').setDisabled(false);
        this.setLoading(false);
    },

    onSubmit: function(){
        var records = this.getRecords();
        if (!records || !records.length)
            return;

        var type = this.down('#type').getValue().type;
        if (type == 'createNew'){
            this.doSaveNew(records);
        }
        else {
            this.doAddToExisting(records);
        }
    },

    doAddToExisting: function(records){
        var taskId = this.down('#taskField').getValue();
        if (!taskId){
            Ext4.Msg.alert('Error', 'Must choose a task');
            return;
        }

        Ext4.Msg.wait('Saving...');

        var toSave = [];
        Ext4.Array.forEach(records, function(r, idx){
            toSave.push(Ext4.apply({
                taskid: taskId,
                formSort: idx
            }, r));
        }, this);

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LABKEY.Query.updateRows({
            method: 'POST',
            schemaName: dataRegion.schemaName,
            queryName: dataRegion.queryName,
            rows: toSave,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onComplete
        });
    },

    doSaveNew: function(records){
        var date = this.down('#date').getValue();
        if(!date){
            Ext4.Msg.alert('Error', 'Must enter a date');
        }

        var assignedTo = this.down('#assignedTo').getValue();
        if(!assignedTo){
            Ext4.Msg.alert('Error', 'Must assign to someone');
        }

        var title = this.down('#titleField').getValue();
        if(!title){
            Ext4.Msg.alert('Error', 'Must enter a title');
        }

        Ext4.Msg.wait('Saving...');

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        var existingRecords = {};
        existingRecords[dataRegion.queryName] = [];

        Ext4.Array.forEach(records, function(r){
            LDK.Assert.assertNotEmpty('Record does not have an LSID', r.lsid);
            existingRecords[dataRegion.queryName].push({lsid: r.lsid, formSort: r.formSort});
        }, this);

        EHR.Utils.createTask({
            initialQCState: 'Scheduled',
            existingRecords: existingRecords,
            taskRecord: {date: date, assignedTo: assignedTo, category: 'task', title: title, formType: this.formType},
            scope: this,
            success: function(response, options, config){
                Ext4.Msg.hide();

                var viewAfterCreate = this.down('#viewAfterCreate').getValue();
                this.close();

                if (viewAfterCreate){
                    window.location = LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {taskid: config.taskId, formType: this.formType});
                }
                else {
                    LABKEY.DataRegions[this.dataRegionName].refresh();
                }
            },
            failure: LDK.Utils.getErrorCallback()
        });
    },

    getRecords: function(){
        var toSave = [];
        Ext4.each(this.records, function(r, idx){
            toSave.push({
                lsid: r.getValue('lsid'),
                formSort: idx
            });
        }, this);

        if (!toSave.length){
            Ext4.Msg.alert('Nothing To Save', 'There are no records to save');
            return null;
        }

        return toSave;
    },

    onComplete: function(){
        Ext4.Msg.hide();
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        dataRegion.selectNone();
        dataRegion.refresh();
        this.close();
    }
});