/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.ClinicalRemarksRowEditor', {
    extend: 'EHR.plugin.RowEditor',

    getObservationPanelCfg: function(){
        var store = this.cmp.dataEntryPanel.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Observations store not found', store);

        return {
            xtype: 'ehr-observationsroweditorgridpanel',
            itemId: 'observationsPanel',
            remarkStore: this.cmp.store,
            width: 500,
            store: store
        };
    },

    getDetailsPanelCfg: function(){
        return {
            xtype: 'ehr-animaldetailsextendedpanel',
            itemId: 'detailsPanel'
        }
    },

    onWindowClose: function(){
        this.callParent(arguments);
        this.getEditorWindow().down('#observationsPanel').store.clearFilter();

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
        ret.items[0].items[1] = {
            xtype: 'panel',
            layout: 'column',
            defaults: {
                border: false
            },
            border: false,
            items: [formCfg, this.getObservationPanelCfg()]
        };

        ret.width = 1050;
        return ret;
    },

    getWindowButtons: function(){
        var buttons = this.callParent(arguments);

        buttons.unshift({
            text: 'Mark Reviewed',
            handler: function(btn){
                var win = btn.up('window');
                var form = win.down('#formPanel');
                var record = form.getBoundRecord();
                if (!record){
                    return;
                }

                var obsStore = record.store.storeCollection.getClientStoreByName('Clinical Observations');
                LDK.Assert.assertNotEmpty('Unable to find clinical_observations store in ClinicalRemarksRowEditor', obsStore);
                LDK.Assert.assertNotEmpty('No caseid in bound record in ClinicalRemarksRowEditor', form.getRecord().get('caseid'));

                obsStore.add(obsStore.createModel({
                    Id: form.getRecord().get('Id'),
                    date: new Date(),
                    caseid: form.getRecord().get('caseid'),
                    category: 'Reviewed',
                    area: 'N/A',
                    observation: LABKEY.Security.currentUser.displayName
                }));
            },
            scope: this
        });

        return buttons;
    },

    loadRecord: function(record){
        this.callParent(arguments);
        this.getEditorWindow().down('#observationsPanel').loadRecord(record);
    }
});