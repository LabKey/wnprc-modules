/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.HiddenSingleSubjectFilterType', {
    extend: 'LDK.panel.SingleSubjectFilterType',
    alias: 'widget.ehr-hiddensinglesubjectfiltertype',

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();
    },

    getItems: function(){
        return [{
            xtype: 'panel',
            hidden: true,
            items: [{
                xtype: 'textfield',
                hidden: true,
                itemId: 'subjArea',
                value: this.tabbedReportPanel.participantId
            }]
        }];
    }
});