/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param groupId
 */
Ext4.define('EHR.panel.AnimalGroupDetailsPanel', {
    extend: 'Ext.panel.Panel',

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

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'animal_groups',
            columns: '*',
            filterArray: [LABKEY.Filter.create('rowid', this.groupId, LABKEY.Filter.Types.EQUALS)],
            requiredVersion: 9.1,
            scope: this,
            success: this.onLoad,
            failure: LDK.Utils.getErrorCallback()
        });

        this.callParent(arguments);
    },

    onLoad: function(results){
        this.removeAll();

        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.alert('Error', 'Unable to find group with Id: ' + this.groupId);
            return;
        }

        var toAdd = [];

        LDK.Assert.assertNotEmpty('Group name was empty', results.rows[0]);
        this.groupRow = new LDK.SelectRowsRow(results.rows[0]);

        toAdd.push({
            xtype: 'ldk-webpartpanel',
            title: 'Group Details',
            items: [{
                border: false,
                defaults: {
                    border: false,
                    xtype: 'displayfield'
                },
                items: [{
                    fieldLabel: 'Name',
                    value: this.groupRow.getDisplayValue('name')
                },{
                    fieldLabel: 'Date Created',
                    value: this.groupRow.getFormattedDateValue('date', 'Y-m-d')
                },{
                    fieldLabel: 'Date Disabled',
                    value: this.groupRow.getFormattedDateValue('enddate', 'Y-m-d')
                },{
                    fieldLabel: 'Purpose',
                    value: this.groupRow.getDisplayValue('purpose')
                },{
                    fieldLabel: 'Comments',
                    value: this.groupRow.getDisplayValue('comments')
                }]
            }]
        });

        toAdd.push({
            html: '',
            style: 'padding-bottom: 20px;'
        });

        toAdd.push({
            xtype: 'ldk-webpartpanel',
            title: 'Misc Reports',
            items: [{
                xtype: 'ldk-navpanel',
                border: false,
                sections: this.getReportItems()
            }]
        });

        toAdd.push({
            html: '',
            style: 'padding-bottom: 20px;'
        });

        var fieldKey = 'Id/animalGroupsPivoted/' + this.groupRow.getDisplayValue('name') + '::valueField';
        toAdd.push({
            xtype: 'ldk-webpartpanel',
            title: 'Group Overview',
            items: [{
                xtype: 'ehr-populationpanel',
                filterArray: [
                    LABKEY.Filter.create('calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create(fieldKey, 'yes', LABKEY.Filter.Types.EQUAL)
                ],
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender],
                itemId: 'population'
            },{
                xtype: 'ehr-clinicalsummarypanel',
                style: 'padding-top: 20px',
                filterArray: [
                    LABKEY.Filter.create('Id/dataset/demographics/calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create(fieldKey, 'yes', LABKEY.Filter.Types.EQUAL)
                ]
            }]
        });

        toAdd.push({
            html: '',
            style: 'padding-bottom: 20px;'
        });

        toAdd.push({
            xtype: 'ldk-querypanel',
            queryConfig: {
                schemaName: 'study',
                queryName: 'animalGroupHousingSummary',
                frame: 'portal',
                title: 'Current Housing',
                filterArray: [LABKEY.Filter.create('groupId', this.groupId)]
            }
        });

        toAdd.push({
            html: '',
            style: 'padding-bottom: 20px;'
        });

        toAdd.push({
            xtype: 'ldk-querypanel',
            queryConfig: {
                schemaName: 'study',
                queryName: 'animal_group_members',
                frame: 'portal',
                title: 'Group Members',
                viewName: 'Active Members',
                filterArray: [LABKEY.Filter.create('groupId', this.groupId)]
            }
        });

        this.add(toAdd);
    },

    getReportItems: function(){
        return [{
            header: 'Reports',
            items: [{
                name: 'Find animals assigned to this group on a specific date',
                url: LABKEY.ActionURL.buildURL('ehr', 'groupOverlaps', null, {groupId: this.groupId, name: this.groupRow.getDisplayValue('name')})
            }]
        }]
    }
});