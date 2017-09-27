/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This panel provides the UI that allows the user to apply a saved template to the current form.  It also provides UI to let the user
 * override existing values on this saved template.
 *
 * @cfg targetGrid
 * @cfg formType
 * @cfg defaultTemplate
 * @cfg allowChooseIds
 * @cfg idSelectionMode
 */
Ext4.define('EHR.window.ApplyTemplateWindow', {
    extend: 'Ext.window.Window',
    allowChooseIds: true,
    idSelectionMode: 'multi',
    title: 'Apply Template',
    closeAction: 'destroy',

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            border: true,
            bodyStyle: 'padding:5px',
            defaults: {
                width: 400,
                labelWidth: 130,
                border: false,
                bodyBorder: false
            },
            items: this.getItems(),
            buttons: [{
                text:'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        if (this.idSelectionMode == 'encounter'){
            var dataEntryPanel = this.targetGrid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in ApplyTemplateWindow', dataEntryPanel);

            var data = EHR.DataEntryUtils.getEncountersRecords(dataEntryPanel);
            if (!data.length) {
                this.on('beforeshow', function(){
                    Ext4.Msg.alert('No Records', 'Cannot add results to this section without a corresponding procedure above.  Note: the procedure must have an Id/date in order to enter results');
                    this.close();
                    return false;
                }, this);
            }
        }
    },

    getItems: function(){
        var items = [{
            xtype: 'combo',
            value: this.defaultTemplate,
            forceSelection: true,
            displayField: 'title',
            valueField: 'entityid',
            queryMode: 'local',
            fieldLabel: 'Template Name',
            itemId: 'templateName',
            anyMatch: true,
            caseSensitive: false,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr',
                queryName: 'my_formtemplates',
                sort: 'title',
                autoLoad: true,
                filterArray: [
                    LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
                ]
            }
        },{
            xtype: 'checkbox',
            fieldLabel: 'Bulk Edit Before Applying',
            helpPopup: 'If checked, you will be prompted with a screen that lets you bulk edit the records that will be created.  This is often very useful when adding many similar records.',
            itemId: 'customizeValues',
            checked: false
        },this.getIdSelectionItems(),{
            xtype: 'xdatetime',
            fieldLabel: 'Date (optional)',
            itemId: 'dateField',
            value: null
        }];

        return items;
    },

    getIdSelectionItems: function(){
        if (this.idSelectionMode == 'single'){
            return {
                xtype: 'textfield',
                fieldLabel: 'Animal Id (optional)',
                itemId: 'subjectIds'
            }
        }
        else if (this.idSelectionMode == 'multi'){
            return {
                xtype: 'textarea',
                fieldLabel: 'Animal Ids (optional)',
                helpPopup: 'If provided, this template will be applied once per animal Id.  Otherwise the template will be added once with a blank Id',
                itemId: 'subjectIds'
            }
        }
        else if (this.idSelectionMode == 'none'){
            return {

            }
        }
        else if (this.idSelectionMode == 'encounter'){
            var dataEntryPanel = this.targetGrid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in ApplyTemplateWindow', dataEntryPanel);

            var data = EHR.DataEntryUtils.getEncountersRecords(dataEntryPanel);

            return {
                xtype: 'checkcombo',
                labelWidth: 130,
                fieldLabel: 'Choose Procedure',
                itemId: 'encounterRecords',
                addAllSelector: true,
                mutliSelect: true,
                width: 400,
                displayField: 'title',
                valueField: 'parentid',
                value: data.length == 1 ? data[0].parentid : null,
                store: {
                    type: 'store',
                    fields: ['title', 'parentid', 'Id', 'date'],
                    data: data
                },
                forceSelection: true
            }
        }
        else {
            console.error('Unknown ID selection mode: ' + this.idSelectionMode);
        }
    },

    onSubmit: function(){
        var templateId = this.down('#templateName').getValue();
        if (!templateId){
            Ext4.Msg.alert('Error', 'Must choose a template');
            return;
        }

        this.loadTemplate(templateId);
    },

    statics: {
        loadTemplateRecords: function(callback, scope, storeCollection, templateId, initialValues){
            //subjectArray, date
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplaterecords',
                filterArray: [
                    LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)
                ],
                sort: 'rowid',
                success: function(data){
                    if (!data || !data.rows || !data.rows.length){
                        if (callback){
                            callback.call(scope, {});
                        }

                        return null;
                    }

                    initialValues = initialValues || [];

                    var toAdd = {};
                    if (!initialValues.length){
                        initialValues.push({});
                    }

                    Ext4.Array.forEach(initialValues, function(obj){
                        Ext4.Array.forEach(data.rows, function(row){
                            var data = Ext4.decode(row.json);
                            var store = storeCollection.getClientStoreByName(row.storeid);

                            //verify store exists
                            if (!store){
                                LDK.Utils.logToServer({
                                    level: 'ERROR',
                                    message: 'ApplyTemplateWindow.onLoadTemplate is unable to find store: ' + row.storeid
                                });

                                return;
                            }

                            //also verify it is loaded
                            if (store.loading || !store.getFields() || !store.getFields().getCount()){
                                LDK.Utils.logToServer({
                                    level: 'ERROR',
                                    message: 'ApplyTemplateWindow.onLoadTemplate called prior to store load'
                                });
                            }

                            if (!toAdd[store.storeId])
                                toAdd[store.storeId] = [];

                            var newData = Ext4.apply({}, data);
                            newData = Ext4.apply(newData, obj);

                            toAdd[store.storeId].push(newData);
                        }, this);
                    }, this);

                    var recMap = {};

                    for (var i in toAdd){
                        var store = Ext4.StoreMgr.get(i);
                        var recs = [];
                        Ext4.Array.forEach(toAdd[i], function(data){
                            recs.push(store.createModel(data));
                        }, this);
                        recMap[store.storeId] = recs;
                    }

                    if (callback){
                        callback.call(scope, recMap);
                    }
                },
                failure: LDK.Utils.getErrorCallback(),
                scope: this
            });
        }
    },

    getInitialRecordValues: function(){
        var ret = [];
        var date = this.down('#dateField').getValue();
        var obj = {
            date: date
        };

        if (this.down('#subjectIds')){
            var subjectArray = LDK.Utils.splitIds(this.down('#subjectIds').getValue());
            Ext4.Array.each(subjectArray, function(subj){
                ret.push(Ext4.apply({
                    Id: subj
                }, obj));
            }, this);
        }
        else if (this.down('#encounterRecords')){
            var combo = this.down('#encounterRecords');
            var encounterIds = combo.getValue() || [];
            if (!encounterIds.length){
                Ext4.Msg.alert('Error', 'Must choose at least one procedure');
                return;
            }

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
        }
        else {
            ret.push(obj);
        }

        return ret;
    },

    loadTemplate: function(templateId){
        if (!templateId)
            return;

        var records = this.getInitialRecordValues();
        if (!records){
            return;
        }

        this.hide();
        Ext4.Msg.wait("Loading Template...");

        EHR.window.ApplyTemplateWindow.loadTemplateRecords(this.afterLoadTemplate, this, this.targetGrid.store.storeCollection, templateId, records);
    },

    afterLoadTemplate: function(recMap){
        if (!recMap || LABKEY.Utils.isEmptyObj(recMap)){
            Ext4.Msg.hide();
            this.close();
            return;
        }

        if (this.down('#customizeValues').checked){
            this.customizeData(recMap);
        }
        else {
            this.loadTemplateData(recMap);
        }
    },

    customizeData: function(recMap){
        Ext4.Msg.hide();

        var storeIds = Ext4.Object.getKeys(recMap);
        LDK.Assert.assertEquality('Attempt to customize values on a template with more than 1 store.  The UI should prevent this.', 1, storeIds.length);
        if (storeIds.length != 1){
            Ext4.Msg.alert('Error', 'This type of template cannot be customized');
            this.loadTemplateData(recMap);
            return;
        }

        //create window
        var records = recMap[storeIds[0]];
        Ext4.create('EHR.window.BulkEditWindow', {
            suppressConfirmMsg: true,
            records: records,
            targetStore: this.targetGrid.store,
            formConfig: this.targetGrid.formConfig
        }).show();
        
        this.close();
    },

    addStore: function(storeId, records){
        var store = Ext4.StoreMgr.get(storeId);
        if (!store){
            alert('ERROR: Store not found');
            return;
        }

        var toAdd = {
            xtype: 'form',
            ItemId: 'thePanel',
            storeId: storeId,
            records: records,
            items: []
        };

        store.getFields().each(function(f){
            if (!f.hidden && f.shownInInsertView && f.allowSaveInTemplate !== false && f.allowDuplicate !== false){
                var editor = EHR.DataEntryUtils.getFormEditorConfig(f);
                editor.width= 350;
                if (f.inputType == 'textarea')
                    editor.height = 100;

                var values = [];
                Ext4.Array.forEach(records, function(data){
                    if (data[f.dataIndex]!==undefined){
                        values.push(f.convert(data[f.dataIndex], data));
                    }
                }, this);

                values = Ext4.unique(values);

                if (values.length==1)
                    editor.value=values[0];
                else if (values.length > 1){
                    editor.xtype = 'displayfield';
                    editor.store = null;
                    editor.value = values.join('/');
                }

                toAdd.items.push(editor);
            }
        }, this);

        this.theWindow.down('#theForm').add({
            bodyStyle: 'padding: 5px;',
            title: store.queryName,
            defaults: {
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [{
                html: '<b>'+records.length+' Record'+(records.length==1 ? '' : 's')+' will be added.</b><br>If you enter values below, these will be applied to all new records, overriding any saved values.'
            },
                toAdd
            ]
        });
    },

    loadTemplateData: function(recMap){
        for (var i in recMap){
            var store = Ext4.StoreMgr.get(i);
            store.add(recMap[i]);
        }

        Ext4.Msg.hide();
        this.close();
    },

    onCustomize: function(){
        var toAdd = {};
        this.theWindow.down('#theForm').items.each(function(tab){
            var panel = tab.down('#thePanel');
            var values = panel.getForm().getFieldValues(true);
            toAdd[panel.storeId] = panel.records;
            Ext4.Array.forEach(panel.records, function(r){
                Ext4.apply(r, values);
            }, this);
        }, this);

        this.loadTemplateData(toAdd);
        this.theWindow.close();
    }
});


EHR.DataEntryUtils.registerGridButton('TEMPLATE', function(config){
    config = config || {};

    return Ext4.Object.merge({
        text: 'Templates',
        itemId: 'templatesBtn',
        listeners: {
            beforerender: function(btn){
                var grid = btn.up('gridpanel');
                LDK.Assert.assertNotEmpty('Unable to find gridpanel in TEMPLATE button', grid);

                btn.grid = grid;
                btn.formType = grid.formConfig.name;

                btn.populateFromDatabase.call(btn);
            }
        },
        populateFromDatabase: function(){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'my_formtemplates',
                sort: 'title',
                autoLoad: true,
                filterArray: [
                    LABKEY.Filter.create('formtype', this.grid.formConfig.name, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
                ],
                failure: LDK.Utils.getErrorCallback(),
                scope: this,
                success: this.onLoad
            });
        },
        onLoad: function(results){
            var menuBtn = this.menu.items.get('templatesMenu');
            menuBtn.menu.removeAll();

            var toAdd = [];
            if (results.rows && results.rows.length){
                Ext4.Array.forEach(results.rows, function(row){
                    toAdd.push({
                        text: row.title,
                        templateId: row.entityid,
                        scope: this,
                        handler: function(btn){
                            Ext4.create('EHR.window.ApplyTemplateWindow', {
                                idSelectionMode: menuBtn.idSelectionMode || 'multi',
                                targetGrid: this.grid,
                                formType: this.grid.formConfig.name,
                                defaultTemplate: btn.templateId
                            }).show();
                        }
                    })
                }, this);
            }
            else {
                toAdd.push({
                    text: 'There are no saved templates'
                });
            }

            menuBtn.menu.add(toAdd);
        },
        menu: {
            xtype: 'menu',
            ignoreParentClicks: true,
            items: [{
                text: 'Save As Template',               
                // NOTE: in the java config, we can specify canSaveTemplates.
                // it might make more sense to use this here, which lets specific forms
                // turn this on/off.  similar permissions could be tested server-side
                //hidden: grid.formConfig.canSaveTemplates,
                hidden: !EHR.Security.isTemplateCreator(),
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    Ext4.create('EHR.window.SaveTemplateWindow', {
                        targetGrid: grid,
                        formType: grid.formConfig.name
                    }).show();
                }
            },{
                text: 'Apply Template',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var menu = this.up('menu').items.get('templatesMenu');

                    Ext4.create('EHR.window.ApplyTemplateWindow', {
                        targetGrid: grid,
                        formType: grid.formConfig.name,
                        idSelectionMode: menu.idSelectionMode || 'multi'
                    }).show();
                }
            },{
                text: 'Templates',
                itemId: 'templatesMenu',
                idSelectionMode: config.idSelectionMode,
                menu: []
            }]
        }
    }, config);
});

EHR.DataEntryUtils.registerGridButton('TEMPLATE_NO_ID', function(config){
    var cfg = EHR.DataEntryUtils.getGridButton('TEMPLATE', {
        idSelectionMode: 'none'
    });

    return Ext4.apply(cfg, config);
});

EHR.DataEntryUtils.registerGridButton('TEMPLATE_ENCOUNTER', function(config){
    var cfg = EHR.DataEntryUtils.getGridButton('TEMPLATE', {
        idSelectionMode: 'encounter'
    });

    return Ext4.apply(cfg, config);
});
