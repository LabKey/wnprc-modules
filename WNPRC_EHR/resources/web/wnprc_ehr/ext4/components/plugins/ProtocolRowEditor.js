/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.ProtocolRowEditor', {
    extend: 'EHR.plugin.RowEditor',

    getProtocolPanelCfg: function(){
        var store = this.cmp.dataEntryPanel.storeCollection.getClientStoreByName('protocol');
        LDK.Assert.assertNotEmpty('Protocol store not found', store);

        return {
            xtype: 'ehr-formpanel',
            itemId: 'protocolPanel',
            width: 500,
            formConfig: this.cmp.formConfig,
            store: store
        };
    },

    getDetailsPanelCfg: function(){
        var config = this.callSuper();
        config.hidden = true;
        return config;

    },

    onWindowClose: function(){
        this.callParent(arguments);
        this.getEditorWindow().down('#formPanel').store.clearFilter();

    },

    getFormPanelCfg: function(){
        var ret = this.callParent(arguments);
        ret.maxFieldWidth = 500;

        return ret;
    },

    getWindowCfg: function(){
        var ret = this.callParent(arguments);

        var formCfg = ret.items[0].items[1];
        //NOTE: added to avoid splitting form into 2 columns
        formCfg.maxItemsPerCol = 100;
        /*ret.items[0].items[1] = {
            xtype: 'panel',
            layout: 'column',
            defaults: {
                border: false
            },
            border: false,
            items: [formCfg, this.getProtocolPanelCfg()]
        };*/

        ret.width = 800;
        return ret;
    }


});