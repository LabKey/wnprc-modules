/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.RequestDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-requestdataentrypanel',

    taskId: null,

    initComponent: function(){
        this.requestId = this.requestId || LABKEY.ActionURL.getParameter('requestid') || LABKEY.ActionURL.getParameter('requestId') || LABKEY.Utils.generateUUID().toUpperCase();
        this.callParent();
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create('requestId', this.requestId, LABKEY.Filter.Types.EQUALS));

        return cfg;
    }
});