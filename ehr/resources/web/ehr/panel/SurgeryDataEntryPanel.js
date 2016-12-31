/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SurgeryDataEntryPanel', {
    extend: 'EHR.panel.TaskDataEntryPanel',

    onBeforeSubmit: function(btn){
        if (!btn || !btn.targetQC || ['Completed', 'Review Required'].indexOf(btn.targetQC) == -1){
            return;
        }

        var store = this.storeCollection.getClientStoreByName('encounters');
        LDK.Assert.assertNotEmpty('Unable to find encounters store', store);

        var ids = [];
        store.each(function(r){
            if (!r.get('procedureid')){
                return;
            }

            var procedureStore = EHR.DataEntryUtils.getProceduresStore();
            var procedureRecIdx = procedureStore.findExact('rowid', r.get('procedureid'));
            LDK.Assert.assertTrue('Unknown procedure id: ' + r.get('procedureid'), procedureRecIdx != -1);
            if (procedureRecIdx == -1){
                return;
            }

            var procedureRec = procedureStore.getAt(procedureRecIdx);
            if (!procedureRec || !procedureRec.get('followupDays')){
                return;
            }

            if (r.get('Id'))
                ids.push(r.get('Id'))
        }, this);
        ids = Ext4.unique(ids);

        if (!ids.length)
            return;

        EHR.DemographicsCache.getDemographics(ids, function(ids, idMap){
            var missingCases = [];
            Ext4.Array.forEach(ids, function(id){
                if (idMap[id]){
                    var cases = idMap[id].getActiveCases();
                    if (!cases || !cases.length){
                        missingCases.push(id);
                    }
                    else {
                        var found = false;
                        Ext4.Array.forEach(cases, function(c){
                            if (c.category == 'Surgery' && c.isActive){
                                found = true;
                            }
                        }, this);

                        if (!found){
                            missingCases.push(id);
                        }
                    }
                }
            }, this);

            if (missingCases.length){
                Ext4.Msg.confirm('No Case', 'There is no active surgery case for one or more animals, do you want to continue anyway?', function(val){
                    if (val == 'yes'){
                        this.onSubmit(btn, true);
                    }
                }, this);
            }
            else {
                this.onSubmit(btn, true);
            }
        }, this);

        return false;
    }
});