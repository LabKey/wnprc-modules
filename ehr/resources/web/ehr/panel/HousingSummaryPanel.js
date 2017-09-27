/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.HousingSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-housingsummarypanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent(arguments);
        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'housingPairingSummary',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.housingPairingSummaryData = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'housingTypeSummary',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.housingTypeSummaryData = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'ehr_lookups',
            queryName: 'roomUtilizationByBuilding',
            sort: '-pctUsed',
            filterArray: [LABKEY.Filter.create('availableCages', 0, LABKEY.Filter.Types.GT)],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.roomUtilizationByBuildingData = results;
            }
        });

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var cfg = {
            defaults: {
                border: false
            },
            items: []
        };

        if (this.roomUtilizationByBuildingData){
            cfg.items.push(this.appendUtilizationSection(this.roomUtilizationByBuildingData));
        }

        if (this.housingTypeSummaryData){
            cfg.items.push(this.appendSection(this.housingTypeSummaryData, {
                header: 'Housing Type Summary',
                columns: ['housingType', 'totalAnimals'],
                sumField: 'totalAnimals'
            }));
        }

        if (this.housingPairingSummaryData){
            cfg.items.push(this.appendSection(this.housingPairingSummaryData, {
                header: 'Pairing Summary',
                columns: ['category', 'totalAnimals'],
                sumField: 'totalAnimals'
            }));
        }

        this.removeAll();
        this.add(cfg);
    },

    appendUtilizationSection: function(results){
        if (!results || !results.rows || !results.rows.length){
            return {
                html: 'No buildings were found',
                style: 'padding-bottom: 10px;'
            }
        }

        var headerNames = ['Building', 'Total Cages', 'Empty Cages', '% Used'];
        var cells = [];

        Ext4.each(headerNames, function(headerName, idx){
            cells.push({
                html: '<b>' + headerName + '</b>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });
        }, this);

        Ext4.each(results.rows, function(r){
            var row = new LDK.SelectRowsRow(r);

            var building = row.getDisplayValue('building');
            if (!building){
                building = 'Unknown';
            }

            cells.push({
                html: '<a target="_blank" href="' + LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                    schemaName: 'ehr_lookups',
                    'query.queryName': 'roomUtilization',
                    'query.room/building~eq': building
                }) + '">' + building + ':</a>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });

            cells.push({
                html: '<a target="_blank" href="' + LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                    schemaName: 'ehr_lookups',
                    'query.queryName': 'availableCages',
                    'query.room/building~eq': building,
                    'query.isAvailable~eq': true,
                    'query.sort': 'cage'
                }) + '">' + row.getDisplayValue('availableCages') + '</a>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });

            cells.push({
                html: row.getDisplayValue('cagesEmpty') + '',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });

            cells.push({
                html: Ext4.util.Format.round(row.getDisplayValue('pctUsed'), 2) + '%',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });
        }, this);

        return {
            border: false,
            defaults: {
                border: false
            },
            style: 'padding: 5px;',
            items: [{
                html: '<b>Cage Usage:</b><hr>'
            },{
                border: false,
                style: 'padding-left: 5px;',
                layout: {
                    type: 'table',
                    columns: 4
                },
                items: cells
            }]
        }
    },

    appendSection: function(results, cfg){
        if (!results || !results.rows || !results.rows.length){
            return {
                html: 'No records were found',
                style: 'padding-bottom: 10px;'
            }
        }

        var total = 0;
        if (cfg.sumField){
            Ext4.each(results.rows, function(r){
                var row = new LDK.SelectRowsRow(r);
                total += row.getValue(cfg.sumField);
            }, this);
        }
        var cells = [];
        Ext4.each(results.rows, function(r){
            var row = new LDK.SelectRowsRow(r);

            Ext4.each(cfg.columns, function(col, idx){
                var val = row.getDisplayValue(col);
                if (idx == 0){
                    if (!val)
                        val = 'Unknown';

                    val += ':';
                }

                var url = row.getURL(col);
                if (url)
                    val = '<a target="_blank" href="' + url + '">' + val + '</a>';

                cells.push({
                    html: val + '',
                    border: false,
                    style: 'padding: 2px;padding-right: 5px;'
                });
            }, this);

            if (cfg.sumField){
                var pct =  (row.getValue(cfg.sumField) / total) * 100;
                pct = Ext4.util.Format.round(pct, 2);
                pct = pct.toString();

                cells.push({
                    html: '(' + pct + '%)',
                    border: false,
                    style: 'padding: 2px;padding-right: 5px;'
                })
            }
        }, this);

        return {
            border: false,
            defaults: {
                border: false
            },
            style: 'padding: 5px;',
            items: [{
                html: '<b>' + cfg.header + ':</b><hr>'
            },{
                border: false,
                style: 'padding-left: 5px;',
                layout: {
                    type: 'table',
                    columns: cfg.columns.length + (cfg.sumField ? 1 : 0)
                },
                items: cells
            }]
        }
    }
});