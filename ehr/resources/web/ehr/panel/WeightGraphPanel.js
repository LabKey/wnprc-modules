/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg showRawData
 * @cfg containerPath
 */
Ext4.define('EHR.panel.WeightGraphPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-weightgraphpanel',

    initComponent: function(){
        Ext4.apply(this, {
            minHeight: 400,
            items: [{
                border: false,
                style: 'padding: 5px;',
                html: 'Loading...'
            }]
        });

        this.callParent();

        this.on('render', this.loadData, this);
    },

    loadData: function(){
        //then raw data
        LABKEY.Query.selectRows({
            containerPath: this.containerPath,
            schemaName: 'study',
            queryName: 'weightRelChange',
            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
            columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
            sort: 'Id,-date',
            requiredVersion: 9.1,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onDataLoad
        });
    },

    onDataLoad: function(results){
        var target = this;
        if (!target){
            console.log('target panel not present in callback of weight report.  This may indicate the layout changed before load');
            return;
        }

        if (!this.rendered){
            console.log('not rendered');
        }

        if (!this.isVisible()){
            console.log('not visible');
        }

        this.removeAll();
        this.add({
            xtype: this.showRawData ? 'tabpanel' : 'panel',
            style: 'margin-bottom: 20px',
            items: this.showRawData ? [this.getGraphConfig(results), this.getQWPConfig()] : [this.getGraphConfig(results)]
        });
    },

    getGraphConfig: function(results){
        return {
            xtype: 'ldk-graphpanel',
            title: this.showRawData ? 'Graph' : null,
            style: 'margin-bottom: 30px',
            plotConfig: {
                results: results,
                title: 'Weight: ' + this.subjectId,
                height: 400,
                width: 900,
                yLabel: 'Weight (kg)',
                xLabel: 'Date',
                xField: 'date',
                grouping: ['Id'],
                layers: [{
                    y: 'weight',
                    hoverText: function(row){
                        var lines = [];

                        lines.push('Date: ' + row.date.format('Y-m-d'));
                        lines.push('Weight: ' + row.weight + ' kg');
                        lines.push('Latest Weight: ' + row.LatestWeight + ' kg');
                        if(row.LatestWeightDate)
                            lines.push('Latest Weight Date: ' + row.LatestWeightDate.format('Y-m-d'));
                        if(row.PctChange)
                            lines.push('% Change From Current: '+row.PctChange + '%');
                        lines.push('Interval (Months): ' + row.IntervalInMonths);

                        return lines.join('\n');
                    },
                    name: 'Weight'
                }]
            }
        }
    },

    getQWPConfig: function(){
        return {
            xtype: 'ldk-querypanel',
            title: 'Raw Data',
            style: 'margin: 5px;',
            queryConfig: {
                frame: 'none',
                containerPath: this.containerPath,
                schemaName: 'study',
                queryName: 'weight',
                viewName: 'Percent Change',
                sort: 'id,-date',
                failure: LDK.Utils.getErrorCallback(),
                filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)]
            }
        }
    }
});