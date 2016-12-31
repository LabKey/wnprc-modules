/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg caseId
 * @cfg containerPath
 */
Ext4.define('EHR.window.CaseHistoryWindow', {
    extend: 'EHR.window.ClinicalHistoryWindow',
    alias: 'widget.ehr-casehistorywindow',

    statics: {
        showCaseHistory: function(objectId, subjectId, el){
            var ctx = EHR.Utils.getEHRContext();
            LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
            if (!ctx){
                return;
            }

            Ext4.create('EHR.window.CaseHistoryWindow', {
                subjectId: subjectId,
                caseId: objectId,
                containerPath: ctx['EHRStudyContainer']
            }).show(el);
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Case History: ' + this.subjectId
        });

        this.callParent(arguments);
    },

    getItems: function(){
        var items = this.callParent();
        items[1].items[0].title = 'Entire History';
        items[1].items.splice(1, 0, {
            title: 'Case History',
            xtype: 'ehr-casehistorypanel',
            containerPath: this.containerPath,
            border: true,
            width: 1180,
            gridHeight: 400,
            height: 400,
            autoScroll: true,
            autoLoadRecords: true,
            subjectId: this.subjectId,
            caseId: this.caseId
        });
        items[1].activeTab = 1;

        return items;
    }
})