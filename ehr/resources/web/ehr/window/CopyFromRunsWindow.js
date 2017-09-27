/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg runsStore
 * @cfg dataset
 * @cfg testFieldName
 */
Ext4.define('EHR.window.CopyFromRunsWindow', {
    extend: 'Ext.window.Window',

    testFieldName: 'testid',

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            width: 750,
            closeAction: 'destroy',
            title: 'Copy From Above',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate test expected tests based on the panels requested above.  A list of the services requested and expected panels are below.',
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

        this.inferPanels();

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.runRecords.length){
                Ext4.Msg.alert('No Records', 'There are no panels for '  + this.dataset + ', nothing to add.  Note: the panels must have an Id/date in order to enter results');
                return false;
            }
        }, this);
    },

    inferPanels: function(){
        this.runRecords = this.getRunsRecords();
        if (!this.runRecords.length){
            return;
        }

        var services = {};
        Ext4.Array.forEach(this.runRecords, function(r){
            services[r.get('servicerequested')] = true;
        }, this);

        this.loadServices(Ext4.Object.getKeys(services));
    },

    getRunsRecords: function(){
        var records = [];
        this.runsStore.each(function(r){
            if (r.get('type') == this.dataset && r.get('Id') && r.get('date')){
                records.push(r);
            }
        }, this);

        return records;
    },

    getExistingRunIds: function(){
        var map = {};
        this.targetGrid.store.each(function(r){
            if (r.get('runid')){
                map[r.get('runid')] = true;
            }
        }, this);

        return map;
    },

    loadServices: function(){
        LABKEY.Query.selectRows({
            schemaName: 'ehr_lookups',
            queryName: 'labwork_panels',
            requiredVersion: 9.1,
            columns: '*',
            sort: 'servicename,sortorder',
            filterArray: [LABKEY.Filter.create('servicename/dataset', this.dataset, LABKEY.Filter.Types.EQUAL)],
            failure: LDK.Utils.getErrorCallback(),
            success: this.onLoad,
            scope: this
        });
    },

    onLoad: function(results){
        if (this.isDestroyed){
            return;
        }

        this.panelMap = {};
        if (results && results.rows && results.rows.length){
            Ext4.Array.forEach(results.rows, function(r){
                var row = new LDK.SelectRowsRow(r);
                if (!this.panelMap[row.getValue('servicename')])
                    this.panelMap[row.getValue('servicename')] = [];

                this.panelMap[row.getValue('servicename')].push(row);
            }, this);
        }

        var toAdd= [{
            html: '<b>Id</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Service</b>'
        },{
            html: '<b>Choose Template</b>'
        },{
            html: '<b>Skip?</b>'
        }];

        var existingRunIds = this.getExistingRunIds();
        Ext4.Array.forEach(this.runRecords, function(r){
            toAdd.push({
                html: r.get('Id'),
                width: 60
            });
            toAdd.push({
                html: r.get('date').format('Y-m-d'),
                width: 80
            });
            toAdd.push({
                html: r.get('servicerequested')
            });

            var ignoreId = 'ignore_' + Ext4.id();
            toAdd.push({
                xtype: 'labkey-combo',
                width: 250,
                boundRecord: r,
                ignoreCheckbox: ignoreId,
                displayField: 'servicename',
                valueField: 'servicename',
                forceSelection: true,
                queryMode: 'local',
                value: r.get('servicerequested'),
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'labwork_services',
                    filterArray: [LABKEY.Filter.create('dataset', this.dataset, LABKEY.Filter.Types.EQUAL)],
                    autoLoad: true
                }
            });
            toAdd.push({
                xtype: 'checkbox',
                width: 80,
                itemId: ignoreId,
                checked: existingRunIds[r.get('objectid')]
            });
        }, this);

        var target = this.down('#services');

        target.removeAll();
        target.add({
            border: false,
            itemId: 'fieldPanel',
            layout: {
                type: 'table',
                columns: 5
            },
            defaults: {
                border: false,
                height: '15px',
                style: 'padding: 2px;margin-right: 4px;vertical-align:text-top;'
            },
            items: toAdd
        });

        this.down('#submitBtn').setDisabled(false);
    },

    onSubmit: function(){
        var records = [];
        this.down('#fieldPanel').items.each(function(item){
            if (item.boundRecord){
                var ignoreCheckbox = this.down('#' + item.ignoreCheckbox);
                if (ignoreCheckbox.getValue()){
                    return;
                }

                var panel = item.getValue();
                var rows;
                if (panel && this.panelMap[panel]){
                    rows = this.panelMap[panel];
                }
                else {
                    rows = [null];
                }

                Ext4.Array.forEach(rows, function(row){
                    var data = {
                        Id: item.boundRecord.get('Id'),
                        date: item.boundRecord.get('date'),
                        runid: item.boundRecord.get('objectid')
                    };

                    //set tissue if the result's model and service record have it
                    if (this.targetGrid.store.model.prototype.fields.get('tissue') && item.boundRecord.get('tissue')){
                        data.tissue = item.boundRecord.get('tissue');
                        data.remark = item.boundRecord.get('remark');
                    }

//                    if (this.targetGrid.store.model.prototype.fields.get('qualifier') && item.boundRecord.get('qualifier')){
//                        data.qualifier = item.boundRecord.get('qualifier');
//                    }

                    if (row){
                        if (row.getValue('method')){
                            data.method = row.getValue('method');
                        }

                        if (row.getValue('testname')){
                            data[row.getValue('testfieldname') || 'testid'] = row.getValue('testname');
                        }
                    }

                    records.push(this.targetGrid.store.createModel(data));
                }, this);
            }
        }, this);

        if (records.length){
            this.targetGrid.store.add(records);
            this.close();
        }
        else {
            Ext4.Msg.alert('No Records', 'There are no records to add');
        }
    }
});