/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.LabworkResultsStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.updateUnits(record, ['testid'], true);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.updateUnits(record, modifiedFieldNames, true);

        this.callParent(arguments);
    },

    getLookupStore: function(){
        var field = this.getFields().get('testid');
        if (!field || !field.lookup)
            return;

        var storeId = LABKEY.ext4.Util.getLookupStoreId({
            lookup: {
                schemaName: field.lookup.schemaName,
                queryName: field.lookup.queryName,
                keyColumn: 'testid',
                displayColumn: 'testid'
            }
        });

        if (this.lookupStore){
            LDK.Assert.assertEquality('Store IDs do not match', storeId, this.lookupStore.storeId);
            return this.lookupStore;
        }

        var store = Ext4.StoreMgr.get(storeId);
        if (!store){
            LDK.Utils.logToServer({
                message: 'Unable to find lookup store in LabworkResultsStore'
            });

            return;
        }

        this.lookupStore = store;

        return this.lookupStore;
    },

    getLookupRec: function(keyCol, testId){
        this.lookupRecMap = this.lookupRecMap || {};

        if (this.lookupRecMap[testId]){
            return this.lookupRecMap[testId];
        }

        var store = this.getLookupStore();
        if (!store)
            return;

        var lookupRecIdx = store.findExact(keyCol, testId);
        if (lookupRecIdx == -1){
            LDK.Utils.logToServer({
                message: 'Unable to find lookup record in LabworkResultsStore'
            });

            return;
        }

        var lookupRec = store.getAt(lookupRecIdx);
        this.lookupRecMap[testId] = lookupRec;

        return lookupRec;
    },

    updateUnits: function(record, modifiedFieldNames, silent){
        if (record.fields.get('testid') && record.get('testid')){
            modifiedFieldNames = modifiedFieldNames || [];
            if (record.get('units') && modifiedFieldNames.indexOf('testid') == -1){
                return;
            }

            var field = this.getFields().get('testid');
            if (!field && !field.lookup)
                return;

            var lookupRec = this.getLookupRec(field.lookup.keyColumn, record.get('testid'));
            if (!lookupRec){
                return;
            }

            var params = {};
            if (lookupRec.get('units') && lookupRec.get('units') !== record.get('units'))
                params.units = lookupRec.get('units');

            if (!LABKEY.Utils.isEmptyObj(params)){
                record.beginEdit();
                record.set(params);
                record.endEdit(silent);
            }
        }
    }
});
