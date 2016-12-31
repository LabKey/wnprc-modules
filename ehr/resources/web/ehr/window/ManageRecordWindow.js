/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg schemaName
 * @cfg queryName
 * @cfg pkCol
 * @cfg pkValue
 */
Ext4.define('EHR.window.ManageRecordWindow', {
    extend: 'Ext.window.Window',

    statics: {
        buttonHandler: function(Id, objectId, queryName, dataRegionName){
            LDK.Assert.assertNotEmpty('No objectid provided to ManageRecordWindow.buttonHandler', objectId);
            LDK.Assert.assertNotEmpty('No queryName provided to ManageRecordWindow.buttonHandler', queryName);

            Ext4.create('EHR.window.ManageRecordWindow', {
                schemaName: 'study',
                queryName: queryName,
                maxItemsPerCol: 11,
                pkCol: 'objectid',
                pkValue: objectId,
                listeners: {
                    scope: this,
                    save: function(){
                        if (dataRegionName && LABKEY.DataRegions[dataRegionName]){
                            LABKEY.DataRegions[dataRegionName].refresh();
                        }
                    }
                }
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            minWidth: 600,
            minHeight: 200,
            items: [{
                border: false,
                style: 'padding: 5px;',
                html: 'Loading...'
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                requiredQC: 'Completed',
                targetQC: 'Completed',
                errorThreshold: 'INFO',
                disableOn: 'WARN',
                disabled: true,
                handler: this.onSubmit
            },{
                text: 'Re-validate Form',
                scope: this,
                handler: function(btn){
                    var form = this.down('#formPanel');
                    var rec = form.getRecord();
                    if (!rec)
                        return;

                    this.down('#dataEntryPanel').storeCollection.validateAll();
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();
        this.addEvents('save');

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormJsonForQuery', null),
            params: {
                schemaName: this.schemaName,
                queryName: this.queryName
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onFormLoad, this)
        })
    },

    onSubmit: function(btn){
        var form = this.down('#formPanel');
        var rec = form.getRecord();
        if (!rec)
            return;

        this.down('#dataEntryPanel').onSubmit(btn);
    },

    onFormLoad: function(results){
        this.formResults = results;
        this.setTitle(this.formResults.formConfig.label);

        if (results.cssDependencies){
            LABKEY.requiresCss(results.cssDependencies);
        }

        if (results.jsDependencies){
            LABKEY.requiresScript(results.jsDependencies, this.onJsLoad, this, true);
        }
        else {
            this.onJsLoad();
        }
    },

    onJsLoad: function(){
        var name = Ext4.id();

        Ext4.define(name, {
            extend: this.formResults.formConfig.javascriptClass,
            alias: 'widget.' + name,
            extraMetaData: this.extraMetaData,
            applyConfigToServerStore: function(cfg){
                cfg = this.callParent(arguments);
                cfg.filterArray = cfg.filterArray || [];
                cfg.filterArray.push(LABKEY.Filter.create(this.pkCol, this.pkValue, LABKEY.Filter.Types.EQUAL));

                return cfg;
            },
            onStoreCollectionInitialLoad: function(){
                var item = this.getItemConfig()[0];
                item.itemId = 'formPanel';
                item.maxItemsPerCol = item.maxItemsPerCol || 9;
                item.maxFieldWidth = EHR.form.Panel.defaultFieldWidth;

                var win = this.ownerWindow;
                if (win.maxItemsPerCol)
                    item.maxItemsPerCol = win.maxItemsPerCol;

                var formPanel = Ext4.widget(item);
                var cols = formPanel.items.get(0).items.getCount();
                var width = cols * (EHR.form.Panel.defaultFieldWidth + 10);

                formPanel.down('#columnPanel').setWidth(width);

                this.removeAll();
                this.add(formPanel);
                win.removeAll();
                win.setWidth(width + 20);
                win.add(this);
                win.center();

                this.hasStoreCollectionLoaded = true;
            },
            getToolbarItems: function(){
                var win = this.up('window');
                if (!win){
                    //NOTE: this can occur once after the window is closed, but before the store returns
                    return;
                }

                return win.getDockedItems('toolbar[dock="bottom"]');
            },
            getButtons: function(){
                return [];
            }
        });

        var dataEntryPanel = Ext4.widget({
            xtype: name,
            ownerWindow: this,
            itemId: 'dataEntryPanel',
            pkCol: this.pkCol,
            pkValue: this.pkValue,
            hideErrorPanel: true,
            formConfig: this.formResults.formConfig,
            onStoreCollectionCommitComplete: this.onStoreCollectionCommitComplete
        });
    },

    onStoreCollectionCommitComplete: function(sc, extraContext){
        Ext4.Msg.hide();
        var win = this.up('window');
        win.fireEvent('save', this, sc);
        win.close();
    }
});