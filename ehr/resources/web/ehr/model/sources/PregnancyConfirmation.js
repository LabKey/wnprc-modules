/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('PregnancyConfirmation', {
    allQueries: {

    },
    byQuery: {
        'study.encounters': {
            procedureid: {
                getInitialValue: function(val, record){
                    if (val){
                        return val;
                    }

                    var procedureStore = EHR.DataEntryUtils.getProceduresStore();
                    LDK.Assert.assertNotEmpty('Unable to find procedureStore from PregnancyConfirmation.js', procedureStore);

                    if (LABKEY.ext4.Util.hasStoreLoaded(procedureStore)){
                        var procRecIdx = procedureStore.findExact('name', 'Ultrasound - Pregnancy');
                        var procedureRec = procedureStore.getAt(procRecIdx);
                        LDK.Assert.assertNotEmpty('Unable to find procedure record with name Ultrasound - Pregnancy from PregnancyConfirmation.js', procedureRec);

                        return procedureRec ? procedureRec.get('rowid') : null;
                    }
                    else {
                        console.log('procedure store not loaded');
                        procedureStore.on('load', function(store){
                            var procRecIdx = store.findExact('name', 'Ultrasound - Pregnancy');
                            var procedureRec = store.getAt(procRecIdx);
                            LDK.Assert.assertNotEmpty('Unable to find procedure record with name Ultrasound - Pregnancy after load from PregnancyConfirmation.js', procedureRec);

                            if (procedureRec){
                                record.set('procedureid', procedureRec.get('rowid'));
                            }
                        }, this, {single: true});
                    }

                    return null;
                }
            },
            chargetype: {
                defaultValue: 'No Charge',
                hidden: true
            }
        }
    }
});