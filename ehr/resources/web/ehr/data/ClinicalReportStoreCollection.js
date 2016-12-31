/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalReportStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    constructor: function(){
        this.callParent(arguments);

        this.mon(EHR.DemographicsCache, 'casecreated', this.onCaseCreated, this);
    },

    onCaseCreated: function(id, category, caseId){
        if (category != 'Clinical')
            return;

        //NOTE: if we opened a case from this form, tag the SOAP note
        var rec = this.getRemarksRec();
        if (rec && id == rec.get('Id')){
            if (!rec.get('caseid')){
                rec.set('caseid', caseId);
            }
        }
    },

    setClientModelDefaults: function(model){
        var vals = this.getDefaultValues();
        if (!Ext4.Object.isEmpty(vals)){
            var toSet = {};

            if (model.fields.get('Id') != null){
                toSet.Id = vals.Id;
            }
            if (model.fields.get('caseid') != null){
                toSet.caseid = vals.caseid;
            }

            if (!Ext4.isEmpty(toSet)){
                model.suspendEvents();
                model.set(toSet);
                model.resumeEvents();
            }
        }

        return this.callParent([model]);
    },

    getRemarksStore: function(){
        if (this.remarkStore){
            return this.remarkStore;
        }

        this.remarkStore = this.getClientStoreByName('Clinical Remarks');
        LDK.Assert.assertNotEmpty('Unable to find clinical remarks store in ClinicalReportStoreCollection', this.remarkStore);

        return this.remarkStore;
    },

    getRemarksRec: function(){
        var remarkStore = this.getRemarksStore();
        if (remarkStore){
            LDK.Assert.assertTrue('More than 1 record found in Clinical remarks store, actual: ' + remarkStore.getCount(), remarkStore.getCount() <= 1);
            if (remarkStore.getCount() == 1){
                return remarkStore.getAt(0);
            }
        }
    },

    getDefaultValues: function(){
        var rec = this.getRemarksRec();
        if (rec){
            return {
                Id: rec.get('Id'),
                caseid: rec.get('caseid')
            }
        }

        return null;
    },

    onClientStoreUpdate: function(){
        this.doUpdateRecords();
        this.callParent(arguments);
    },

    doUpdateRecords: function(){
        var newValues = this.getDefaultValues() || {};
        var cacheKey = newValues ? (newValues.Id + '||' + newValues.caseid) : null;

        if (cacheKey !== this._cachedKey){
            var remarkStore = this.getRemarksStore();
            this.clientStores.each(function(cs){
                if (cs.storeId == remarkStore.storeId){
                    return;
                }

                var toSet = {};

                if (cs.getFields().get('Id') != null){
                    toSet.Id = newValues.Id;
                }
                if (cs.getFields().get('caseid') != null){
                    toSet.caseid = newValues.caseid;
                }

                if (Ext4.Object.isEmpty(toSet)){
                    return;
                }

                var storeChanged = false;
                cs.suspendEvents();
                cs.each(function(rec){
                    var needsUpdate = false;
                    for (var field in toSet){
                        if (toSet[field] !== rec.get(field)){
                            needsUpdate = true;
                        }
                    }

                    if (needsUpdate){
                        storeChanged = true;
                        rec.set(toSet);
                    }
                }, this);
                cs.resumeEvents();

                if (storeChanged)
                    cs.fireEvent('datachanged', cs);
            }, this);
        }

        this._cachedKey = cacheKey;
    }
});