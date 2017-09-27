/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param runId
 * @param hideHeader
 */
Ext4.define('EHR.panel.LabworkSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-labworksummarypanel',

    statics: {
        showRunSummary: function(runId, Id, el){
            LDK.Assert.assertNotEmpty('No runId provided in LabworkSummaryPanel', runId);

            Ext4.create('Ext.window.Window', {
                title: 'Labwork Results: ' + Id,
                bodyStyle: 'padding: 3px;',
                width: 600,
                minHeight: 300,
                modal: true,
                items: [{
                    xtype: 'ehr-labworksummarypanel',
                    border: true,
                    hideHeader: true,
                    runId: runId
                }],
                buttons: [{
                    text: 'Close',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                }]
            }).show(el);
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        var ctx = EHR.Utils.getEHRContext();

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'getLabResultSummary', (ctx ? ctx['EHRStudyContainer'] : null)),
            params: {
                runId: this.runId
            },
            scope: this,
            failure: LABKEY.Utils.getCallbackWrapper(LDK.Utils.getErrorCallback(), this),
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad)
        });
    },

    onLoad: function(results){
        this.removeAll();

        this.add({
            border: false,
            style: 'padding-left: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html : 'Results:<hr>',
                style: 'bottom-left: 5px;',
                hidden: this.hideHeader
            },{
                html: results.results[this.runId] ? results.results[this.runId] : 'No results found',
                style: 'padding-left: 5px;'
            }]
        });
    }
});