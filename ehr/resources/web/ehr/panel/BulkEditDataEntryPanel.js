/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * The purpose of this panel is to allow editing of arbitrary sets of records from a single store based on a list of PKs
 */
Ext4.define('EHR.panel.BulkEditDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-taskdataentrypanel',

    initComponent: function(){
        LDK.Assert.assertNotEmpty('BulkEditDataEntryPanel lacks a keyField', this.formConfig.keyField);

        this.pkValues = LABKEY.ActionURL.getParameter('pkValues');

        this.callParent(arguments);
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create(this.formConfig.keyField, this.pkValues, LABKEY.Filter.Types.EQUALS_ONE_OF));

        return cfg;
    },

    onStoreCollectionCommitComplete: function(sc, extraContext){
        if (Ext4.Msg.isVisible())
            Ext4.Msg.hide();

        if(extraContext && extraContext.successURL){
            window.onbeforeunload = Ext4.emptyFn;
            window.location = LABKEY.ActionURL.getParameter('srcURL') || extraContext.successURL;
        }
        else {
            this.updateDirtyStateMessage();
        }
    }
});