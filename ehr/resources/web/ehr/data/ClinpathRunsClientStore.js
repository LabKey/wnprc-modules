/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.ClinpathRunsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            var modified = ['servicerequested'];
            if (record.get('chargetype')){
                modified.push('chargetype');
            }
            this.onRecordUpdate(record, modified);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('servicerequested')){
            modifiedFieldNames = modifiedFieldNames || [];

            var storeId = LABKEY.ext4.Util.getLookupStoreId({
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'labwork_services',
                    keyColumn: 'servicename',
                    displayColumn: 'servicename'
                }
            });

            var store = Ext4.StoreMgr.get(storeId);
            if (!store){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup store in ClinpathRunsClientStore'
                });
                console.error('Unable to find lookup store in ClinpathRunsClientStore');

                return;
            }

            var lookupRecIdx = store.findExact('servicename', record.get('servicerequested'));
            if (lookupRecIdx == -1){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup record in ClinpathRunsClientStore'
                });
                console.error('Unable to find lookup record in ClinpathRunsClientStore');

                return;
            }

            var lookupRec = store.getAt(lookupRecIdx);
            var params = {};
            if (lookupRec.get('dataset'))
                params.type = lookupRec.get('dataset');

            //NOTE: if setting both service and chargetype simultaneously, do not override that selection
            if (modifiedFieldNames.indexOf('servicerequested') > -1 && modifiedFieldNames.indexOf('chargetype') == -1 && lookupRec.get('chargetype')){
                //only update if using a standard value
                if (!record.get('chargetype') || record.get('chargetype') == 'Clinpath' || record.get('chargetype') == 'SPF Surveillance Lab')
                    params.chargetype = lookupRec.get('chargetype');
            }

            if (modifiedFieldNames.indexOf('servicerequested') > -1 && lookupRec.get('tissue')){
                params.tissue = lookupRec.get('tissue');
            }

            if (!LABKEY.Utils.isEmptyObj(params)){
                record.beginEdit();
                record.set(params);
                record.endEdit(true);
            }
        }

        //also cascade update children if Id/date changes
        if (modifiedFieldNames && (modifiedFieldNames.indexOf('Id') > -1 || modifiedFieldNames.indexOf('project') > -1)){
            if (record.get('objectid')){
                if (!this.storeCollection){
                    LDK.Utils.logError('this.storeCollection is null in ClinpathRunsClientStore');
                    return;
                }

                this.storeCollection.clientStores.each(function(cs){
                    if (cs.storeId == this.storeId){
                        return;
                    }

                    var hasProject = cs.getFields().get('project') != null;
                    var hasChanges = false;

                    if (cs.getFields().get('runid')){
                        if (cs.getFields().get('Id') || cs.getFields().get('project')){
                            cs.each(function(r){
                                if (r.get('runid') === record.get('objectid')){
                                    var obj = {};
                                    if (hasProject && r.get('project') !== record.get('project')){
                                        obj.project = record.get('project');
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
    }
});
