/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.CopyTaskWindow', {
    extend: 'Ext.window.Window',
    title: 'Copy Previous Task',
    width: 600,
    noun: 'Task',
    queryName: 'tasks',

    initComponent: function(){
        Ext4.apply(this, {
            modal:true,
            closeAction: 'destroy',
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This helper will copy records from a previous ' + this.noun.toLowerCase() + ' to pre-populate this form.  It will append any new records to each section, keeping any records you may have already added to this form.  You can choose which sections to copy using the checkboxes below.',
                style: 'padding-bottom: 10px;',
                border: false
            },{
                xtype: 'ehr-triggernumberfield',
                fieldLabel: 'Enter ' + this.noun + ' Id',
                width: 400,
                itemId: 'rowIdField',
                labelWidth: 150,
                triggerCls: 'x4-form-search-trigger',
                triggerToolTip: 'Click to lookup the ' + this.noun + ' Id',
                onTriggerClick: this.onTriggerClick,
                minValue: 1
            },{
                xtype: 'xdatetime',
                itemId: 'dateField',
                fieldLabel: 'Date',
                width: 400,
                labelWidth: 150,
                value: new Date()
            },{
                xtype: 'checkboxgroup',
                itemId: 'sectionField',
                labelWidth: 150,
                columns: 1,
                fieldLabel: 'Choose Sections to Copy',
                items: this.getSectionItems()
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

    getSectionItems: function(){
        var ret = [];

        Ext4.Array.forEach(this.dataEntryPanel.formConfig.sections, function(section){
            if (section.supportsTemplates === false){
                return;
            }

            ret.push({
                xtype: 'checkbox',
                checked: true,
                boxLabel: section.label,
                inputValue: section.label,
                sectionCfg: section
            });
        }, this);

        return ret;
    },

    onTriggerClick: function(){
        var win = this.up('window');
        window.open(LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'ehr', 'query.queryName': win.queryName}), '_blank');

//        Ext4.create('Ext.window.Window', {
//            title: 'Lookup ' + this.noun + ' Id',
//            targetField: field,
//            buttons: [{
//                text: 'Submit',
//                handler: function(btn){
//
//                }
//            },{
//                text: 'Cancel',
//                handler: function(btn){
//                    btn.up('window').close();
//                }
//            }]
//        }).show();
    },

    onSubmit: function(){
        var rowIdField = this.down('#rowIdField');
        if (!rowIdField.getValue()){
            Ext4.Msg.alert('Error', 'Must enter a ' + this.noun + ' Id');
            return;
        }

        var cbs = this.query('checkbox[checked]');
        if (!cbs || !cbs.length){
            Ext4.Msg.alert('Error', 'Must select at least one section');
            return;
        }

        var queries = this.getQueries();

        //verify this rowid is valid
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'ehr',
            queryName: this.queryName,
            filterArray: [LABKEY.Filter.create('rowid', rowIdField.getValue())],
            columns: this.noun + 'id,rowid,formType,title,created,createdby/displayName,datecompleted',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                if (!results || !results.rows || !results.rows.length){
                    Ext4.Msg.alert('Error', this.noun + ' Id not found');
                    return;
                }

                var row = new LDK.SelectRowsRow(results.rows[0]);
                if (this.dataEntryPanel.formConfig.name != row.getValue('formType')){
                    Ext4.Msg.alert('Error', 'The form type of the select form does not match this form.  Was: ' + row.getValue('formType'));
                    return;
                }

                Ext4.create('Ext.window.Window', {
                    ownerWindow: this,
                    modal: true,
                    width: 500,
                    title: 'Verify Form',
                    bodyStyle: 'padding: 5px;',
                    items: [{
                        html: 'Below are the details of form ' + rowIdField.getValue() + '.  Do you want to continue?',
                        border: false,
                        style: 'padding-bottom: 10px;'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Title',
                        value: row.getValue('title')
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Created',
                        value: row.getFormattedDateValue('created', 'Y-m-d')
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Created By',
                        value: row.getValue('createdby/displayName')
                    }],
                    buttons: [{
                        text: 'Copy This Form',
                        scope: this,
                        handler: function(btn){
                            var win = btn.up('window');
                            win.close();
                            win.ownerWindow.doSelect(row.getValue(this.noun + 'id'));
                        }
                    },{
                        text: 'Cancel',
                        handler: function(btn){
                            btn.up('window').close();
                        }
                    }]
                }).show();
            }
        })
    },

    getQueries: function(){
        var queries = [];
        var cbs = this.query('checkbox[checked]');
        Ext4.Array.forEach(cbs, function(cb){
            var section = this.dataEntryPanel.getSectionByLabel(cb.sectionCfg.label);
            LDK.Assert.assertNotEmpty('Unable to find section with label: ' + cb.sectionCfg.label, section);

            if (!section.store){
                console.log('No store: ' + cb.sectionCfg.label);
                return;
            }

            Ext4.Array.forEach(section.store.getServerStoreNames(), function(key){
                queries.push(key);
            }, this);
        }, this);
        queries = Ext4.unique(queries);

        return queries;
    },

    doSelect: function(rowId){
        var queries = this.getQueries();

        Ext4.Msg.wait('Loading...');
        var multi = new LABKEY.MultiRequest();
        this.toAddMap = {};
        Ext4.Array.forEach(queries, function(key){
            var storeCollection = this.dataEntryPanel.storeCollection;
            var serverStore = this.dataEntryPanel.storeCollection.getServerStoreByName(key);
            LDK.Assert.assertNotEmpty('Unable to find serverStore for: ' + key, serverStore);

            //TODO: change to something metadata-driven
            var blacklist = ['date', 'enddate', 'parentid', 'requestid', 'taskid', 'runid', 'objectid', 'lsid', 'qcstate'];

            var fields = [];
            multi.add(LABKEY.Query.selectRows, {
                requiredVersion: 9.1,
                schemaName: serverStore.schemaName,
                queryName: serverStore.queryName,
                columns: serverStore.columns,
                scope: this,
                filterArray: [LABKEY.Filter.create(this.noun + 'id', rowId)],
                failure: LDK.Utils.getErrorCallback(),
                success: function(results){
                    if (results && results.rows && results.rows.length){
                        this.toAddMap[serverStore.storeId] = [];

                        var taskId = null;
                        if (storeCollection.getTaskId) {
                            taskId = storeCollection.getTaskId();
                            LDK.Assert.assertNotEmpty('taskId is null in CopyTaskWindow', taskId);
                        }

                        var requestId = null;
                        if (storeCollection.getRequestId) {
                            requestId = storeCollection.getRequestId();
                            LDK.Assert.assertNotEmpty('requestId is null in CopyTaskWindow', requestId);
                        }

                        Ext4.Array.forEach(results.rows, function(r){
                            var row = new LDK.SelectRowsRow(r);
                            var obj = {};
                            obj.date = this.down('#dateField').getValue();
                            obj.objectid = LABKEY.Utils.generateUUID().toUpperCase();
                            if (taskId) {
                                obj.taskid = taskId;
                            }
                            if (requestId) {
                                obj.requestid = requestId;
                            }

                            serverStore.getFields().each(function(field){
                                if (blacklist.indexOf(field.name.toLowerCase()) > -1){
                                    return;
                                }

                                if (!Ext4.isEmpty(row.getValue(field.name)))
                                    obj[field.name] = row.getValue(field.name);
                            }, this);

                            var model = serverStore.addServerModel({});
                            model.set(obj);

                            this.toAddMap[serverStore.storeId].push(model);
                        }, this);
                    }
                }
            });
        }, this);

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        Ext4.Msg.hide();
        if (!Ext4.Object.isEmpty(this.toAddMap)){
            for (var storeId in this.toAddMap){
                var targetStore = this.dataEntryPanel.storeCollection.serverStores.get(storeId);
                LDK.Assert.assertNotEmpty('Unable to find server store: ' + storeId, targetStore);

                targetStore.suspendEvents();
                targetStore.add(this.toAddMap[storeId]);
                targetStore.resumeEvents();
            }

            this.dataEntryPanel.storeCollection.transformServerToClient();
        }
        else {
            Ext4.Msg.alert('No Records', 'There are no records to add');
        }

        this.close();
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('COPY_TASK', {
    text: 'Copy Previous Task',
    name: 'copyFromTask',
    itemId: 'copyFromTask',
    tooltip: 'Click to copy records from a previously created task',
    handler: function(btn){
        var dataEntryPanel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataentrypanel in COPY_TASK', dataEntryPanel);

        Ext4.create('EHR.window.CopyTaskWindow', {
            dataEntryPanel: dataEntryPanel
        }).show();
    }
});

