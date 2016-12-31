/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg filterArray
 * @cfg colFields
 * @cfg rowField
 */
Ext4.define('EHR.panel.PopulationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-populationpanel',
    statics: {
        FIELDS: {
            ageclass: 'Id/ageClass/label',
            species: 'species',
            gender: 'gender'
        }
    },

    titleText: 'Current Population',

    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                border: false,
                defaults: {
                    border: false
                },
                items: [{
                    html: '<b>' + this.titleText + ':</b>'
                },{
                    html: '<hr>'
                }]
            },{
                itemId: 'populationPanel',
                border: false,
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
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: this.filterArray,
            columns: ['Id', EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender, EHR.panel.PopulationPanel.FIELDS.species].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: this.doAggregation
        });

        multi.send(this.onLoad, this);
    },

    getValue: function(row, prop){
        if (!row[prop])
            return null;

        return Ext4.isDefined(row[prop].displayValue) ? row[prop].displayValue : row[prop].value;
    },

    ensureValue: function(map, prop, value){
        if (!map[prop])
            map[prop] = [];
        if (map[prop].indexOf(value) == -1)
            map[prop].push(value);
    },

    getColKey: function(row){
        var tokens = [];
        Ext4.each(this.colFields, function(colField){
            tokens.push(this.getValue(row, colField));
        }, this);
        return tokens.join('<>');
    },

    doAggregation: function(results){
        this.rawData = results;
        this.aggregateData = {
            totalRecords: results.rows.length,
            rowMap: {}
        };
        this.valueMap = {};

        Ext4.each(results.rows, function(row){
            var rowName = this.getValue(row, this.rowField);
            this.ensureValue(this.valueMap, this.rowField, rowName);

            if (rowName){
                if (!this.aggregateData.rowMap[rowName]){
                    this.aggregateData.rowMap[rowName] = {
                        total: 0,
                        children: {},
                        colKeys: {}
                    }
                }

                this.aggregateData.rowMap[rowName].total++;

                var key = this.getColKey(row);
                if (!this.aggregateData.rowMap[rowName].colKeys[key])
                    this.aggregateData.rowMap[rowName].colKeys[key] = 0;

                this.aggregateData.rowMap[rowName].colKeys[key]++;

                var parentNode = this.aggregateData.rowMap[rowName];
                Ext4.each(this.colFields, function(colField){
                    var value = this.getValue(row, colField);
                    this.ensureValue(this.valueMap, colField, value);

                    if (!parentNode.children[value]){
                        parentNode.children[value] = {
                            total: 0,
                            children: {}
                        }

                        parentNode = parentNode.children[value];
                    }
                }, this);
            }
        }, this);
    },

    onLoad: function(){
        var target = this.down('#populationPanel');
        var toAdd = [];

        if (!this.rawData || !this.rawData.rowCount){
            target.removeAll();
            target.add({
                html: 'No animals were found'
            });
            return;
        }

        //header rows.  first add 2 for rowname/total
        var rows = [];
        var repeats = 1;
        var keys = [];
        Ext4.each(this.colFields, function(colName, idx){
            var colspan = this.getColSpan(this.colFields, idx);
            if (idx == 0){
                rows.push({html: ''});
                rows.push({
                    html: 'Total',
                    style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;'
                });
            }
            else {
                rows.push({html: ''});
                rows.push({html: ''});
            }

            var valueArray = this.valueMap[colName];
            for (var i=0;i<repeats;i++){
                Ext4.each(valueArray, function(header, j){
                    LDK.Assert.assertNotEmpty('Population panel has a blank header value for the column: ' + colName + '.  This probably indicates bad data.', header);
                    if (!header)
                        header = 'Unknown ' + colName;

                    var style = (idx == 0 ? 'border-bottom: solid 1px;' : '') + 'text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;';

                    rows.push({
                        html: header,
                        style: style,
                        colspan: colspan
                    });
                }, this);
            }

            repeats = valueArray ? repeats * valueArray.length : 0;
        }, this);

        //now append the data rows
        var colKeys = this.generateColKeys();
        var rowNames = this.valueMap[this.rowField];
        rowNames.sort();
        Ext4.each(rowNames, function(rowName){
            rowName = Ext4.isEmpty(rowName) ? 'Blank' : rowName;
            rows.push({
                html: rowName + ':',
                style: 'padding-left: 10px;padding-bottom:3px;padding-right: 5px;'
            });

            //total count
            var params = {
                schemaName: 'study',
                'query.queryName': 'Demographics',
                'query.viewName': 'By Location'
            };
            params['query.' + this.rowField + '~eq'] = rowName;
            this.appendFilterParams(params);

            var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, params);
            rows.push({
                html: '<a href="' + url + '">' + (this.aggregateData.rowMap[rowName] ? this.aggregateData.rowMap[rowName].total : 0) + '</a>'
            });

            var parentData = this.aggregateData.rowMap[rowName] || {};
            Ext4.each(colKeys, function(key){
                var value = 0;
                if (parentData && parentData.colKeys && parentData.colKeys[key]) {
                    value = parentData.colKeys[key];
                }

                var params = {
                    schemaName: 'study',
                    'query.queryName': 'Demographics',
                    'query.viewName': 'By Location'
                };
                var tokens = key.split('<>');

                params['query.' + this.rowField + '~eq'] = rowName;
                Ext4.each(this.colFields, function(colField, idx){
                    var meta = this.getMetadata(colField);
                    var fk = meta.displayField || meta.fieldKeyPath;
                    params['query.' + fk + '~eq'] = tokens[idx];
                }, this);

                this.appendFilterParams(params);
                var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, params);
                rows.push({
                    html: '<a href="' + url + '">' + value + '</a>',
                    width: 60
                });
            }, this);
        }, this);

        toAdd.push({
            layout: {
                type: 'table',
                columns: this.getTotalColumns()
            },
            defaults: {
                border: false,
                style: 'text-align: center;padding: 4px'
            },
            items: rows
        });

        target.removeAll();
        target.add(toAdd);
    },

    appendFilterParams: function(params){
        Ext4.each(this.filterArray, function(filter){
            params[filter.getURLParameterName()] = filter.getURLParameterValue();
        }, this);
        return params;
    },

    getMetadata: function(name){
        var meta;
        Ext4.each(this.rawData.metaData.fields, function(field){
            if (field.name == name){
                meta = field;
                return false;
            }
        }, this);
        return meta;
    },

    getTotalColumns: function(){
        var total = 1;
        Ext4.each(this.colFields, function(colField){
            var valueArray = this.valueMap[colField];
            total = valueArray ? total * valueArray.length : 0;
        }, this);

        total += 2;

        return total;
    },

    getColSpan: function(colFields, idx){
        idx++;

        var length = 1;
        for (var i=idx;i<colFields.length;i++){
            var name = colFields[i];
            length = this.valueMap[name] ? length * this.valueMap[name].length : 0;
        }
        return length;
    },

    generateColKeys: function(){
        var keys = [];
        Ext4.each(this.colFields, function(colField, j){
            var valueArray = this.valueMap[colField];
            var newKeys = [];
            if (!keys.length){
                newKeys = keys.concat(valueArray);
            }
            else {
                Ext4.each(keys, function(key){
                    Ext4.each(valueArray, function(value){
                        newKeys.push((key ? key : '') + '<>' + value);
                    }, this);
                }, this);
            }

            keys = newKeys;
        }, this);

        return keys;
    }
});