/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataEntryPanel
 * @cfg defaultDate
 */
Ext4.define('EHR.window.FormTemplateWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.idSelectionMode = this.idSelectionMode || 'multi';

        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 500,
            minHeight: 300,
            bodyStyle: 'padding: 5px;',
            title: 'Apply Template To Form',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            columns: '*',
            filterArray: [
                LABKEY.Filter.create('templateid/category', 'Form')
            ],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onLoad
        });
    },

    getIdSelectionItems: function(){
        if (this.idSelectionMode == 'none' || this.idSelectionMode == 'multi'){
            return {
                xtype: 'container',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'textarea',
                    fieldLabel: 'Id(s)',
                    itemId: 'idField',
                    hidden: this.idSelectionMode == 'none',
                    labelWidth: 150,
                    width: 400,
                    height: 50
                },{
                    xtype: 'xdatetime',
                    itemId: 'dateField',
                    fieldLabel: 'Date',
                    timeFormat: 'H:i',
                    labelWidth: 150,
                    width: 400,
                    value: this.defaultDate
                }]
            };
        }
        else if (this.idSelectionMode == 'encounter'){
            var data = EHR.DataEntryUtils.getEncountersRecords(this.dataEntryPanel);
            var allData = EHR.DataEntryUtils.getEncountersRecords(this.dataEntryPanel, true);

            var value = data.length == 1 ? data[0].parentid : null;
            var comboData = data;
            if (!value && allData.length == 1){
                value = allData[0].parentid;
                comboData = allData;
            }

            return {
                xtype: 'checkcombo',
                labelWidth: 150,
                fieldLabel: 'Choose Procedure(s)',
                itemId: 'encounterRecords',
                addAllSelector: true,
                mutliSelect: true,
                width: 400,
                displayField: 'title',
                valueField: 'parentid',
                value: value,
                hidden: value && comboData.length == 1,
                store: {
                    type: 'store',
                    fields: ['title', 'parentid', 'Id', 'date'],
                    data: comboData
                },
                forceSelection: true
            }
        }
        else {
            console.error('Unknown idSelectionMode: ' + this.idSelectionMode);
        }
    },

    onLoad: function(results){
        this.templateRecordMap = {};
        Ext4.Array.forEach(results.rows, function(row){
            var template = row.templateid;
            if (template){
                if (!this.templateRecordMap[template]){
                    this.templateRecordMap[template] = [];
                }

                this.templateRecordMap[template].push(row);
            }
        }, this);

        this.removeAll();
        this.add(this.getItems());
        this.center();
    },

    getItems: function(){
        var items = [{
            html: 'This helper allows you to apply a set of templates to all sections of this form.  You can pick a form template using the first combo, and/or select templates for each section individually.<br><br>' +
                '<b>NOTE: This will remove all existing records from the affected sections</b>',
            style: 'padding-bottom: 10px;'
        },this.getIdSelectionItems(),{
            xtype: 'labkey-combo',
            fieldLabel: 'Choose Template',
            labelWidth: 150,
            width: 400,
            forceSelection: true,
            valueField: 'entityid',
            displayField: 'title',
            anyMatch: true,
            queryMode: 'local',
            caseSensitive: false,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr',
                queryName: 'my_formtemplates',
                sort: 'title',
                autoLoad: true,
                filterArray: [
                    LABKEY.Filter.create('formtype', this.dataEntryPanel.formConfig.name, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('category', 'Form', LABKEY.Filter.Types.EQUAL)
                ]
            },
            listeners: {
                scope: this,
                change: function(field, val){
                    if(this.templateRecordMap[val]){
                        var combos = this.query('combo[section]');

                        // Clear all combo values first
                        Ext4.Array.forEach(combos, function(combo){
                            combo.setValue(null);
                        });

                        // Set combos based on value from the template, if present
                        Ext4.Array.forEach(this.templateRecordMap[val], function(row){
                            var found = false;
                            Ext4.Array.forEach(combos, function(combo){
                                if (combo.section.name == row.storeid){
                                    combo.setValue(row.targettemplate);
                                    found = true;
                                }
                            }, this);

                            LDK.Assert.assertTrue('Unable to find matching combo for store: ' + row.storeid, found);
                        }, this);
                    }
                }
            }
        },{
            html: 'Sections:',
            style: 'padding-top: 10px;padding-bottom: 10px;'
        }];

        Ext4.Array.forEach(this.dataEntryPanel.formConfig.sections, function(section){
            if (!section.supportsTemplates){
                return;
            }

            items.push({
                xtype: 'combo',
                labelWidth: 150,
                fieldLabel: section.label,
                forceSelection: true,
                width: 400,
                section: section,
                valueField: 'entityid',
                displayField: 'title',
                sort: 'title',
                anyMatch: true,
                emptyText: 'Select an Option',     //Added 2-19-2016 Blasa
                caseSensitive: false,
                //Added 4-22-2015  Blasa
                typeAhead: true,
                queryMode: 'local',
                store: {
                    type: 'labkey-store',
                    autoLoad: true,
                    schemaName: 'ehr',
                    queryName: 'my_formtemplates',
                    sort: 'title',
                    filterArray: [
                        LABKEY.Filter.create('formtype', section.name, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
                    ]
                }
            });
        }, this);

        return items;
    },

    onSubmit: function(btn){
        var records = this.getRecordDefaults();
        if (!records){
            return;
        }

        Ext4.Msg.wait('Loading...');

        var combos = this.query('combo[section]');
        this.pendingTemplates = 0;
        Ext4.Array.forEach(combos, function(combo){
            if (combo.getValue()){
                this.pendingTemplates++;
                EHR.window.ApplyTemplateWindow.loadTemplateRecords(this.afterLoadTemplate, this, this.dataEntryPanel.storeCollection, combo.getValue(), records);
            }
        }, this);

        if (this.pendingTemplates == 0){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'No templates selected');
        }
    },

    getRecordDefaults: function(){
        if (this.idSelectionMode == 'none' || this.idSelectionMode == 'multi'){
            var date = this.down('#dateField').getValue();
            var idField = this.down('#idField');
            var subjectArray = LDK.Utils.splitIds(idField ? idField.getValue() : '');

            if (subjectArray.length == 0){
                subjectArray = [null];
            }

            var ret = [];
            Ext4.Array.forEach(subjectArray, function(id){
                ret.push({
                    Id: id,
                    date: date
                });
            }, this);

            return ret;
        }
        else if (this.idSelectionMode == 'encounter'){
            var combo = this.down('#encounterRecords');
            var encounterIds = combo.getValue() || [];
            if (!encounterIds.length){
                Ext4.Msg.alert('Error', 'Must choose at least one procedure.  If performing a surgery or necropsy, this indicates you may need to enter animals into the top section.');
                return;
            }

            var ret = [];
            Ext4.Array.forEach(encounterIds, function(encounterId){
                var recIdx = combo.store.findExact('parentid', encounterId);
                if (recIdx != -1){
                    var rec = combo.store.getAt(recIdx);
                    ret.push({
                        Id: rec.get('Id'),
                        date: rec.get('date'),
                        parentid: rec.get('parentid')
                    });
                }
            }, this);

            return ret;
        }
    },

    afterLoadTemplate: function(recMap){
        if (recMap && !LABKEY.Utils.isEmptyObj(recMap)){
            for (var i in recMap){
                var store = Ext4.StoreMgr.get(i);

                store.remove(store.getRange());
                store.add(recMap[i]);
            }
        }

        this.pendingTemplates--;
        if (this.pendingTemplates == 0){
            this.close();
            Ext4.Msg.hide();
        }
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('APPLYFORMTEMPLATE', {
    text: 'Apply Form Template',
    tooltip: 'Click to apply a template to all sections of this form',
    itemId: 'formTemplatesBtn',
    scope: this,
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel', panel);

        Ext4.create('EHR.window.FormTemplateWindow', {
            dataEntryPanel: panel,
            idSelectionMode: btn.idSelectionMode,
            defaultDate: btn.defaultDate
        }).show();
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('APPLYFORMTEMPLATE_ENCOUNTER', Ext4.apply({
    idSelectionMode: 'encounter'
}, EHR.DataEntryUtils.getDataEntryFormButton('APPLYFORMTEMPLATE')));

EHR.DataEntryUtils.registerDataEntryFormButton('APPLYFORMTEMPLATE_NO_ID', Ext4.apply({
    idSelectionMode: 'none'
}, EHR.DataEntryUtils.getDataEntryFormButton('APPLYFORMTEMPLATE')));
