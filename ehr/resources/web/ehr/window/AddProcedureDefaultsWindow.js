/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataEntryPanel
 * @cfg encountersStore
 * @cfg [] targetTabs
 */
Ext4.define('EHR.window.AddProcedureDefaultsWindow', {
    extend: 'Ext.window.Window',
    applyStaffTemplate: false,
    allowAddWeightRecord: false,

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            width: 750,
            closeAction: 'destroy',
            title: ((!this.targetTabs || this.targetTabs.length != 1) ? 'Add Procedure Defaults' : 'Add Procedure Defaults For Section'),
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate expected rows based on the procedures requested above.  A list of the procedures and expected values are below.',
                style: 'margin-bottom: 10px;'
            },{
                itemId: 'services',
                items: [{
                    border: false,
                    html: 'Loading...'
                }]
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                disabled: true,
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        if (!this.targetTabs){
            this.targetTabs = [];
            this.applyStaffTemplate = true;
            this.allowAddWeightRecord = true;
            Ext4.each(this.dataEntryPanel.formConfig.sections, function(s){
                if (this.tableNameMap[s.name]){
                    var item = this.dataEntryPanel.getSectionByName(s.name);
                    LDK.Assert.assertNotEmpty('Unable to find panel: ' + s.name, item);
                    if (item != null)
                        this.targetTabs.push(item);
                }
            }, this);
        }

        this.inferPanels();

        this.callParent();

        this.on('beforeshow', function(){
            if (!this.encountersRecords.length){
                Ext4.Msg.alert('No Records', 'There are no available procedures, nothing to add');
                return false;
            }
        }, this);
    },

    inferPanels: function(){
        this.encountersRecords = this.getEncountersRecords();
        if (!this.encountersRecords.length){
            return;
        }

        var services = {};
        Ext4.Array.forEach(this.encountersRecords, function(r){
            services[r.get('procedureid')] = true;
        }, this);

        this.loadServices(Ext4.Object.getKeys(services));
    },

    getEncountersRecords: function(){
        var records = [];
        this.encountersStore.each(function(r){
            if (r.get('Id') && r.get('date') && r.get('procedureid')){
                records.push(r);
            }
        }, this);

        return records;
    },

    getExistingParentIds: function(){
        var keys = {};
        Ext4.Array.forEach(this.targetTabs, function(tab){
            keys[tab.formConfig.name] = {};
            tab.store.each(function(r){
                if (r.get('parentid'))
                    keys[tab.formConfig.name][r.get('parentid')] = true;
            }, this);
        }, this);

        return keys
    },

    tableNameMap: {
        'Drug Administration': {
            queryName: 'procedure_default_treatments',
            columns: 'procedureid,code,qualifier,route,frequency,volume,vol_units,dosage,dosage_units,concentration,conc_units,amount,amount_units'
        },
        encounter_summaries: {
            queryName: 'procedure_default_comments',
            columns: 'procedureid,comment',
            targetColumns: 'procedureid,remark'
        },
        snomed_tags: {
            queryName: 'procedure_default_codes',
            columns: 'procedureid,code,qualifier',
            sort: 'sort_order'
        }
    },

    loadServices: function(){
        var multi = new LABKEY.MultiRequest();
        var totalRequests = 0;
        this.panelMap = {};
        Ext4.Array.forEach(this.targetTabs, function(tab){
            var cfg = this.tableNameMap[tab.formConfig.name];
            if (cfg){
                totalRequests++;
                multi.add(LABKEY.Query.selectRows, {
                    schemaName: 'ehr_lookups',
                    queryName: cfg.queryName,
                    requiredVersion: 9.1,
                    columns: cfg.columns,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function(results){
                        this.panelMap[tab.formConfig.name] = {};
                        if (results && results.rows && results.rows.length){
                            Ext4.Array.forEach(results.rows, function(r){
                                var row = new LDK.SelectRowsRow(r);
                                if (!this.panelMap[tab.formConfig.name][row.getValue('procedureid')])
                                    this.panelMap[tab.formConfig.name][row.getValue('procedureid')] = [];

                                this.panelMap[tab.formConfig.name][row.getValue('procedureid')].push(row);
                            }, this);
                        }
                    },
                    scope: this
                });
            }
        }, this);

        LDK.Assert.assertTrue('No matching tables found in AddProcedureDefaultsWindow', totalRequests > 0);

        if (totalRequests > 0)
            multi.send(this.onLoad, this);
        else {
            //this should never actually get called
            this.on('beforeshow', function(window){
                Ext4.Msg.alert('No Records', 'Add defaults is not supported for this section.');
                return false;
            }, this);
        }
    },

    onLoad: function(){
        var toAdd= [{
            html: '<b>Id</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Choose Template</b>'
        },{
            html: '<b>Ignore</b>'
        }];

        var keys = this.getExistingParentIds();
        Ext4.Array.forEach(this.encountersRecords, function(r){
            toAdd.push({
                html: r.get('Id'),
                width: 60
            });
            toAdd.push({
                html: r.get('date').format('Y-m-d'),
                width: 110
            });

            var ignoreId = 'ignore_' + Ext4.id();
            toAdd.push({
                xtype: 'labkey-combo',
                anyMatch: true,
                width: 250,
                boundRecord: r,
                ignoreCheckbox: ignoreId,
                displayField: 'name',
                valueField: 'rowid',
                forceSelection: true,
                queryMode: 'local',
                value: r.get('procedureid'),
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'procedures',
                    columns: 'name,rowid',
                    autoLoad: true
                }
            });
            toAdd.push({
                xtype: 'checkbox',
                width: 80,
                itemId: ignoreId,
                checked: this.targetTabs.length == 1 ? keys[this.targetTabs[0].formConfig.name][r.get('objectid')] : false
            });
        }, this);

        var target = this.down('#services');

        target.removeAll();
        target.add({
            border: false,
            itemId: 'fieldPanel',
            layout: {
                type: 'table',
                columns: 4
            },
            defaults: {
                border: false,
                height: '15px',
                style: 'padding: 2px;margin-right: 4px;vertical-align:text-top;'
            },
            items: toAdd
        });

        if (this.allowAddWeightRecord){
            this.add({
                xtype: 'checkbox',
                fieldLabel: 'Add Weight Record',
                itemId: 'addWeightRecord',
                checked: true
            });
        }

        this.down('#submitBtn').setDisabled(false);
    },

    onSubmit: function(){
        var hasRecords = false;
        var distinctIds = [];
        var parentIdMap = {};

        this.down('#fieldPanel').items.each(function(item){
            if (item.boundRecord){
                var ignoreCheckbox = this.down('#' + item.ignoreCheckbox);
                if (ignoreCheckbox.getValue()){
                    return;
                }

                distinctIds.push(item.boundRecord.get('Id'));
                parentIdMap[item.boundRecord.get('Id')] = parentIdMap[item.boundRecord.get('Id')] || [];
                parentIdMap[item.boundRecord.get('Id')].push(item.boundRecord.get('objectid'));

                var panel = item.getValue();
                Ext4.Array.forEach(this.targetTabs, function(targetTab){
                    var rows;
                    var records = [];

                    if (panel && this.panelMap[targetTab.formConfig.name] && this.panelMap[targetTab.formConfig.name][panel]){
                        rows = this.panelMap[targetTab.formConfig.name][panel];
                    }

                    if (rows && rows.length){
                        Ext4.Array.forEach(rows, function(row){
                            var data = {
                                Id: item.boundRecord.get('Id'),
                                date: item.boundRecord.get('date'),
                                project: item.boundRecord.get('project'),
                                encounterid: item.boundRecord.get('objectid'),
                                parentid: item.boundRecord.get('objectid')
                            };

                            var cfg = this.tableNameMap[targetTab.formConfig.name];
                            if (cfg && cfg.columns){
                                var columns = cfg.columns.split(',');
                                var targetColumns = (cfg.targetColumns || cfg.columns).split(',');
                                Ext4.Array.forEach(columns, function(col, idx){
                                    if (!Ext4.isEmpty(row.getValue(col))){
                                        data[targetColumns[idx]] = row.getValue(col);
                                    }
                                }, this);
                            }

                            records.push(targetTab.store.createModel(data));
                        }, this);

                        if (records.length){
                            targetTab.store.add(records);
                            hasRecords = true;
                        }
                    }
                }, this);
            }
        }, this);

        //add weight
        distinctIds = Ext4.unique(distinctIds);
        if (this.allowAddWeightRecord && this.down('#addWeightRecord').getValue()){
            var weightStore = this.dataEntryPanel.storeCollection.getClientStoreByName('weight');
            LDK.Assert.assertNotEmpty('Unable to find weight store in AddProcedureDefaultsWindow', weightStore);
            var toAdd = [];
            Ext4.Array.forEach(distinctIds, function(id){
                //arbitrarily assign parentid based on the first matching procedure, in the case of multiple procedures
                toAdd.push(weightStore.createModel({
                    Id: id,
                    parentid: parentIdMap[id][0]
                }));
            }, this);

            if (toAdd.length){
                weightStore.add(toAdd);
            }
        }

        //add templates
        if (this.applyStaffTemplate){
            var majorSurg = [];
            var minorSurg = [];
            var procedureStore = EHR.DataEntryUtils.getProceduresStore();
            Ext4.Array.forEach(this.encountersRecords, function(r){
                if (r.get('procedureid')){
                    var obj = {
                        Id: r.get('Id'),
                        date: r.get('date'),
                        parentid: r.get('objectid')
                    }

                    var recIdx = procedureStore.findExact('rowid', r.get('procedureid'));
                    LDK.Assert.assertTrue('Unable to find procedure with rowid: ' + r.get('procedureid'), recIdx > -1);
                    if (recIdx > -1){
                        var procRec = procedureStore.getAt(recIdx);

                        if (procRec.get('major')){
                            majorSurg.push(obj);
                        }
                        else {
                            minorSurg.push(obj);
                        }
                    }
                }
            }, this);

            this.minorSurgToLoad = minorSurg;
            this.majorSurgToLoad = majorSurg;

            if (minorSurg.length || majorSurg.length){
                this.loadTemplateIds();
            }
            else {
                this.finalize(true);
            }
        }
        else {
            this.finalize(hasRecords);
        }
    },

    loadTemplateIds: function(){
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplates',
            requiredVersion: 9.1,
            scope: this,
            filterArray: [
                LABKEY.Filter.create('title', 'Major Surgery;Minor Surgery', LABKEY.Filter.Types.EQUALS_ONE_OF),
                LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('formtype', 'encounter_participants', LABKEY.Filter.Types.EQUAL)

            ],
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                if (results && results.rows && results.rows.length){
                    Ext4.Array.forEach(results.rows, function(r){
                        var row = new LDK.SelectRowsRow(r);
                        if (row.getValue('title') == 'Major Surgery'){
                            this.majorSurgTemplateId = row.getValue('entityid');
                        }
                        else if (row.getValue('title') == 'Minor Surgery'){
                            this.minorSurgTemplateId = row.getValue('entityid');
                        }
                    }, this);

                    LDK.Assert.assertEquality('Wrong row count found in AddProcedureDefaultsWindow', 2, results.rows.length);
                }

                LDK.Assert.assertNotEmpty('Unable to find template for Major Surgery', this.majorSurgTemplateId);
                LDK.Assert.assertNotEmpty('Unable to find template for Minor Surgery', this.minorSurgTemplateId);

                this.loadMinorSurg();
            }
        })
    },

    loadMinorSurg: function(){
        if (this.minorSurgToLoad && this.minorSurgToLoad.length){
            EHR.window.ApplyTemplateWindow.loadTemplateRecords(this.afterLoadMinorSurgTemplate, this, this.dataEntryPanel.storeCollection, this.minorSurgTemplateId, this.minorSurgToLoad);
        }
        else {
            this.afterLoadMinorSurgTemplate();
        }
    },

    queueTemplateRecords: function(recMap){
        if (!recMap)
            return;

        this.templateRecordsToAdd = this.templateRecordsToAdd || {};
        for (var i in recMap){
            this.templateRecordsToAdd[i] = this.templateRecordsToAdd[i] || [];
            this.templateRecordsToAdd[i] = this.templateRecordsToAdd[i].concat(recMap[i]);
        }
    },

    addQueuedTemplateRecords: function(){
        if (!this.templateRecordsToAdd)
            return;

        for (var i in this.templateRecordsToAdd){
            var store = Ext4.StoreMgr.get(i);
            store.add(this.templateRecordsToAdd[i]);
            delete this.templateRecordsToAdd[i];
        }
    },

    afterLoadMinorSurgTemplate: function(recMap){
        delete this.minorSurgToLoad;

        this.queueTemplateRecords(recMap);

        if (!this.majorSurgToLoad || !this.majorSurgToLoad.length){
            this.afterLoadMajorSurgTemplate();
        }
        else {
            EHR.window.ApplyTemplateWindow.loadTemplateRecords(this.afterLoadMajorSurgTemplate, this, this.dataEntryPanel.storeCollection, this.majorSurgTemplateId, this.majorSurgToLoad);
        }
    },

    afterLoadMajorSurgTemplate: function(recMap){
        delete this.majorSurgToLoad;
        this.queueTemplateRecords(recMap);

        this.finalize(true);
    },

    finalize: function(hasRecords){
        this.close();
        this.addQueuedTemplateRecords();

        if (!this.applyStaffTemplate && !hasRecords){
            Ext4.Msg.alert('No Records', 'There are no records to add');
        }
    }
});

EHR.DataEntryUtils.registerGridButton('ADDPROCEDUREDEFAULTS', function(config){
    return Ext4.Object.merge({
        text: 'Add Procedure Defaults',
        xtype: 'button',
        tooltip: 'Click to copy records from the encounters section',
        handler: function(btn){
            var grid = btn.up('grid');
            LDK.Assert.assertNotEmpty('Unable to find grid in ADDPROCEDUREDEFAULTS button', grid);

            var panel = grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in ADDPROCEDUREDEFAULTS button', panel);

            var store = panel.storeCollection.getClientStoreByName('encounters');
            LDK.Assert.assertNotEmpty('Unable to find encounters store in ADDPROCEDUREDEFAULTS button', store);

            if (store){
                Ext4.create('EHR.window.AddProcedureDefaultsWindow', {
                    dataEntryPanel: panel,
                    targetTabs: [grid],
                    encountersStore: store
                }).show();
            }
        }
    });
});

EHR.DataEntryUtils.registerDataEntryFormButton('APPLYENCOUNTERDEFAULTS', {
    text: 'Add Procedure Defaults',
    xtype: 'button',
    tooltip: 'Click to copy records from the encounters section',
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in APPLYENCOUNTERDEFAULTS button', panel);

        var store = panel.storeCollection.getClientStoreByName('encounters');
        LDK.Assert.assertNotEmpty('Unable to find encounters store in APPLYENCOUNTERDEFAULTS button', store);

        if (store){
            Ext4.create('EHR.window.AddProcedureDefaultsWindow', {
                dataEntryPanel: panel,
                encountersStore: store
            }).show();
        }
    }
});