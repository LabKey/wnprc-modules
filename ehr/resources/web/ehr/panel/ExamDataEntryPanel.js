/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ExamDataEntryPanel', {
    extend: 'EHR.panel.TaskDataEntryPanel'

//    onBeforeSubmit: function(btn){
//        if (!btn || !btn.targetQC || ['Completed', 'Review Required'].indexOf(btn.targetQC) == -1){
//            return;
//        }
//
//        var store = this.storeCollection.getClientStoreByName('Clinical Remarks');
//        LDK.Assert.assertNotEmpty('Unable to find clinical remarks store', store);
//
//        var ids = [];
//        store.each(function(r){
//            if (r.get('Id'))
//                ids.push(r.get('Id'))
//        }, this);
//        ids = Ext4.unique(ids);
//
//        if (!ids.length)
//            return;
//
//        EHR.DemographicsCache.getDemographics(ids, function(ids, idMap){
//            var missingCases = [];
//            Ext4.Array.forEach(ids, function(id){
//                if (idMap[id]){
//                    var cases = idMap[id].getActiveCases();
//                    if (!cases || !cases.length){
//                        missingCases.push(id);
//                    }
//                    else {
//                        var found = false;
//                        Ext4.Array.forEach(cases, function(c){
//                            if (c.category == 'Clinical' && c.isActive){
//                                found = true;
//                            }
//                        }, this);
//
//                        if (!found){
//                            missingCases.push(id);
//                        }
//                    }
//                }
//            }, this);
//
//            if (missingCases.length){
//                Ext4.Msg.confirm('No Case', 'There is no active clinical case for this animal, do you want to continue anyway?', function(val){
//                    if (val == 'yes'){
//                        this.onSubmit(btn, true);
//                    }
//                    else {
//
//                    }
//                }, this);
//            }
//            else {
//                this.onSubmit(btn, true);
//            }
//        }, this);
//
//        return false;
//    }
});