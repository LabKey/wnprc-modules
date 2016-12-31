/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalEncountersClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.onRecordUpdate(record, ['procedureid']);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('procedureid')){
            modifiedFieldNames = modifiedFieldNames || [];

            var lookupRec = this.getProcedureRecord(record.get('procedureid'));
            if (!lookupRec)
                return;

            if (lookupRec.get('remark')&& record.get('remark')== null){
                record.beginEdit();
                record.set('remark', lookupRec.get('remark'));
                record.endEdit(true);
            }
        }

        if (modifiedFieldNames && (modifiedFieldNames.indexOf('Id') > -1 || modifiedFieldNames.indexOf('project') > -1 || modifiedFieldNames.indexOf('chargetype') > -1)){
            if (record.get('objectid')){
                var toApply = {
                    Id: record.get('Id'),
                    project: record.get('project'),
                    chargetype: record.get('chargetype')
                };

                this.storeCollection.clientStores.each(function(cs){
                    if (cs.storeId == this.storeCollection.collectionId + '-' + 'encounters'){
                        return;
                    }

                    var projectField = cs.getFields().get('project');
                    var chargeTypeField = cs.getFields().get('chargetype');
                    var hasChanges = false;

                    if (cs.getFields().get('parentid')){
                        if (cs.getFields().get('Id') || cs.getFields().get('project')){
                            cs.each(function(r){
                                if (r.get('parentid') === record.get('objectid')){
                                    var obj = {};

                                    if (projectField){
                                        if (!r.get('project') || (projectField.inheritFromParent && r.get('project') !== record.get('project'))){
                                            obj.project = record.get('project');
                                        }
                                    }

                                    if (chargeTypeField){
                                        if (!r.get('chargetype') || (chargeTypeField.inheritFromParent && r.get('chargetype') !== record.get('chargetype'))){
                                            obj.chargetype = record.get('chargetype');
                                        }
                                    }

                                    if (r.get('Id') !== record.get('Id')){
                                        obj.Id = record.get('Id');
                                    }

                                    if (!Ext4.Object.isEmpty(obj)){
                                        r.beginEdit();
                                        r.set(obj);
                                        r.endEdit(true);
                                        hasChanges = true;
                                    }
                                }
                            }, this);
                        }
                    }

                    if (hasChanges){
                        cs.fireEvent('datachanged', cs);
                    }
                }, this);
            }
        }
    },

    getProcedureRecord: function(procedureId){
        var procedureStore = EHR.DataEntryUtils.getProceduresStore();
        LDK.Assert.assertNotEmpty('Unable to find procedureStore from ClinicalEncountersClientStore', procedureStore);
        var procRecIdx = procedureStore.findExact('rowid', procedureId);
        LDK.Assert.assertTrue('Unable to find procedure record in ClinicalEncountersClientStore for procedureId: [' + procedureId + ']', procRecIdx > -1);

        var procedureRec = procedureStore.getAt(procRecIdx);
        LDK.Assert.assertNotEmpty('Unable to find procedure record from ClinicalEncountersClientStore.  ProcedureId was: [' + procedureId + ']', procedureRec);

        return procedureRec;
    }
});
