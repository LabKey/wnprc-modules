/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-formpanel',

    statics: {
        defaultFieldWidth: 400,
        defaultLabelWidth: 150
    },

    textareaFieldWidth: 600,
    maxFieldWidth: null,

    initComponent: function(){
        Ext4.QuickTips.init();

        Ext4.apply(this, {
            items: this.items || this.getItemsConfig(),
            bodyStyle: 'padding: 5px;',
            //TODO: is this necessary??
            pollForChanges: true,
            defaults: {
                border: false
            },
            buttonAlign: 'left'
        });

        this.bindConfig = this.bindConfig || {};
        LABKEY.Utils.mergeIf(this.bindConfig, {
            autoCreateRecordOnChange: true,
            autoBindFirstRecord: true
        });

        this.plugins = this.plugins || [];
        this.plugins.push(Ext4.create('EHR.plugin.Databind'));

        this.callParent();
    },

    getRawFieldConfigs: function(){
        var items = [];
        var fields = EHR.model.DefaultClientModel.getFieldConfigs(this.formConfig.fieldConfigs, this.formConfig.configSources, this.extraMetaData);
        Ext4.Array.forEach(fields, function(field){
            if (field.jsonType == 'date' && field.extFormat){
                if (Ext4.Date.formatContainsHourInfo(field.extFormat)){
                    field.xtype = 'xdatetime';
                }
            }

            if (!field.name){
                field.name = field.itemId;
            }

            var cfg = EHR.DataEntryUtils.getFormEditorConfig(field);
            Ext4.apply(cfg, {
                labelWidth: EHR.form.Panel.defaultLabelWidth,
                width: cfg.width || ((cfg.xtype == 'textarea' || cfg.xtype == 'ehr-remarkfield') ? this.textareaFieldWidth : EHR.form.Panel.defaultFieldWidth)
            });

            if (this.maxFieldWidth && cfg.width > this.maxFieldWidth){
                cfg.width = this.maxFieldWidth;
            }

            //skip hidden fields
            if (cfg.hidden)
                return;

            if (cfg.height && this.maxFieldHeight && cfg.height > this.maxFieldHeight){
                cfg.height = this.maxFieldHeight;
            }

            items.push({
                cfg: cfg,
                field: field
            });
        }, this);

        return items;
    },

    getFieldConfigs: function(){
        var fields = this.getRawFieldConfigs();
        var compositeFields = {};

        var items = [];
        Ext4.Array.forEach(fields, function(item){
            var cfg = item.cfg;
            var field = item.field;

            if (field.compositeField){
                cfg.fieldLabel = undefined;

                if (!compositeFields[field.compositeField]){
                    var msgTargetId = 'msgtarget-' + Ext4.id();
                    compositeFields[field.compositeField] = {
                        xtype: 'fieldcontainer',
                        fieldLabel: field.compositeField,
                        width: EHR.form.Panel.defaultFieldWidth,
                        labelWidth: EHR.form.Panel.defaultLabelWidth,
                        border: false,
                        msgTargetId: msgTargetId,
                        msgTarget: 'under',
                        items: [{
                            border: false,
                            layout: 'hbox',
                            items: [cfg]
                        },{
                            xtype: 'displayfield',
                            isFormField: false,
                            hidden: true,
                            itemId: msgTargetId
                        }]
                    };
                    items.push(compositeFields[field.compositeField]);
                }
                else {
                    compositeFields[field.compositeField].items[0].items.push({
                        xtype: 'splitter',
                        border: false
                    });
                    compositeFields[field.compositeField].items[0].items.push(cfg);
                }
            }
            else {
                items.push(cfg);
            }
        }, this);

        //distribute width for compositeFields
        for (var i in compositeFields){
            var compositeField = compositeFields[i];
            var toResize = [];
            //this leaves a 2px buffer between each field
            var availableWidth = EHR.form.Panel.defaultFieldWidth - EHR.form.Panel.defaultLabelWidth;
            for (var j=0;j<compositeFields[i].items[0].items.length;j++){
                var field = compositeFields[i].items[0].items[j];
                //if the field isnt using the default width, we assume it was deliberately customized
                if (field.xtype == 'splitter'){
                    availableWidth = availableWidth - 4;
                }
                else if (field.width && field.width != EHR.form.Panel.defaultFieldWidth){
                    availableWidth = availableWidth - field.width;
                }
                else {
                    toResize.push(field)
                }

                availableWidth = availableWidth - 2;
            }

            if (toResize.length){
                var newWidth = availableWidth / toResize.length;
                for (var j=0;j<toResize.length;j++){
                    delete toResize[j].width;
                    toResize[j].flex = (1.0 / toResize.length);
                }
            }
        }

        return items;
    },

    getItemsConfig: function(){
        var items = this.getFieldConfigs();
        var currentColIdx = 0;
        var currentIdx = 0;
        var finalItems = [];

        Ext4.Array.forEach(items, function(item, idx){
            if (!item.hidden){
                if (this.maxItemsPerCol && currentIdx > this.maxItemsPerCol && (items.length - idx) > 2){
                    currentColIdx++;
                    currentIdx = 0;
                }

                if (!finalItems[currentColIdx]){
                    finalItems[currentColIdx] = {
                        border: false,
                        defaults: {
                            border: false
                        },
                        items: []
                    }
                }

                finalItems[currentColIdx].items.push(item);

                currentIdx++;

                if (item.xtype == 'textarea' || item.xtype == 'ehr-remarkfield' || item.height > 50){
                    currentIdx += 2;
                }
            }
            else {
                console.log('hidden');
            }
        }, this);

        Ext4.Array.forEach(finalItems, function(col){
            col.columnWidth = (1 / finalItems.length);
        }, this);

        items = [{
            xtype: 'panel',
            itemId: 'columnPanel',
            layout: 'column',
            defaults: {
                border: false
            },
            items: finalItems
        }];

        return items;
    }
});


