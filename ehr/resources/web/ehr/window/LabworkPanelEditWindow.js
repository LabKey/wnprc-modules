/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg resultRecord
 */
Ext4.define('EHR.window.LabworkPanelEditWindow', {
    extend: 'Ext.window.Window',

    fieldMap: {
        Biochemistry: [{
            xtype: 'displayfield',
            dataIndex: 'testid'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'remark'
        }],
        Hematology: [{
            xtype: 'displayfield',
            dataIndex: 'testid'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'remark'
        }],
        Microbiology: [{
            dataIndex: 'tissue'
        },{
            dataIndex: 'organism'
        },{
            dataIndex: 'quantity'
        },{
            dataIndex: 'remark'
        }],
        'Antibiotic Sensitivity': [{
            dataIndex: 'tissue'
        },{
            dataIndex: 'microbe'
        },{
            dataIndex: 'antibiotic'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'remark'
        }],
        Parasitology: [{
            dataIndex: 'sampletype'
        },{
            dataIndex: 'organism'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'units'
        },{
            dataIndex: 'quantity'
        },{
            dataIndex: 'remark'
        }],
        'Serology/Virology': [{
            dataIndex: 'tissue'
        },{
            dataIndex: 'agent'
        },{
            dataIndex: 'method'
        },{
            dataIndex: 'qualresult'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'units'
        }],
        Urinalysis: [{
            xtype: 'displayfield',
            dataIndex: 'testid'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'remark'
        }],
        'Misc Tests': [{
            xtype: 'displayfield',
            dataIndex: 'testid'
        },{
            dataIndex: 'result'
        },{
            dataIndex: 'remark'
        }]
    },

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            //width: 500,
            defaults: {
                border: false
            },
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This helper allows you to enter the results for one panel worth of data at a time.  It expects you to have already created the result rows, which is most easily done using the \'Copy From Above\' button.',
                maxWidth: 600,
                style: 'padding-bottom: 10px;'
            },{
                itemId: 'runArea',
                xtype: 'form',
                items: [{
                    html: 'Loading...',
                    border: false
                }]
            }],
            buttons: [{
                text: 'Submit And Close',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Submit And Next',
                scope: this,
                handler: this.onSubmitAndNext
            },{
                text: 'Add Result',
                scope: this,
                handler: this.addResult
            },{
                text: 'Cancel',
                handler: function(btn){
                    var win = btn.up('window');
                    if (win.down('form').isDirty()){
                        Ext4.Msg.confirm('Close', 'Closing this window will lose any changes.  Continue?', function(val){
                            if (val == 'yes'){
                                win.close();
                            }
                        }, this);
                    }
                    else {
                        win.close();
                    }
                }
            }]
        });

        this.callParent(arguments);
        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        LDK.Assert.assertNotEmpty('resultRecord has no runid', this.resultRecord.get('runid'));
        this.bindRun(this.resultRecord);
    },

    onPanelLoad: function(panelMap){
        var target = this.down('#runArea');

        target.removeAll();
        target.add(this.getItemsCfg(this.resultRecord.get('runid'), panelMap));
        this.center();

    },

    getPanelForService: function(runId, callback){
        var clinpathRunRec = this.getClinpathRunRec(runId);
        LDK.Assert.assertNotEmpty('Unable to find clinpathRun record', clinpathRunRec);
        if (!clinpathRunRec){
            Ext4.Msg.alert('Error', 'There was an error finding the panel associated with this record.  Please contact your administrator if you think this is an error.');
            return;
        }

        this.cachedPanels = this.cachedPanels || {};

        var service = clinpathRunRec.get('servicerequested');
        if (this.cachedPanels[service]){
            return callback.call(this, this.cachedPanels[service]);
        }

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'ehr_lookups',
            queryName: 'labwork_panels',
            filterArray: [LABKEY.Filter.create('servicename', service, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                if (results && results.rows && results.rows.length){
                    this.cachedPanels[service] = {};
                    Ext4.Array.forEach(results.rows, function(row){
                        row = new LDK.SelectRowsRow(row);
                        this.cachedPanels[service][row.getValue('testname')] = row.getValue('sortorder');
                    }, this);
                }
                else {
                    this.cachedPanels[service] = {};
                }

                callback.call(this, this.cachedPanels[service]);
            }
        });
    },

    bindNextRun: function(currentRecord){
        var store = this.targetGrid.store;
        var recIdx = store.indexOf(currentRecord);
        recIdx++;

        if (recIdx >= store.getCount()){
            console.log('at end: ' + recIdx);
            return false;
        }

        var currentRunId = currentRecord.get('runid');
        var nextRec;
        while (recIdx < store.getCount()){
            if (store.getAt(recIdx).get('runid') !== currentRunId){
                nextRec = store.getAt(recIdx);
                break;
            }

            recIdx++;
        }

        if (nextRec){
            this.targetGrid.getSelectionModel().select([nextRec]);
            this.bindRun(nextRec);
            return true;
        }

        console.log('not found');
        return false;
    },

    bindRun: function(resultRecord){
        this.resultRecord = resultRecord;

        this.getPanelForService(resultRecord.get('runid'), this.onPanelLoad);
    },

    getClinpathRunRec: function(runId){
        var store = this.targetGrid.store.storeCollection.getClientStoreByName('Clinpath Runs');
        LDK.Assert.assertNotEmpty('Unable to find Clinpath Runs store', store);

        var recIdx = store.findExact('objectid', runId);
        LDK.Assert.assertTrue('Unable to find Clinpath Runs rec with objectid: ' + runId, recIdx != -1);

        if (recIdx != -1)
            return store.getAt(recIdx);
    },

    getItemsCfg: function(runId, panelMap){
        var clinpathRunRec = this.getClinpathRunRec(runId);
        if (!clinpathRunRec){
            return [{
                html: 'There was an error finding the panel associated with this record.  Please contact your administrator if you think this is an error.'
            }];
        }

        var tissue = clinpathRunRec.get('tissue');
        if (tissue){
            var recIdx = this.snomedStore.findExact('code', tissue);
            var snomedRec = recIdx != -1 ? this.snomedStore.getAt(recIdx) : null;
            if (snomedRec  && snomedRec .get('meaning')){
                tissue = snomedRec .get('meaning') + ' (' + tissue + ')';
            }
        }

        var items = [{
            xtype: 'container',
            defaults: {
                border: false
            },
            items: [{
                xtype: 'displayfield',
                fieldLabel: 'Id',
                value: clinpathRunRec.get('Id')
            },{
                xtype: 'displayfield',
                fieldLabel: 'Date',
                value: clinpathRunRec.get('date') ? clinpathRunRec.get('date').format('Y-m-d') : null
            },{
                xtype: 'displayfield',
                fieldLabel: 'Service/Panel',
                value: clinpathRunRec.get('servicerequested')
            },{
                xtype: 'displayfield',
                fieldLabel: 'Tissue',
                value: tissue
            },{
                xtype: 'displayfield',
                fieldLabel: 'Panel Remark',
                value: clinpathRunRec.get('remark')
            }]
        }];

        var fieldConfigs = this.fieldMap[this.targetGrid.formConfig.label];
        LDK.Assert.assertNotEmpty('Unknown table in LabworkPanelEditWindow.js: ' + this.targetGrid.formConfig.label, fieldConfigs);

        this.records = [];
        this.targetGrid.store.each(function(rec){
            if (rec.get('runid') != runId){
                return;
            }

            this.records.push(rec);
        }, this);

        //sort records by panel sort
        if (this.targetGrid.store.getFields().get('testid')){
            var resultField = 'testid';
            this.records = this.records.sort(function(a, b){
                console.log(resultField);
                var a1 = panelMap[a.get(resultField)] ? panelMap[a.get(resultField)] : 999;
                var b1 = panelMap[b.get(resultField)] ? panelMap[b.get(resultField)] : 999;

                return a1 > b1 ? 1 :
                        a1 < b1 ? -1 : 0;
            });
        }

        var tableItems = [];
        Ext4.Array.forEach(fieldConfigs, function(fieldObj){
            var fieldName = fieldObj.dataIndex;
            var meta = this.targetGrid.store.getFields().get(fieldName);

            tableItems.push({
                xtype: 'displayfield',
                value: (meta.fieldLabel || meta.header || meta.label)
            });
        }, this);

        Ext4.Array.forEach(this.records, function(rec){
            tableItems = tableItems.concat(this.getRowForRecord(rec))
        }, this);

        items.push({
            itemId: 'theTable',
            border: false,
            layout: {
                type: 'table',
                columns: fieldConfigs.length
            },
            defaults: {
                border: false,
                style: 'margin-right: 5px;'
            },
            items: tableItems
        });

        return items;
    },

    getRowForRecord: function(rec){
        var ret = [];
        var fieldConfigs = this.fieldMap[this.targetGrid.formConfig.label];
        Ext4.Array.forEach(fieldConfigs, function(fieldObj){
            var fieldName = fieldObj.dataIndex;
            var meta = this.targetGrid.store.getFields().get(fieldName);
            var fieldCfg = EHR.model.DefaultClientModel.getFieldConfig(meta, this.targetGrid.formConfig.configSources);
            var colCfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(meta, this.targetGrid);
            var editor = EHR.DataEntryUtils.getFormEditorConfig(fieldCfg);

            editor.value = rec.get(fieldName);
            editor.fieldName = fieldName;
            delete editor.width;
            delete editor.height;
            delete editor.fieldLabel;
            editor.width = colCfg.width || 100;

            if (fieldName == 'remark'){
                editor.xtype = 'textfield';
                editor.width = 200;
            }

            //allow setting any additional properties using fieldObj
            editor = Ext4.apply(editor, fieldObj);

            ret.push(editor);
        }, this);

        return ret;
    },

    addResult: function(){
        var runId = this.resultRecord.get('runid');
        var clinpathRunRec = this.getClinpathRunRec(runId);

        var obj = {
            Id: clinpathRunRec.get('Id'),
            date: clinpathRunRec.get('date'),
            runid: runId
        };

        if (this.resultRecord.fields.get('tissue')){
            obj.tissue = clinpathRunRec.get('tissue');
        }
        var rec = this.resultRecord.store.createModel(obj);

        var insertIdx = 0;
        this.resultRecord.store.each(function(r, idx){
            if (r.get('runid') == runId){
                insertIdx = idx;
            }
        }, this);

        this.resultRecord.store.insert(insertIdx + 1, rec);

        var newItems = this.getRowForRecord(rec);
        this.down('#theTable').add(newItems);
    },

    onSubmit: function(){
        this.saveResults();
        this.close();
    },

    saveResults: function(){
        var fieldConfigs = this.fieldMap[this.targetGrid.formConfig.label];
        var fieldMap = {};
        Ext4.Array.forEach(fieldConfigs, function(fieldObj){
            if (fieldObj.xtype != 'displayfield')
                fieldMap[fieldObj.dataIndex] = this.query('field[fieldName=' + fieldObj.dataIndex + ']');
        }, this);

        Ext4.Array.forEach(this.records, function(r, recIdx){
            var obj = {};
            Ext4.Array.forEach(fieldConfigs, function(fieldObj){
                if (fieldMap[fieldObj.dataIndex]){
                    obj[fieldObj.dataIndex] = fieldMap[fieldObj.dataIndex][recIdx].getValue();
                }
            }, this);
console.log(obj);
            r.beginEdit();
            r.set(obj);
            r.endEdit(true);
        }, this);

        this.targetGrid.store.fireEvent('datachanged', this.targetGrid.store);
        this.targetGrid.getView().refresh();
    },

    onSubmitAndNext: function(){
        this.saveResults();

        if (this.bindNextRun(this.resultRecord) === false){
            Ext4.Msg.alert('', 'There are no more panels');
            this.close();
        }
    }
});

EHR.DataEntryUtils.registerGridButton('EDIT_AS_PANEL', function(config){
    return Ext4.Object.merge({
        text: 'Edit As Panel',
        tooltip: 'Click to edit all the results for one panel at once',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selected = grid.getSelectionModel().getSelection();
            if (!selected || selected.length != 1){
                Ext4.Msg.alert('Error', selected.length ? 'Only one record can be selected' : 'Must select a record');
                return;
            }

            LDK.Assert.assertNotEmpty('Unable to find runId for record', selected[0].get('runid'));

            Ext4.create('EHR.window.LabworkPanelEditWindow', {
                targetGrid: grid,
                resultRecord: selected[0]
            }).show();
        }
    }, config);
});