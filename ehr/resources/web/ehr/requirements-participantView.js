/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
requirejs(["module", "pageapp"], function(module) {

    Ext4.onReady(function (){
        var webpart = webpartContext;
        var ctx = EHR.Utils.getEHRContext(webpart.wrapperDivId);
        if(!ctx)
            return;

        /* get the participant id from the request URL: this parameter is required. */
        var participantId = LABKEY.ActionURL.getParameter('participantId');

        if (!participantId){
            alert('Must Provide Id');
            return;
        }

        var title = 'Animal Details: ' + participantId;
        document.title = title;
        LABKEY.Utils.setWebpartTitle(title, webpart.id);

        Ext4.create('EHR.panel.ParticipantDetailsPanel', {
            participantId: participantId,
            defaultReport: ctx.DefaultAnimalHistoryReport,
            defaultTab: 'General',
            autoLoadDefaultTab: true
        }).render(webpart.wrapperDivId);
    });
});