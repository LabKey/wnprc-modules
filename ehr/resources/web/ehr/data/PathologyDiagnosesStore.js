/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 *
 */
Ext4.define('EHR.data.PathologyDiagnosesStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.onRecordUpdate(record);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    getSortMap: function(toSkip){
        var map = {};
        this.each(function(r){
            if (r === toSkip){
                return;
            }

            if (r.get('sort_order')){
                if (!map[r.get('sort_order')]){
                    map[r.get('sort_order')] = [];
                }

                map[r.get('sort_order')].push(r);
            }
        }, this);

        return map;
    },

    getNextSortOrder: function(){
        var maxVal = 0;
        this.each(function(r){
            if (r.get('sort_order') > maxVal){
                maxVal = r.get('sort_order');
            }
        }, this);

        maxVal++;

        return maxVal;
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (this.getFields().get('sort_order')){
            this.updateSortOrder(record);
        }
    },

    updateSortOrder: function(record){
        var params = {};
        var sort_order = record.get('sort_order');
        if (Ext4.isEmpty(record.get('sort_order'))){
            params.sort_order = this.getNextSortOrder();
            sort_order = params.sort_order;
        }

        var map = this.getSortMap(record);
        if (map[sort_order]){
            var keys = [];
            for (var key in map){
                keys.push(Number(key));
            }
            keys.sort();

            var updatedRecords = [];
            var nextValue = sort_order;
            Ext4.Array.forEach(keys, function(key){
                if (Ext4.isNumeric(key)){
                    key = Number(key);
                }

                if (key >= sort_order){
                    var records = map[key];
                    Ext4.Array.forEach(records, function(r){
                        nextValue++;
                        if (nextValue != r.get('sort_order')){
                            r.beginEdit();
                            r.set('sort_order', nextValue);
                            r.endEdit(true);
                            updatedRecords.push(r);
                        }
                    }, this);
                }
            }, this);
        }

        if (!LABKEY.Utils.isEmptyObj(params)){
            record.beginEdit();
            record.set(params);
            record.endEdit(true);
        }

        if (updatedRecords){
            Ext4.Array.forEach(updatedRecords, function(r){
                this.fireEvent('update', this, r);
            }, this);
        }
    }
});
