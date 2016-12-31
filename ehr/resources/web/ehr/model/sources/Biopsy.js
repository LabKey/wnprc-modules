/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Biopsy', {
    allQueries: {

    },
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Biopsy'
            },
            chargetype: {
                allowBlank: true
            },
            assistingstaff: {
                allowBlank: true,
                hidden: true
            },
            procedureid: {
                getInitialValue: function(val, record){
                    if (val){
                        return val;
                    }

                    var procedureStore = EHR.DataEntryUtils.getProceduresStore();
                    LDK.Assert.assertNotEmpty('Unable to find procedureStore from Biopsy.js', procedureStore);

                    if (LABKEY.ext4.Util.hasStoreLoaded(procedureStore)){
                        var procRecIdx = procedureStore.findExact('name', 'Biopsy');
                        var procedureRec = procedureStore.getAt(procRecIdx);
                        LDK.Assert.assertNotEmpty('Unable to find procedure record with name Biopsy from Biopsy.js', procedureRec);

                        return procedureRec ? procedureRec.get('rowid') : null;
                    }
                    else {
                        console.log('procedure store not loaded');
                        procedureStore.on('load', function(store){
                            var procRecIdx = store.findExact('name', 'Biopsy');
                            var procedureRec = store.getAt(procRecIdx);
                            LDK.Assert.assertNotEmpty('Unable to find procedure record with name Biopsy after load from Biopsy.js', procedureRec);

                            if (procedureRec){
                                record.set('procedureid', procedureRec.get('rowid'));
                            }
                        }, this, {single: true});
                    }

                    return null;
                }
            },
            caseno: {
                xtype: 'ehr-pathologycasenofield',
                hidden: false,
                editorConfig: {
                    casePrefix: 'B',
                    encounterType: 'Biopsy'
                }
            }
        }
    }
});