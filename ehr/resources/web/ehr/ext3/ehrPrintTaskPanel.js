/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

/**
 * This class was never completed.  The intent was to try to create a variant of a normal Task ImportPanel which would
 * display records in a read-only manner suitable for printing.  The thought was that in some cases paper was going to be
 * necessary.  The user could start the task in LabKey, fill out as much as possible, then print.  The printout should have
 * space to fill in necessary values.  The user could take this printout back to the computer and fill in missing values.
 *
 * There may be use for this concept; however, other items were prioritized higher.
 */

EHR.ext.PrintTaskPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        this.storeConfig = this.storeConfig || {};
        if(!this.storeConfig.filterArray){
            this.storeConfig.maxRows = 0;
            this.on('load', function(){
                delete this.maxRows;
            }, this, {single: true});
        }

        this.store = this.store || new EHR.ext.AdvancedStore(Ext.applyIf(this.storeConfig, {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName || '~~UPDATE~~',
            columns: this.columns || EHR.Metadata.Columns[this.queryName] || '',
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            filterArray: this.filterArray || [],
            metadata: Ext.apply(this.metadata, {fieldDefaults: {lookupNullCaption: ''}}),
            timeout: 0
        }));

        if(this.store && this.queryName && this.schemaName){
            this.store.load();

            //a test for whether the store is loaded
            if(!this.store.fields){
                this.mon(this.store, 'load', this.loadQuery, this, {single: true});
            }
            else {
                this.loadQuery(this.store);
            }
        }
        else {
            //NOTE: inelegant
            this.hidden = true;
        }

        Ext.applyIf(this, {
            autoHeight: true
            //,autoWidth: true
            //,width: '7 in'
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,items: [{
                html: 'Loading...'
            }]
            ,tbar: [{
                xtype: 'button',
                text: 'Add Rows',
                scope: this,
                handler: function(b){
                    Ext.Msg.prompt('Number of Rows', 'How many rows do you want to add?', function(r, newRows){
                        var width = this.theTable.layout.columns;
                        if(newRows){
                            for(var i=0;i<newRows;i++){
                                for(var j=0;j<width;j++){
                                    this.theTable.add({style: 'height: 30px;'});
                                }
                            }
                        }
                        this.doLayout();
                    }, this);
                }
            }]
        });

        EHR.ext.PrintTaskPanel.superclass.initComponent.call(this);

    },
    loadQuery: function(store){
        var fields = [];
        var toAdd = [];

        store.fields.each(function(field){
            //TODO: better flags on whether to show in print
            if((field.shownInInsertView && !field.hidden) || field.shownInGrid){
                fields.push({
                    meta: field,
                    renderer: EHR.ext.metaHelper.getDefaultRenderer({}, field),
                    editor: EHR.ext.metaHelper.getFormEditorConfig(field)
                });

                var style = 'font-weight:bold;';
                if(field.printWidth)
                    style += 'width: '+field.printWidth+'px;';
                else
                    style += 'min-width: 60px;';

                toAdd.push({html: field.caption, style: style});

                if(field.name == 'date'){
                    toAdd.push({html: 'Time', style: style});
                }
            }
        }, this);

        this.removeAll();
        var theTable =  this.add({
            layout: 'table',
            ref: 'theTable',
            layoutConfig: {
                columns: (toAdd.length),
                tableAttrs: {
                    border: 1
                }
            },
            defaults: {
                border: false
            },
            border: true,
            items: toAdd
        });

        store.each(function(rec){
            Ext.each(fields, function(field){
                field.meta.type = field.meta.jsonType;
                field.meta.lookupNullCaption = ' ';

                if(field.meta.lookup)
                    field.meta.lookup.autoLoad = true;

                var val = rec.get(field.meta.name);

                if(field.meta.name == 'date'){
                    field.meta.format = 'Y-m-d';

                    var html = field.renderer(val, field.meta, rec);
                    theTable.add({html: html, style: 'height: 30px;'});

                    field.meta.format = 'H:i';
                }

                var html = field.renderer(val, field.meta, rec);

                if(field.meta.name == 'date' && html == '00:00'){
                    html = '';
                }
                var cell = theTable.add({html: html, style: 'height: 30px;'});

                if(field.meta.lookup){
                    var lookupStore = EHR.ext.metaHelper.getLookupStore(field.meta);
                    if(lookupStore){
                        this.mon(lookupStore, 'load', function(store){
                        var lookupRecord = lookupStore.getById(val);
                        if (lookupRecord)
                            cell.update(lookupRecord.data[field.meta.lookup.displayColumn]);
                        }, this);
                    }
                }

            }, this);
            //row.children.push({tag: 'td', html: ''});
            //rows.push(row);
        }, this);

//        this.body.createChild({
//            tag: 'table',
//            border: 1,
//            //style: 'border-width:1px;',
//            children: rows
//        });
        this.doLayout();
    }
});
Ext.reg('ehr-printtaskpanel', EHR.ext.PrintTaskPanel);