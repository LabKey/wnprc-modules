/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg formType
 * @cfg datasets An array of dataset names that should have records inserted
 */
Ext4.define('EHR.window.CreateTaskFromIdsWindow', {
    extend: 'Ext.window.Window',

    selectField: 'Id',
    title: 'Schedule Task',

    statics: {
        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         */
        createTaskFromIdsHandler: function(dataRegionName, formType, taskLabel, datasets){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.CreateTaskFromIdsWindow', {
                dataRegionName: dataRegionName,
                title: 'Schedule ' + taskLabel,
                taskLabel: taskLabel,
                formType: formType,
                datasets: datasets
            }).show();
        }
    },

    initComponent: function(){
        LDK.Assert.assertNotEmpty('Missing formtype in CreateTaskFromIdsWindow', this.formType);

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
            scope: this,
            handler: this.onSubmit
        },{
            text: 'Cancel',
            handler: function(btn){
                btn.up('window').close();
            }
        }];
    },

    onSubmit: function(){
        var type = this.down('#type').getValue().type;
        if (type == 'createNew'){
            this.doSaveNew();
        }
        else {
            this.doAddToExisting();
        }
    },

    doAddToExisting: function(){
        var taskId = this.down('#taskField').getValue();
        if(!taskId){
            Ext4.Msg.alert('Error', 'Must choose a task');
        }

        Ext4.Msg.wait('Saving...');
        this.loadData();
    },

    doSaveNew: function(){
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
        this.loadData();
    },

    loadData: function(){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LDK.Assert.assertNotEmpty('Unknown dataregion: ' + this.dataRegionName, dataRegion);

        var processSelections = function(clause) {
            var sql = "SELECT DISTINCT s." + this.selectField + " as field FROM " + dataRegion.schemaName + ".\"" + dataRegion.queryName + "\" s " + clause;

            LABKEY.Query.executeSql({
                method: 'POST',
                schemaName: 'study',
                sql: sql,
                scope: this,
                failure: LDK.Utils.getErrorCallback(),
                success: this.onDataLoad
            });
        }

        LDK.DataRegionUtils.getDataRegionWhereClause(dataRegion, 's', processSelections);
    },

    getTaskRecord: function(){
        var type = this.down('#type').getValue().type;
        if (type == 'createNew'){
            return {
                date: this.down('#date').getValue(),
                assignedTo: this.down('#assignedTo').getValue(),
                title: this.down('#titleField').getValue(),
                category: 'task',
                formType: this.formType
            }
        }
        else {
            return {
                taskId: this.down('#taskField').getValue()
            }
        }
    },

    onDataLoad: function(results){
        if (!results || !results.rows){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'No records found');
            return;
        }

        var doUpdateTask = this.down('#type').getValue().type != 'createNew';

        var taskRecord = this.getTaskRecord();
        if (!taskRecord)
            return;

        var ids = [];
        Ext4.Array.forEach(results.rows, function(r){
            ids.push(r.field);
        }, this);

        var toUpdate = [];
        var date = this.down('#date').getValue();
        Ext4.each(this.datasets, function(q){
            var obj = {
                schemaName: 'study',
                queryName: q,
                rows: []
            };

            Ext4.Array.forEach(ids, function(id){
                obj.rows.push({
                    Id: id,
                    date: date
                });
            }, this);

            toUpdate.push(obj);
        }, this);

        EHR.Utils.createTask({
            initialQCState: 'Scheduled',
            doUpdateTask: doUpdateTask,
            childRecords: toUpdate,
            taskRecord: taskRecord,
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
    }
});