/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SmallFormSnapshotPanel', {
    extend: 'EHR.panel.SnapshotPanel',
    alias: 'widget.ehr-smallformsnapshotpanel',

    showLocationDuration: false,
    showActionsButton: false,

    initComponent: function(){

        this.defaultLabelWidth = 120;
        this.callParent();
    },

    getItems: function(){
        var items = this.getBaseItems();

        if (!this.redacted){
            items[0].items.push({
                name: 'treatments',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Current Medications / Prescribed Diets',
                emptyText: 'There are no active medications'
            });
        }

        return items;
    }
});