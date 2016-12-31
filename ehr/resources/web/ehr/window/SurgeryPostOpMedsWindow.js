/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.SurgeryPostOpMedsWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Order Post-Op Meds',
            minWidth: 820,
            bodyStyle: 'padding: 5px;',
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }],
            items: [{
                html: 'Loading...',
                border: false
            }]
        });

        this.callParent(arguments);

        var store = this.getFrequencyStore();
        store.on('load', this.onStoreLoad, this);
    },

    getFrequencyStore: function(){
        if (this.frequencyStore)
            return this.frequencyStore;

        this.frequencyStore = Ext4.create('LABKEY.ext4.data.Store', {
            schemaName: 'ehr_lookups',
            queryName: 'treatment_frequency',
            columns: 'rowid,meaning,times',
            autoLoad: true
        });

        return this.frequencyStore;
    },

    onStoreLoad: function(store){
        var ids = [];
        this.encountersStore.each(function(r, recIdx){
            if (!r.get('Id') || !r.get('procedureid')){
                return;
            }

            ids.push(r.get('Id'));
        });

        ids = Ext4.unique(ids);

        EHR.DataEntryUtils.getWeights(this.targetStore.storeCollection, ids, this.onDemographicsLoad, this, false);
    },

    onDemographicsLoad: function(weightMap){
        this.weightMap = weightMap;
        this.removeAll();
        this.add(this.getItems());
        this.center();
    },

    getItems: function(){
        var numCols = 7;
        var items = [{
            xtype: 'displayfield',
            value: 'Animal Id'
        },{
            xtype: 'displayfield',
            value: 'Procedure'
        },{
            xtype: 'displayfield',
            value: 'Weight'
        },{
            xtype: 'displayfield',
            value: 'Surg. Time'
        },{
            xtype: 'displayfield',
            value: '1st Dose'
        },{
            xtype: 'displayfield',
            value: 'Analgesia'
        },{
            xtype: 'displayfield',
            value: 'Antibiotics'
        }];

        var ids = [];
        this.encountersStore.each(function(r, recIdx){
            if (!r.get('Id') || !r.get('procedureid')){
                return;
            }

            items.push({
                xtype: 'displayfield',
                value: r.get('Id'),
                width: 100,
                recIdx: recIdx
            });

            var procedureRec = this.getProcedureRec(r.get('procedureid'));
            LDK.Assert.assertNotEmpty('Unable to find procedure matching rowid: ' + r.get('procedureid'), procedureRec);
            items.push({
                xtype: 'displayfield',
                width: 200,
                value: procedureRec.get('name'),
                recIdx: recIdx
            });

            if (ids.indexOf(r.get('Id')) > -1){
                items.push({
                    xtype: 'displayfield',
                    value: 'Duplicate Animal',
                    colspan: (numCols - 2)
                });

                return;
            }
            ids.push(r.get('Id'));

            items.push({
                xtype: 'displayfield',
                value: this.weightMap[r.get('Id')] ? this.weightMap[r.get('Id')].weight : '',
                recIdx: recIdx
            });

            if (r.get('date')){
                items.push({
                    xtype: 'displayfield',
                    value: r.get('date').format('H:i'),
                    recIdx: recIdx
                });

                //start meds on either 1200/1600/2000, 3 hours offset form surg time
                var hour = r.get('date').getHours();
                hour += 3;

                //note: if more than 30 mins past the hour, round up
                if (r.get('date').getMinutes() >= 30){
                    hour++;
                }

                if (hour > 16){
                    hour = 20;
                }
                else if (hour > 12){
                    hour = 16;
                }
                else {
                    hour = 12;
                }

                var time = new Date();
                Ext4.Date.clearTime(time);
                time.setHours(hour);

                items.push({
                    xtype: 'timefield',
                    fieldName: 'time',
                    minValue: '8:00',
                    maxValue: '20:00',
                    increment: 240,
                    width: 80,
                    format: 'H:i',
                    value: time,
                    recIdx: recIdx
                });
            }
            else {
                items.push({
                    xtype: 'displayfield',
                    value: 'No Date'
                });

                items.push({
                    xtype: 'displayfield',
                    value: null
                });
            }

            items.push({
                xtype: 'labkey-combo',
                forceSelection: true,
                width: 225,
                valueField: 'entityid',
                displayField: 'title',
                fieldName: 'analgesiaRx',
                encountersRec: r,
                store: this.getTemplateStoreCfg(recIdx, procedureRec, 'analgesiaRx'),
                recIdx: recIdx
            });

            items.push({
                xtype: 'labkey-combo',
                forceSelection: true,
                width: 225,
                valueField: 'entityid',
                displayField: 'title',
                fieldName: 'antibioticRx',
                encountersRec: r,
                store: this.getTemplateStoreCfg(recIdx, procedureRec, 'antibioticRx'),
                recIdx: recIdx
            });
        }, this);

        return {
            border: false,
            style: 'padding-top: 10px',
            defaults: {
                style: 'margin-right: 5px;'
            },
            layout: {
                type: 'table',
                columns: numCols
            },
            items: items
        };
    },

    getTemplateStoreCfg: function(recIdx, procedureRec, fieldName){
        return {
            type: 'labkey-store',
            schemaName: 'ehr',
            queryName: 'my_formtemplates',
            initialTemplate: procedureRec.get(fieldName),
            fieldName: fieldName,
            recIdx: recIdx,
            sort: 'title',
            autoLoad: true,
            filterArray: [
                LABKEY.Filter.create('formtype', 'Treatment Orders', LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
            ],
            listeners: {
                scope: this,
                load: function(store){
                    LDK.Assert.assertTrue('No records found in SurgeryPostOpMeds store', store.getCount() > 0);

                    if (store.initialTemplate){
                        var recIdx = store.findExact('title', store.initialTemplate);
                        if (recIdx != -1){
                            var entityId = store.getAt(recIdx).get('entityid');
                            var combo = this.down('combo[recIdx=' + store.recIdx + '][fieldName=' + store.fieldName + ']');
                            LDK.Assert.assertNotEmpty('Unable to find combo for field: ' + store.fieldName, combo);

                            if (combo){
                                combo.setValue(entityId);
                            }
                        }
                    }
                }
            }
        }
    },

    getProcedureRec: function(procedureId){
        var procedureRecIdx = EHR.DataEntryUtils.getProceduresStore().findExact('rowid', procedureId);
        if (procedureRecIdx != -1){
            return EHR.DataEntryUtils.getProceduresStore().getAt(procedureRecIdx);
        }
    },

    onSubmit: function(){
        var combos = this.query('combo[encountersRec]');
        this.templateMap = {};
        Ext4.Array.forEach(combos, function(combo){
            if (combo.getValue()){
                this.templateMap[combo.getValue()] = this.templateMap[combo.getValue()] || [];
                this.templateMap[combo.getValue()].push(combo.encountersRec);
            }
        }, this);

        if (Ext4.Object.isEmpty(this.templateMap)){
            Ext4.Msg.alert('Error', 'Must choose at least one template');
            return;
        }

        this.hide();
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            filterArray: [LABKEY.Filter.create('templateid', Ext4.Object.getKeys(this.templateMap).join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onTemplateLoad
        });
    },

    getFrequencyRec: function(meaning){
        if (!meaning)
            return null;

        var frequencyIdx = this.getFrequencyStore().findExact('meaning', meaning, 0, false, false, true);
        LDK.Assert.assertTrue('Unable to find frequency for: ' + meaning, frequencyIdx > -1);

        if (frequencyIdx > -1){
            return this.getFrequencyStore().getAt(frequencyIdx);
        }
    },

    onTemplateLoad: function(results){
        if (!results || !results.rows || !results.rows.length){
            this.close();
            Ext4.Msg.alert('', 'No rows found for the selected templates');
            return;
        }

        //build map of values
        var templateRowMap = {};
        Ext4.Array.forEach(results.rows, function(row){
            row = new LDK.SelectRowsRow(row);

            var templateId = row.getValue('templateid');
            templateRowMap[templateId] = templateRowMap[templateId] ||[];

            templateRowMap[templateId].push(row);
        }, this);

        var combos = this.query('combo[encountersRec]');
        var records = [];
        Ext4.Array.forEach(combos, function(combo){
            if (combo.getValue()){
                var encountersRec = combo.encountersRec;
                var timeField = this.query('timefield[recIdx=' + combo.recIdx + ']')[0];

                var toAdd = templateRowMap[combo.getValue()];
                if (toAdd){
                    Ext4.Array.forEach(toAdd, function(templateRow){
                        var json = templateRow.getValue('json');
                        if (json){
                            json = Ext4.decode(json);

                            var date = Ext4.Date.clone(encountersRec.get('date'));
                            date = Ext4.Date.clearTime(date);
                            date.setHours(timeField.getValue().getHours());

                            if (json.offset){
                                var offsetDate = Ext4.Date.add(Ext4.Date.clone(date), Ext4.Date.DAY, json.offset);
                                offsetDate = Ext4.Date.clearTime(offsetDate);
                                offsetDate.setHours(times[0] / 100);
                                date = offsetDate;
                            }

                            //always set start to be the first normal dose after the start time
                            var frequencyRec = this.getFrequencyRec(json.frequency_meaning);
                            var frequency = frequencyRec ?  frequencyRec.get('rowid') : null;
                            if (frequencyRec && frequencyRec.get('times')){
                                var times = frequencyRec.get('times').split(',');
                                date = EHR.DataEntryUtils.getNextDoseTime(date, times);
                            }

                            var enddate = null;
                            if (json.duration){
                                //this is specifically to handle hydro, when administered ~noon
                                if (new String(json.duration).match(/H$/)){
                                    var duration = new String(json.duration);
                                    duration = duration.replace('H', '');
                                    duration = Number(duration);
                                    duration += encountersRec.get('date').getHours();
                                    duration = Math.floor(duration / 24);

                                    enddate = Ext4.Date.clone(encountersRec.get('date'));
                                    endate = Ext4.Date.clearTime(enddate);
                                    enddate = Ext4.Date.add(enddate, Ext4.Date.DAY, duration);
                                }
                                else {
                                    enddate = Ext4.Date.clone(date);
                                    enddate = Ext4.Date.add(enddate, Ext4.Date.DAY, json.duration);
                                }

                                //always assume a full day, so end at the last scheduled time
                                var hour = 23;
                                if (frequencyRec && frequencyRec.get('times')){
                                    var times = frequencyRec.get('times').split(',');
                                    hour = times[times.length - 1];
                                    hour = Math.min(hour / 100);
                                }

                                enddate.setHours(hour);
                            }

                            var obj = {
                                Id: encountersRec.get('Id'),
                                parentid: encountersRec.get('objectid'),
                                project: encountersRec.get('project'),
                                date: date,
                                enddate: enddate,
                                frequency: frequency
                            };

                            Ext4.apply(obj, json);

                            //this isnt great, but hard code amount on hydro and buprenex for now
                            if (obj.code == 'E-77851' || obj.code == 'E-YY792'){
                                var weight = this.weightMap[encountersRec.get('Id')] ? this.weightMap[encountersRec.get('Id')].weight : null;
                                if (weight){
                                    obj.amount_units = 'mg';
                                    obj.vol_units = 'mL';

                                    //hyrdo
                                    if (obj.code == 'E-77851'){
                                        if (weight < 3.0){
                                            obj.amount = 0.5;
                                            obj.volume = 0.25;
                                        }
                                        else if (weight < 10.0){
                                            obj.amount = 1.0;
                                            obj.volume = 0.5;
                                        }
                                        else {
                                            obj.amount = 2.0;
                                            obj.volume = 1.0;
                                        }
                                    }
                                    //buprenex
                                    else if (obj.code == 'E-YY792'){
                                        if (weight < 3.0){
                                            obj.amount = 0.15;
                                            obj.volume = 0.5;
                                        }
                                        else {
                                            obj.amount = 0.3;
                                            obj.volume = 1.0;
                                        }
                                    }
                                }
                            }

                            records.push(this.targetStore.createModel(obj));
                        }
                    }, this);
                }
                else {
                    console.log('Unable to find template: ' + combo.getValue());
                }
            }
        }, this);

        if (records.length){
            this.targetStore.add(records);
        }

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('SURGERYMEDS', function(config){
    config = config || {};

    return Ext4.Object.merge({
        text: 'Order Post-Op Meds',
        itemId: 'postOpBtn',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            LDK.Assert.assertNotEmpty('Unable to find gridpanel in SURGERYMEDS button', grid);

            var encountersStore = grid.store.storeCollection.getClientStoreByName('encounters');
            LDK.Assert.assertNotEmpty('Unable to find encountersStore in SURGERYMEDS button', encountersStore);

            Ext4.create('EHR.window.SurgeryPostOpMedsWindow', {
                targetStore: grid.store,
                encountersStore: encountersStore
            }).show();
        }
    });
});