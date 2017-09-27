/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg animalId
 */
Ext4.define('EHR.panel.ObservationsPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.ehr-observationspanel',

    initComponent: function(){
        Ext4.apply(this, {
            selType: 'rowmodel',
            border: true,
            plugins: [{
                ptype: 'cellediting',
                pluginId: 'cellediting',
                clicksToEdit: 1,
                startEdit: function(record, columnHeader) {
                    this.editors.clear();
                    Ext4.grid.plugin.CellEditing.prototype.startEdit.apply(this, arguments);
                }
            }],
            listeners: {
                scope: this,
                cellclick: function(grid, cell, cellIdx, rec){
                    //because we show a different editor depending on the field value,
                    //we need to clear the cached editor
                    var grid = grid.up('grid');
                    var column = grid.columns[cellIdx];
                    var plugin = grid.getPlugin('cellediting');
                    if (plugin.editors)
                        plugin.editors.removeAtKey(column.getItemId());
                }
            },
            columns: [{
                header: 'Type',
                dataIndex: 'type',
                editable: true,
                renderer: function(value, cellMetaData, record){
                    if (Ext4.isEmpty(value)){
                        cellMetaData.tdCls = 'labkey-grid-cell-invalid';
                    }

                    return value;
                },
                editor: {
                    xtype: 'labkey-combo',
                    editable: false,
                    displayField: 'value',
                    valueField: 'value',
                    forceSelection: true,
                    store: {
                        type: 'labkey-store',
                        schemaName: 'onprc_ehr',
                        queryName: 'observation_types',
                        columns: 'value,editorconfig',
                        autoLoad: true
                    }
                }
            },{
                header: 'Area',
                width: 200,
                editable: true,
                dataIndex: 'area',
                editor: {
                    xtype: 'labkey-combo',
                    displayField: 'value',
                    valueField: 'value',
                    forceSelection: true,
                    value: 'N/A',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'ehr_lookups',
                        queryName: 'observation_areas',
                        autoLoad: true
                    }
                }
            },{
                header: 'Observation/Score',
                width: 200,
                editable: true,
                dataIndex: 'observation',
                renderer: function(value, cellMetaData, record){
                    if (Ext4.isEmpty(value)){
                        cellMetaData.tdCls = 'labkey-grid-cell-invalid';
                    }

                    return value;
                },
                getEditor: function(record){
                    if (!record){
                        //NOTE: i think this is an Ext4 core bug.  if you tab between cells
                        //this method is called w/o arguments
                        var records = this.up('grid').getSelectionModel().getSelection();
                        if (records.length)
                            record = records[0];
                        else
                            return;
                    }

                    var type = record.get('type');
                    if (!type){
                        return false;
                    }

                    var store = EHR.DataEntryUtils.getObservationTypesStore();
                    var rec = store.findRecord('value', type);
                    LDK.Assert.assertNotEmpty('Unable to find record matching type: ' + type, rec);

                    var config = rec.get('editorconfig') ? Ext4.decode(rec.get('editorconfig')) : null;
                    return config || {
                        xtype: 'textfield'
                    }
                }
            }],
            store: this.getStoreCfg(),
            dockedItems: [{
                xtype: 'toolbar',
                position: 'top',
                items: [{
                    text: 'Add',
                    scope: this,
                    handler: function(btn){
                        var rec = this.store.createModel({
                            Id: this.animalId,
                            date: new Date()
                        });

                        this.store.add(rec);
                        this.getPlugin('cellediting').startEdit(rec, 0);
                    }
                },{
                    text: 'Remove',
                    scope: this,
                    handler: function(btn){
                        var recs = this.getSelectionModel().getSelection();
                        this.store.remove(recs);
                    }
                },{
                    text: 'Template',
                    scope: this,
                    menu: [{
                        defaults: {
                            scope: this,
                            handler: function(item){
                                console.log(item);
                            }
                        },
                        items: [{
                            text: 'Template 1'
                        },{
                            text: 'Template 2'
                        }]
                    }]
                }]
            }]
        });

        this.callParent();
    },

    getStoreCfg: function(){
        return {
            type: 'labkey-store',
            schemaName: 'study',
            queryName: 'Clinical Observations',
            columns: 'Id,date,area,value,remark,QCState,category,performedby',
            maxRows: 0,
            autoLoad: true
        }
    }
});