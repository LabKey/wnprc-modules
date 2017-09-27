/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.ns('EHR.permission');

//This is a flag that can be set for debugging purposes.  It will cause additional client-side logging
EHR.debug = (LABKEY.Security.currentUser.isAdmin && LABKEY.ActionURL.getParameter('debug')) ? 1 : 0;

EHR.QCStates = new function(){
    return {
        COMPLETED: 'Completed',
        REVIEW_REQUIRED: 'Review Required',
        IN_PROGRESS: 'In Progress'
    }
};