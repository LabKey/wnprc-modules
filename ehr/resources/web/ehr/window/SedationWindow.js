/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg parentStore
 * @cfg label
 */
Ext4.define('EHR.window.SedationWindow', {
    extend: 'EHR.window.CopyFromSectionWindow',
    alias: 'widget.ehr-sedationwindow',

    defaultRound: 5,

    initComponent: function(){
        this.getParentRecords();

        Ext4.apply(this, {
            width: 860,
            title: 'Add Sedations',
            items: [{
                html: 'This helper allows you to fill out sedation drugs for each animal in the ' + this.sourceName + ' section.  Choose which IDs and type of sedation to use from the list below.  Note: this will default to the most recent weight for the animal; however, the weight can be adjusted below.',
                style: 'margin-bottom: 10px;'
            },{
                layout: 'hbox',
                style: 'margin-bottom: 10px;',
                items: [{
                    itemId: 'lotField',
                    labelWidth: 120,
                    style: 'margin-right: 10px;',
                    fieldLabel: 'Lot # (optional)',
                    xtype: 'textfield'
                },{
                    itemId: 'globalDose',
                    fieldLabel: 'Reset Dosage',
                    style: 'margin-right: 10px;',
                    width: 180,
                    labelWidth: 120,
                    triggerToolTip: 'If selected, this will change the dose used for all animals and recalculate the amount',
                    xtype: 'ehr-triggernumberfield',
                    triggerCls: 'x4-form-search-trigger',
                    onTriggerClick: function(){
                        var val = this.getValue();
                        if (Ext4.isNumber(val)){
                            var dosageFields = this.up('ehr-sedationwindow').query("numberfield[fieldName='dosage']");
                            Ext4.Array.forEach(dosageFields, function(field){
                                field.setValue(val);
                            }, this);
                        }
                    }
                },{
                    itemId: 'roundField',
                    width: 220,
                    labelWidth: 150,
                    value: this.defaultRound,
                    fieldLabel: 'Round To Nearest',
                    triggerToolTip: 'If selected, this will change rounding used for drug amounts',
                    xtype: 'ehr-triggernumberfield',
                    triggerCls: 'x4-form-search-trigger',
                    onTriggerClick: function(){
                        var val = this.getValue();
                        if (val){
                            var dosageFields = this.up('ehr-sedationwindow').query("numberfield[fieldName='dosage']");
                            Ext4.Array.forEach(dosageFields, function(field){
                                field.fireEvent('change', field, val);
                            }, this);
                        }
                    }
                }]
            },{
                itemId: 'animalIds',
                items: this.getInitialItems()
            }]
        });

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.parentRecords.length){
                Ext4.Msg.alert('No Records', 'There are no records to copy.  Note: only records with an Id/Date can be copied.');
                return false;
            }
        }, this);

        this.getWeights();
    },

    getWeights: function(){
        var ids = {};
        Ext4.Array.forEach(this.parentRecords, function(r){
            ids[r.get('Id')] = true;
        }, this);

        this.animalIds = Ext4.Object.getKeys(ids);

        EHR.DataEntryUtils.getWeights(this.targetGrid.store.storeCollection, this.animalIds, this.onLoad, this, true);
    },

    onLoad: function(weightMap){
        this.weights = weightMap;

        EHR.DemographicsCache.getDemographics(this.animalIds, this.onDemographicsLoad, this, -1);
    },

    onDemographicsLoad: function(ids, animalRecordMap){
        var target = this.down('#animalIds');
        target.removeAll();

        this.animalRecordMap = animalRecordMap;

        var toAdd = this.getFinalItems();
        if (toAdd.length)
            target.add(toAdd);
        else
            target.add({
                html: 'No animals found'
            });
    },

    getInitialItems: function(){
        return [{
            border: false,
            html: 'Loading...'
        }]
    },

    getFinalItems: function(){
        var numCols = 7;
        var items = [{
            html: '<b>Animal</b>'
//        },{
//            html: '' //placeholder for project
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Drug</b>'
        },{
            html: '<b>Weight (kg)</b>'
        },{
            html: '<b>Dosage (mg/kg)</b>'
        },{
            html: '<b>Amount (mg)</b>'
        },{
            html: '<b>Skip?</b>'
        }];

        var keys = {}, key, orderedKeys = [];
        Ext4.Array.forEach(this.parentRecords, function(record){
            key = record.get('Id');
            if (orderedKeys.indexOf(key) == -1)
                orderedKeys.push(key);

            keys[key] = keys[key] || {
                Id: record.get('Id'),
                project: record.get('project'),
                dates: [],
                total: 0
            };

            keys[key].total++;
            keys[key].dates.push(record.get('date'))
        }, this);

        var existingIds = this.getExistingIds(['Id']);
        Ext4.Array.forEach(orderedKeys, function(key){
            var o = keys[key];
            var ar = this.animalRecordMap[key];
            var flags = ar.getActiveFlags();
            var msgs = [];
            if (flags){
                Ext4.Array.forEach(flags, function(f){
                    if ((f['flag/category'] == 'Alert' || f['flag/category'] == 'Flag') && f['flag/value'] && (f['flag/value'].match(/Ketamine/i) || f['flag/value'].match(/Telazol/i))){
                        msgs.push(f['flag/value']);
                    }
                }, this);
            }

            items.push({
                xtype: 'displayfield',
                value: o.Id,
                key: key,
                fieldName: 'Id'
            });

            items.push({
                xtype: 'hidden',
                value: o.project,
                key: key,
                fieldName: 'project'
            });

            var dates = [];
            var minDate;

            Ext4.Array.forEach(o.dates, function(date){
                if (!minDate || date < minDate)
                    minDate = date;

                dates.push(date.format('Y-m-d H:i'));
            }, this);

            items.push({
                xtype: 'xdatetime',
                width: 250,
                format: 'Y-m-d H:i',
                timeFormat: 'H:i',
                fieldName: 'date',
                key: key,
                value: minDate
            });

            items.push({
                xtype: 'combo',
                key: key,
                fieldName: 'code',
                valueField: 'code',
                displayField: 'displayField',
                value: 'E-70590',
                store: {
                    type: 'store',
                    fields: ['code', 'displayField', 'dosage'],
                    data: [
                        {code: 'E-70590', displayField: 'Ketamine', dosage: 10},
                        {code: 'E-YY992', displayField: 'Telazol', dosage: 3},
                        {code: 'none', displayField: 'None', dosage: null}
                    ]
                },
                listeners: {
                    select: function(field, recs){
                        if (!recs || recs.length != 1)
                            return;

                        var round = field.up('ehr-sedationwindow').down('#roundField').getValue();
                        var dose = recs[0].get('dosage');
                        var weightField = field.up('panel').down("field[key='" + field.key + "][fieldName='weight']");
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        var amountField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='amount']");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow', dosageField);

                        var amount = weightField.getValue() ? Ext4.util.Format.round(weightField.getValue() * dose, 1) : null;

                        dosageField.setValue(dose);

                        amountField.suspendEvents();
                        amountField.setValue(EHR.Utils.roundToNearest(amount, round));
                        amountField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'ldk-numberfield',
                hideTrigger: true,
                decimalPrecision: 3,
                width: 70,
                fieldName: 'weight',
                key: key,
                value: this.weights[o.Id] ? this.weights[o.Id].weight: null,
                listeners: {
                    scope: this,
                    change: function(field, val){
                        var round = field.up('ehr-sedationwindow').down('#roundField').getValue();
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        var amountField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='amount']");
                        var weightField = field;
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow after weight change', dosageField);

                        var amount = weightField.getValue() ? Ext4.util.Format.round(weightField.getValue() * dosageField.getValue(), 1) : null;

                        amountField.suspendEvents();
                        amountField.setValue(EHR.Utils.roundToNearest(amount, round));
                        amountField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'ldk-numberfield',
                hideTrigger: true,
                fieldName: 'dosage',
                decimalPrecision: 3,
                width: 80,
                key: key,
                value: 10,
                listeners: {
                    scope: this,
                    change: function(field, val){
                        var round = field.up('ehr-sedationwindow').down('#roundField').getValue();
                        var dosageField = field;
                        var weightField = field.up('panel').down("field[key='" + field.key + "][fieldName='weight']");
                        var amountField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='amount']");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow after dose change', dosageField);

                        var amount = weightField.getValue() ? Ext4.util.Format.round(weightField.getValue() * dosageField.getValue(), 1) : null;

                        amountField.suspendEvents();
                        amountField.setValue(EHR.Utils.roundToNearest(amount, round));
                        amountField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'ldk-numberfield',
                hideTrigger: true,
                fieldName: 'amount',
                decimalPrecision: 3,
                width: 80,
                key: key,
                value: (this.weights[o.Id] && this.weights[o.Id].weight) ? EHR.Utils.roundToNearest(this.weights[o.Id].weight * 10, this.defaultRound) : null,
                listeners: {
                    change: function(field, value){
                        var round = field.up('ehr-sedationwindow').down('#roundField').getValue();
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow', dosageField);

                        dosageField.suspendEvents();
                        dosageField.setValue(null);
                        dosageField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'checkbox',
                fieldName: 'exclude',
                key: key,
                checked: existingIds[key]
            });

            items.push({
                colspan: numCols,
                bodyStyle: 'padding-bottom: 5px;',
                html: (msgs.length ? '<span style="background-color: yellow">**' + msgs.join('<br>**') + '</span>' : '')
            });
        }, this);

        return [{
            border: false,
            itemId: 'theTable',
            layout: {
                type: 'table',
                columns: numCols
            },
            defaults: {
                border: false,
                style: 'margin-left: 5px;margin-right: 5px;'
            },
            items: items
        }];
    },

    onSubmit: function(btn){
        var toAdd = [];
        var lot = this.down('#lotField').getValue();

        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.amount || data.exclude)
                return;

            delete data.weight;

            Ext4.apply(data, {
                route: 'IM',
                dosage_units: data.dosage ? 'mg/kg' : null,
                amount_units: 'mg',
                performedby: LABKEY.Security.currentUser.displayName,
                lot: lot
            });

            toAdd.push(this.targetGrid.store.createModel(data));
        }, this);

        this.close();
        if (toAdd.length){
            this.targetGrid.store.add(toAdd);
        }
        else {
            Ext4.Msg.alert('', 'There are no records to add.  If you expected to add sedation records, please look at the \'Skip\' checkbox on the right.');
        }
    }
});

EHR.DataEntryUtils.registerGridButton('SEDATIONHELPER', function(config){
    return Ext4.Object.merge({
        text: 'Add Sedation(s)',
        xtype: 'button',
        tooltip: 'Click to add sedation records based on the animals in another section of this form',
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
                        text: 'Copy Ids From: ' + section.label,
                        scope: this,
                        sourceSection: section,
                        handler: function(btn){
                            var grid = btn.up('grid');
                            LDK.Assert.assertNotEmpty('Unable to find grid in SEDATIONHELPER button', grid);

                            var panel = grid.up('ehr-dataentrypanel');
                            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in SEDATIONHELPER button', panel);

                            var store = panel.storeCollection.getClientStoreByName(btn.sourceSection.name);
                            LDK.Assert.assertNotEmpty('Unable to find client store: ' + btn.sourceSection.name + ' in SEDATIONHELPER button', store);

                            if (store){
                                Ext4.create('EHR.window.SedationWindow', {
                                    sourceName: btn.sourceSection.label,
                                    targetGrid: grid,
                                    parentStore: store
                                }).show();
                            }
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
