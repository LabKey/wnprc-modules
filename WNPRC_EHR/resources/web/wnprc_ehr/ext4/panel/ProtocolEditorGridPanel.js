/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Created to allow a custom row editor plugin and column that summarize observations
 */
Ext4.define('EHR.grid.ProtocolEditorGridPanel', {
    extend: 'EHR.grid.Panel',
    alias: 'widget.ehr-protocoleditorgridpanel',
    editable: false,

    initComponent: function(){
        this.callParent(arguments);

        this.protocolStore = this.store.storeCollection.getClientStoreByName('protocol');
        LDK.Assert.assertNotEmpty('Unable to find protocol store', this.protocolStore);

        this.mon(this.protocolStore, 'update', this.onprotocolStoreChange, this, {buffer: 400});
        this.mon(this.protocolStore, 'remove', this.onprotocolStoreChange, this, {buffer: 400});
        this.mon(this.protocolStore, 'add', this.onprotocolStoreChange, this, {buffer: 400});


    },

    onprotocolStoreChange: function(store, rec){
        console.log('refresh remark grid');
        this.getView().refresh();
    },

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.ProtocolRowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    },

    configureColumns: function(){
        this.callParent(arguments);

        this.columns.push({
            name: 'protocol',
            header: 'Protocol',
            width: 400,
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                if (!this.protocolStore){
                    this.protocolStore = store.storeCollection.getClientStoreByName('protocol');
                }
                LDK.Assert.assertNotEmpty('Unable to find protocol store', this.protocolStore);

                if (this.protocolStore){
                    var protocol = record.get('protocol');
                    var inves = record.get('inves');
                    var approve = record.get('approve');
                    var contacts = record.get('contacts');
                    //var date = record.get('date') ? record.get('date').format('Y-m-d') : null;
                    var data = this.protocolStore.snapshot || this.protocolStore.data;

                    var lines = [];
                    data.each(function(r){
                        var rowDate = r.get('approve') ? r.get('approve').format('Y-m-d') : null;

                    }, this);

                    return lines.join('<br>');
                }

                return '';
            }
        });
    },
    handleSectionChangeEvent: function(sm,models){

    }
});