/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ColonyOverviewPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        this.filterArray = [
            LABKEY.Filter.create('calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('gender/meaning', 'Unknown', LABKEY.Filter.Types.NEQ)
        ];
        this.childFilterArray = [
            LABKEY.Filter.create('Id/demographics/calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('Id/demographics/gender/meaning', 'Unknown', LABKEY.Filter.Types.NEQ)
        ];

        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page is designed to give an overview of the colony',
                style: 'padding-bottom: 20px;'
            },{
                xtype: 'tabpanel',
                border: true,
                defaults: {
                    border: false,
                    listeners: {
                        scope: this,
                        activate: function(tab){
                            Ext4.History.add('tab=' + tab.itemId);
                        }
                    }
                },
                items: this.getTabs()
            }]
        });

        this.activeTab = 1;

        var tokens = document.location.hash.split('#');
        if (tokens && tokens.length > 1){
            tokens = tokens[1].split('&');
            for (var i=0;i<tokens.length;i++){
                var t = tokens[i].split('=');
                if (t.length == 2 && t[0] == 'tab'){
                    //this.activeTab = t[0];
                }
            }
        }

        this.callParent();
    },

    getTabs: function(){
        return [{
            title: 'Population Composition',
            style: 'padding 5px;',
            items: [{
                xtype: 'ehr-populationpanel',
                filterArray: this.filterArray,
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            }],
            itemId: 'population'
        },{
            title: 'SPF Colony',
            style: 'padding 5px;',
            items: [{
                xtype: 'ehr-populationpanel',
                titleText: 'SPF 4 (SPF)',
                filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 4', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            },{
                xtype: 'ehr-populationpanel',
                titleText: 'SPF 9 (ESPF)',
                filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 9', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            }],
            itemId: 'spf'
        },{
            title: 'Housing Summary',
            xtype: 'ehr-housingsummarypanel',
            itemId: 'housingSummary'
        },{
            title: 'Utilization Summary',
            xtype: 'ehr-utilizationsummarypanel',
            filterArray: this.filterArray,
            itemId: 'utilizationSummary'
        },{
            title: 'Clinical Case Summary',
            xtype: 'ehr-clinicalsummarypanel',
            demographicsFilterArray: this.filterArray,
            filterArray: this.childFilterArray,
            itemId: 'clinicalSummary'
        }];
    }
});