/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
 * This is used to convert the standard procedure form to use TB as the default procedure type
 * Added for backwards compatibility w/ certain areas of IRIS
 */
EHR.model.DataModelManager.registerMetadata('TBProcedure', {
    byQuery: {
        'study.encounters': {
            project: {
                hidden: true,
                getInitialValue: function(v, rec){
                    return v ? v : EHR.DataEntryUtils.getDefaultClinicalProject();
                }
            },
            procedureid: {
                getInitialValue: function(val, record){
                    if (val){
                        return val;
                    }

                    var procedureStore = EHR.DataEntryUtils.getProceduresStore();
                    LDK.Assert.assertNotEmpty('Unable to find procedureStore from TBProcedure.js', procedureStore);

                    if (LABKEY.ext4.Util.hasStoreLoaded(procedureStore)){
                        var procRecIdx = procedureStore.findExact('name', 'TB Test Intradermal');
                        var procedureRec = procedureStore.getAt(procRecIdx);
                        LDK.Assert.assertNotEmpty('Unable to find procedure record with name TB Test Intradermal from TBProcedure.js', procedureRec);

                        return procedureRec ? procedureRec.get('rowid') : null;
                    }
                    else {
                        console.log('procedure store not loaded');
                        procedureStore.on('load', function(store){
                            var procRecIdx = store.findExact('name', 'TB Test Intradermal');
                            var procedureRec = store.getAt(procRecIdx);
                            LDK.Assert.assertNotEmpty('Unable to find procedure record with name TB Test Intradermal after load from TBProcedure.js', procedureRec);

                            if (procedureRec){
                                record.set('procedureid', procedureRec.get('rowid'));
                            }
                        }, this, {single: true});
                    }

                    return null;
                }
            },
            type: {
                defaultValue: 'Procedure',
                hidden: true
            },
            chargetype: {
                defaultValue: 'No Charge',
                hidden: true
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            enddate: {
                hidden: true
            },
            instructions: {
                hidden: true
            },
            remark: {
                hidden: true
            }
        }
    }
});