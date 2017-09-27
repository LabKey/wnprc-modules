/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This panel provides the UI which allows the user to save existing records in a Form or Form section as a template.  It
 * gives the ability to choose which section(s) (ie. queries) should be saved and which field(s) per section to save.
 *
 * @cfg targetGrid
 * @cfg formType
 */
Ext4.define('EHR.window.SaveTemplateWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.applyIf (this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Save As Template',
            boxMaxHeight: 600,
            defaults: {
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [{
                bodyStyle: 'padding: 5px;',
                defaults: {
                    labelWidth: 130,
                    border: false
                },
                items: [{
                    html: 'This allows you to save a set of records as a template for future use.  For each section, you can choose which fields to save.  Templates tend to be most useful to handle things like commonly used drug combinations, common procedures, or groups of observations commonly entered together.  As a general rule, templates are best when they are generic.  For example, it usually does not make sense to include specific sets of animal IDs, date, protocols, etc.',
                    maxWidth: 800,
                    style: 'padding-bottom:10px;'
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Template Name',
                    allowBlank: false,
                    width: 400,
                    itemId: 'templateName',
                    listeners: {
                        change: function(field, val){
                            field.up('window').down('#submitBtn').setDisabled(!val);
                        }
                    }
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Description',
                    width: 400,
                    itemId: 'templateDescription'
                },{
                    xtype: 'combo',
                    forceSelection: true,
                    displayField: 'DisplayName',
                    valueField: 'UserId',
                    queryMode: 'local',
                    listWidth: 300,
                    width: 400,
                    fieldLabel: 'User/Group',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'core',
                        queryName: 'PrincipalsWithoutAdmin',
                        columns: 'UserId,DisplayName',
                        sort: 'Type,DisplayName',
                        autoLoad: true
                    },
                    itemId: 'templateUser'
                },{
                    html: 'NOTE: You can choose a user or group in order to limit which users can see the template.  Leave it blank to expose the template to everyone.  Pick your own user to make it visible to you only.  If you want to share it with a specific group (ie. vets or pathology), choose them from the list.',
                    maxWidth: 800
                }]
            },{
                xtype: 'tabpanel',
                activeTab: 0,
                itemId: 'theForm',
                items: this.getTabs()
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                scope: this,
                disabled: true,
                handler: function(btn){
                    this.onSubmit();
                    this.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.close();
                }
            }]
        });

        this.callParent(arguments);

        this.on('show', function(){
            this.down('#templateName').focus(false, 50);
        }, this);
    },

    getTabs: function(){
        var tabs = [];

        if (!this.targetGrid.store.getCount()){
            this.on('beforeshow', function(){
                Ext4.Msg.alert('Error', 'There are no records to save.');

                this.close();
                return false;
            }, this, {single: true});
        }
        else
            tabs.push(this.getTabForStore(this.targetGrid.store));

        return tabs;
    },

    getTabForStore: function(store){
        var count = store.getCount();
        if (!count){
            return
        }

        return {
            xtype: 'panel',
            title: this.targetGrid.formConfig.label + ': ' + count + ' Record' + (count==1 ? '' : 's'),
            border: false,
            style: 'padding-bottom:10px;',
            storeId: store.storeId,
            maxWidth: 800,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Choose Which Records To Save:</b>',
                style: 'padding-top: 5px;padding-bottom: 5px;'
            },{
                xtype: 'radiogroup',
                style: 'padding-bottom:10px;',
                itemId: 'recordSelector',
                columns: 3,
                defaults: {
                    name: store.storeId+'-radio',
                    labelWidth: 160,
                    width: 180
                },
                items: [{
                    boxLabel: 'Include All',
                    inputValue: 'all',
                    checked: true
                },{
                    boxLabel: 'Include None',
                    inputValue: 'none'
                },{
                    boxLabel: 'Selected Only',
                    inputValue: 'selected'
                }]
            },{
                html: '<b>Choose Which Fields To Save:</b>',
                style: 'padding-top: 5px;padding-bottom: 5px;'
            },{
                xtype: 'checkboxgroup',
                width: 600,
                itemId: 'fieldSelector',
                name: store.storeId,
                columns: 3,
                defaults: {
                    name: 'fields'
                },
                items: this.getCheckboxItems(store)
            }]
        };
    },

    getCheckboxItems: function(store){
        var toAdd = [];

        store.getFields().each(function(f){
            if (!f.hidden && f.shownInInsertView && f.allowSaveInTemplate!==false && f.allowDuplicate!==false){
                toAdd.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex,
                    boxLabel: f.fieldLabel || f.caption || f.name,
                    inputValue: f.name,
                    labelWidth: 160,
                    checked: !(f.noDuplicateByDefault || f.noSaveInTemplateByDefault)
                });
            }
        }, this);

        return toAdd;
    },

    onSubmit: function(){
        this.hide();
        Ext4.Msg.wait("Saving...");

        var tn = this.down('#templateName').getValue();
        var rows = [];

        this.down('#theForm').items.each(function(tab){
            var selections = tab.down('#recordSelector').getValue().inputValue;
            var fields = tab.down('#fieldSelector').getValue().fields;

            if (!fields.length)
                return;

            if (selections == 'none')
                return;

            var store = Ext4.StoreMgr.get(tab.storeId);

            var records = [];
            if (selections == 'selected'){
                records = this.grid.getSelectionModel().getSelections();

                if (!records.length){
                    Ext4.Msg.hide();
                    Ext4.Msg.alert('Error', 'No records were selected in the grid');
                }
            }
            else
                records = store.getRange();

            Ext4.Array.forEach(records, function(rec){
                var json = {};
                Ext4.Array.forEach(fields, function(chk){
                    json[chk] = rec.get(chk);
                }, this);

                rows.push({
                    templateId: null,
                    category: 'Section',
                    storeId: this.getStoreSaveName(store),
                    json: Ext4.encode(json),
                    templateName: tn
                });
            }, this);
        }, this);

        if (!rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', "No records selected");
            return;
        }

        this.saveTemplate(rows);
    },

    getStoreSaveName: function(store){
        var storeId = store.storeId;
        storeId = storeId.replace(new RegExp('^' + store.storeCollection.collectionId + '-'), '');

        return storeId;
    },

    saveTemplate: function(rows){
        LABKEY.Query.insertRows({
            method: 'POST',
            schemaName: 'ehr',
            queryName: 'formtemplates',
            scope: this,
            rows: [{
                title: this.down('#templateName').getValue(),
                userid: this.down('#templateUser').getValue(),
                description: this.down('#templateDescription').getValue(),
                formType: this.formType,
                category: 'Section'
            }],
            success: function(data){
                Ext4.Array.forEach(rows, function(r){
                    r.templateId = data.rows[0].entityid;
                }, this);

                LABKEY.Query.insertRows({
                    method: 'POST',
                    schemaName: 'ehr',
                    queryName: 'formTemplateRecords',
                    rows: rows,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function(){
                        Ext4.Msg.hide();
                    }
                });

                //reload the templates btn, if present
                var btn = this.targetGrid.down('#templatesBtn');
                LDK.Assert.assertNotEmpty('Unable to find templatesBtn in SaveTemplateWindow', btn);
                if (btn){
                    btn.populateFromDatabase();
                }

                this.close();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    }
});