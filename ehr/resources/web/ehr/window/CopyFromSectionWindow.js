/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg parentStore
 * @cfg sourceLabel
 */
Ext4.define('EHR.window.CopyFromSectionWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.getParentRecords();

        Ext4.applyIf(this, {
            modal: true,
            width: 1000,
            closeAction: 'destroy',
            title: 'Copy From ' + this.sourceLabel,
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate 1 row for each animal from the ' + this.sourceLabel + ' section.  Choose which IDs to add from the list below.',
                style: 'margin-bottom: 10px;'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Bulk Edit Values',
                labelWidth: 150,
                helpPopup: 'If checked, you will be prompted with a screen that lets you bulk edit the records that will be created.  This is often very useful when adding many similar records.',
                itemId: 'chooseValues',
                style: 'margin-bottom: 10px;'
            },{
                itemId: 'animalIds',
                items: this.getInitialItems()
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.parentRecords.length){
                Ext4.Msg.alert('No Records', 'There are no records to copy.  Note: only records with an Id/Date can be copied.');
                return false;
            }
        }, this);
    },

    getParentRecords: function(){
        var records = [];
        this.parentStore.each(function(r){
            if (r.get('Id') && r.get('date')){
                records.push(r);
            }
        }, this);

        this.parentRecords = records;

        return records;
    },

    getExistingIds: function(keyFields){
        var map = {};
        this.targetGrid.store.each(function(r){
            var key = this.getKeyValue(r, keyFields);
            if (r.get('Id'))
                map[key] = true;
        }, this);

        return map;
    },

    getKeyValue: function(record, keyFields){
        var key = [];
        Ext4.Array.forEach(keyFields, function(kf){
            if (record.get(kf))
                key.push(record.get(kf));
        }, this);

        return key.join ('||');
    },

    getInitialItems: function(){
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Project</b>'
        }]

        if (this.targetGrid.store.getFields().get('chargetype'))
        {
            items.push({
                html: '<b>Charge Unit</b>'
            });
        }

        items = items.concat([{
            html: '<b>Performed By</b>'
        },{
            html: '<b>Skip?</b>'
        }]);

        var keys = {}, key;
        var keyFields = ['Id'];
//        if (this.targetGrid.store.getFields().get('parentid')){
//            keyFields.push('parentid');
//        }
//        if (this.targetGrid.store.getFields().get('runid')){
//            keyFields.push('runid');
//        }

        //console.log(keyFields);
        var orderedKeys = [];
        Ext4.Array.forEach(this.parentRecords, function(record){
            key = this.getKeyValue(record, keyFields);
            if (orderedKeys.indexOf(key) == -1){
                orderedKeys.push(key);
            }

            keys[key] = keys[key] || {
                Id: record.get('Id'),
//                parentid: keyFields.indexOf('parentid') > -1 ? record.get('parentid') : null,
//                runid: keyFields.indexOf('runid') > -1 ? record.get('runid') : null,
                performedby: [],
                projects: [],
                chargeUnits: [],
                dates: [],
                total: 0
            };

            keys[key].total++;
            if (record.get('performedby'))
                keys[key].performedby.push(record.get('performedby'));
            if (record.get('project'))
                keys[key].projects.push(record.get('project'));
            if (record.fields.get('chargetype') && record.get('chargetype'))
                keys[key].chargeUnits.push(record.get('chargetype'));
            keys[key].dates.push(record.get('date'))
        }, this);

        var existingIds = this.getExistingIds(keyFields);
        Ext4.Array.forEach(orderedKeys, function(key){
            var o = keys[key];

            items.push({
                xtype: 'displayfield',
                key: key,
                value: o.Id,
                fieldName: 'Id'
            });

            var dates = [];
            var minDate;
            Ext4.Array.forEach(o.dates, function(date){
                if (!minDate || date < minDate)
                    minDate = date;

                dates.push(date.format('Y-m-d H:i'));
            }, this);

            o.performedby = Ext4.unique(o.performedby);
            var performedby = o.performedby.length == 1 ? o.performedby[0] : null;

            o.projects = Ext4.unique(o.projects);
            var project = o.projects.length == 1 ? o.projects[0] : null;

            o.chargeUnits = Ext4.unique(o.chargeUnits);
            var chargeUnit = o.chargeUnits.length == 1 ? o.chargeUnits[0] : null;

            items.push({
                xtype: 'xdatetime',
                width: 300,
                format: 'Y-m-d H:i',
                timeFormat: 'H:i',
                fieldName: 'date',
                key: key,
                value: minDate
            });

            items.push({
                xtype: 'ehr-projectfield',
                matchFieldWidth: false,
                showInactive: true,
                fieldLabel: null,
                width: 100,
                fieldName: 'project',
                key: key,
                value: project
            });

            if (this.targetGrid.store.getFields().get('chargetype')){
                var cfg = LABKEY.ext4.Util.getDefaultEditorConfig(this.targetGrid.store.getFields().get('chargetype'));

                items.push(Ext4.apply(cfg, {
                    matchFieldWidth: false,
                    showInactive: true,
                    fieldLabel: null,
                    width: 160,
                    fieldName: 'chargetype',
                    key: key,
                    value: chargeUnit
                }));
            }

            items.push({
                xtype: 'textfield',
                width: 200,
                fieldName: 'performedby',
                key: key,
                value: performedby
            });

            items.push({
                xtype: 'checkbox',
                key: key,
                fieldName: 'exclude',
                checked: existingIds[key]
            });
        }, this);

        return [{
            itemId: 'theTable',
            border: false,
            layout: {
                type: 'table',
                columns: this.targetGrid.store.getFields().get('chargetype') ? 6 : 5
            },
            defaults: {
                border: false,
                style: 'margin: 5px;'
            },
            items: items
        }]
    },

    getRows: function(){
        var table = this.down('#theTable');
        var orderedKeys = [];
        var rowMap = {};
        table.items.each(function(item){
            if (item.fieldName){
                if (orderedKeys.indexOf(item.key) == -1)
                    orderedKeys.push(item.key);

                rowMap[item.key] = rowMap[item.key] || {};
                rowMap[item.key][item.fieldName] = item.getValue ? item.getValue() : item.value;
            }
        }, this);

        var ret = [];
        Ext4.Array.forEach(orderedKeys, function(key){
            ret.push(rowMap[key]);
        }, this);

        return ret;
    },

    onSubmit: function(btn){
        var toAdd = [];
        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.exclude){
                toAdd.push(this.targetGrid.store.createModel(data));
            }
        }, this);

        if (toAdd.length){
            var choose = this.down('#chooseValues').getValue();
            if (choose){
                Ext4.create('EHR.window.BulkEditWindow', {
                    suppressConfirmMsg: true,
                    records: toAdd,
                    targetStore: this.targetGrid.store,
                    formConfig: this.targetGrid.formConfig
                }).show();
                this.close();
            }
            else {
                this.targetGrid.store.add(toAdd);
            }
        }

        this.close();
    }
});


EHR.DataEntryUtils.registerGridButton('COPYFROMSECTION', function(config){
    return Ext4.Object.merge({
        text: 'Copy From Section',
        xtype: 'button',
        tooltip: 'Click to copy records from one of the other sections',
        listeners: {
            beforerender: function(btn){
                var grid = btn.up('gridpanel');
                LDK.Assert.assertNotEmpty('Unable to find gridpanel in COPYFROMSECTION button', grid);

                btn.grid = grid;

                btn.appendButtons.call(btn);
            }
        },
        menu: {
            xtype: 'menu',
            items: [{
                text: 'Loading...'
            }]
        },
        appendButtons: function(){
            this.dataEntryPanel = this.grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in COPYFROMSECTION button', this.dataEntryPanel);

            var toAdd = [];
            Ext4.Array.forEach(this.dataEntryPanel.formConfig.sections, function(section){
                if (section.name == this.grid.formConfig.name){
                    return;
                }

                var store = this.dataEntryPanel.storeCollection.getClientStoreByName(section.name);
                if (store){
                    //only allow copying from sections with an ID field
                    if (!store.getFields().get('Id')){
                        return;
                    }

                    toAdd.push({
                        text: section.label,
                        scope: this,
                        handler: function(menu){
                            Ext4.create('EHR.window.CopyFromSectionWindow', {
                                targetGrid: this.grid,
                                sourceLabel: section.label,
                                parentStore: store
                            }).show();
                        }
                    });
                }
            }, this);

            this.menu.removeAll();
            if (toAdd.length){
                this.menu.add(toAdd);
            }
            else {
                this.menu.add({
                    text: 'There are no other sections'
                })
            }
        }
    });
});