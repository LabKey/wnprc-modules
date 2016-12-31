/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SimpleDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-simpledataentrypanel',

    useSectionBorder: false,

    initComponent: function(){
        this.pkCols = this.formConfig.pkCols;
        LDK.Assert.assertTrue('No PKs provided to SimpleDataEntryPanel', !Ext4.isEmpty(this.pkCols));

        this.callParent();
    },

    onBeforeWindowUnload: function(){
        return true;  //always behave as though dirty
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        Ext4.Array.forEach(this.pkCols, function(pkCol, idx){
            var pkValue = LABKEY.ActionURL.getParameter(pkCol);
            cfg.filterArray.push(LABKEY.Filter.create(pkCol, pkValue, LABKEY.Filter.Types.EQUAL));
        }, this);
        return cfg;
    }
});