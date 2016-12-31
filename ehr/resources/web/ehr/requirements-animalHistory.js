/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
requirejs(["module", "pageapp"], function(module) {

    Ext4.onReady(function (){
        var webpart = webpartContext;
        var ctx = EHR.Utils.getEHRContext(webpart.wrapperDivId, ['DefaultAnimalHistoryReport']);
        if(!ctx)
            return;

        Ext4.create('EHR.panel.AnimalHistoryPanel', {
            defaultReport: ctx.DefaultAnimalHistoryReport,
            defaultTab: 'General',
            renderTo: webpart.wrapperDivId
        });
    });
});