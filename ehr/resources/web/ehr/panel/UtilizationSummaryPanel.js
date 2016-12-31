/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param filterArray
 */
Ext4.define('EHR.panel.UtilizationSummaryPanel', {
    extend: 'EHR.panel.BasicAggregationPanel',
    alias: 'widget.ehr-utilizationsummarypanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Colony Utilization:</b>'
            },{
                html: '<hr>'
            },{
                itemId: 'childPanel',
                defaults: {
                    border: false
                },
                items: [{
                    html: 'Loading...'
                }]
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        //find animal count
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'Demographics',
            filterArray: this.filterArray,
            columns: ['Id', 'Id/utilization/usageCategories', 'Id/utilization/fundingCategories', 'species', 'Id/age/ageInYears', 'Id/ageclass/label'].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.demographicsData = results;
                this.usageCategoryData = this.aggregateResults(results, 'Id/utilization/usageCategories');
                this.fundingCategoryData = this.aggregateResults(results, 'Id/utilization/fundingCategories');
            }
        });

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var target = this.down('#childPanel');
        target.removeAll();

        var cfg = {
            defaults: {
                border: false
            },
            items: []
        };

        var item = this.appendSection('By Category', this.usageCategoryData, 'Id/utilization/usageCategories', 'eq');
        if (item)
            cfg.items.push(item);

        var item2 = this.appendSection('By Funding Source', this.fundingCategoryData, 'Id/utilization/fundingCategories', 'eq');
        if (item2)
            cfg.items.push(item2);

        if (!cfg.items.length){
            cfg.items.push({
                html: 'No records found'
            });
        }

        target.add(cfg);
    },

    getKeys: function(data){
        return Ext4.Object.getKeys(data.aggregated).sort(function(a, b){
            return data.aggregated[b] - data.aggregated[a];
        });
    }
});
