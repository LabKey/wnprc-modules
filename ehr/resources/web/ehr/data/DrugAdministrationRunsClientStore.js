/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.DrugAdministrationRunsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.formularyStore = EHR.DataEntryUtils.getFormularyStore();

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            var modified = ['code'];
            for (var field in this.fieldMap){
                if (record.fields.get(field) && !Ext4.isEmpty(record.get(field))){
                    modified.push(field);
                }
            }

            this.onRecordUpdate(record, modified);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    fieldMap: {
        concentration: 'concentration',
        conc_units: 'conc_units',
        dosage: 'dosage',
        dosage_units: 'dosage_units',
        volume: 'volume',
        vol_units: 'vol_units',
        amount: 'amount',
        amount_units: 'amount_units',
        frequency: 'frequency',
        route: 'route'
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('code')){
            modifiedFieldNames = modifiedFieldNames || [];

            if (modifiedFieldNames.indexOf('code') == -1){
                return;
            }

            if (!this.formularyStore){
                LDK.Utils.logToServer({
                    message: 'Unable to find formulary store in DrugAdministrationRunsClientStore'
                });
                console.error('Unable to find formulary store in DrugAdministrationRunsClientStore');

                return;
            }

            var values = this.formularyStore.getFormularyValues(record.get('code'));
            if (!Ext4.Object.isEmpty(values)){
                var params = {};

                for (var fieldName in this.fieldMap){
                    if (!this.getFields().get(fieldName)){
                        continue;
                    }

                    if (modifiedFieldNames.indexOf(this.fieldMap[fieldName]) != -1){
                        //console.log('field already set: ' + fieldName);
                        continue;
                    }

                    var def = values[fieldName];
                    if (Ext4.isDefined(def)){
                        params[this.fieldMap[fieldName]] = def;
                    }
                }

                if (!LABKEY.Utils.isEmptyObj(params)){
                    record.beginEdit();
                    record.set(params);
                    record.endEdit(true);
                }
            }
        }
    }
});
