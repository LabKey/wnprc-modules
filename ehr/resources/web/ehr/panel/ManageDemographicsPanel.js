/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} subjectId
 */
Ext4.define('EHR.panel.ManageDemographicsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managedemographicspanel',

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
        LABKEY.Query.selectRows({
            schemName: 'study',
            queryName: 'Demographics',
            columns: '',
            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUALS)],
            scope: this,
            success: this.onLoad,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onLoad: function(results){

    }
});