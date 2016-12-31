/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg caseId
 * @cfg maxGridHeight
 * @cfg autoLoadRecords
 */
Ext4.define('EHR.panel.CaseHistoryPanel', {
    extend: 'EHR.panel.ClinicalHistoryPanel',
    alias: 'widget.ehr-casehistorypanel',

    getStoreConfig: function(){
        return {
            type: 'ehr-clinicalhistorystore',
            containerPath: this.containerPath,
            actionName: 'getCaseHistory',
            sorters: [{property: 'group'}, {property: 'timeString'}]
        };
    }
});
