/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.DemographicsCache', {
    singleton: true,
    extend: 'Ext.util.Observable',

    demographicsCache: {},
    expireThreshold:  30000, //30-second threshold

    constructor: function(){
        this.callParent(arguments);

        this.addEvents('cachechange', 'casecreated');
    },

    loadDemographics: function(animalIds, callback, scope){
        var ctx = EHR.Utils.getEHRContext();
        LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
        if (!ctx){
            return;
        }

        return LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'getDemographics', ctx['EHRStudyContainer']),
            method : 'POST',
            params: {
                ids: animalIds
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.getDemographicsCallback(animalIds, callback, scope), this)
        });
    },

    getDemographicsCallback: function(animalIds, callback, scope){
        return function(json){
            var ret = {};
            Ext4.Array.forEach(animalIds, function(animalId){
                if (json && json.results && json.results[animalId]){
                    json.results[animalId].loadTime = new Date();
                    this.demographicsCache[animalId] = json.results[animalId];

                    ret[animalId] = new EHR.DemographicsRecord(this.demographicsCache[animalId])
                }
            }, this);

            if (callback)
                callback.call(scope || this, animalIds, ret);
        }
    },

    getDemographicsSynchronously: function(animalIds){
        if (Ext4.isEmpty(animalIds)){
            return;
        }

        if (!Ext4.isArray(animalIds)){
            animalIds = [animalIds];
        }

        var ret = {};
        Ext4.Array.forEach(animalIds, function(animalId){
            if (this.demographicsCache[animalId]){
                var ms = (new Date()) - this.demographicsCache[animalId].loadTime;
                ret[animalId] = new EHR.DemographicsRecord(this.demographicsCache[animalId]);
            }
        }, this);

        return ret;
    },

    getDemographics: function(animalIds, callback, scope, threshold){
        if (Ext4.isEmpty(animalIds)){
            callback.call(scope || this, animalIds, null);
            return;
        }

        if (!Ext4.isArray(animalIds)){
            animalIds = [animalIds];
        }

        //reuse cached info if less than threshold
        threshold = Ext4.isNumeric(threshold) ? threshold : this.expireThreshold;

        var ret = {};
        var found = 0;
        Ext4.Array.forEach(animalIds, function(animalId){
            if (this.demographicsCache[animalId]){
                var ms = (new Date()) - this.demographicsCache[animalId].loadTime;
                if (ms < threshold || threshold == -1){
                    ret[animalId] = new EHR.DemographicsRecord(this.demographicsCache[animalId]);
                    found++;
                }
            }
        }, this);

        if (found == animalIds.length || !animalIds.length){
            if (callback)
                callback.call(scope || this, animalIds, ret);
        }
        else {
            this.loadDemographics(animalIds, callback, scope);
        }
    },

    /**
     *
     * @param Id the animal to clear.  If null, the entire cache will be cleared
     */
    clearCache: function(animalId){
        if (!animalId){
            this.demographicsCache = {};
        }
        else if (Ext4.isArray(animalId)) {
            for (var i=0;i<animalId.length;i++){
                this.demographicsCache[animalId[i]] = null;
                this.onCacheChange(animalId[i]);
            }
        }
        else {
            this.demographicsCache[animalId] = null;
            this.onCacheChange(animalId);
        }
    },

    onCacheChange: function(animalId){
        this.fireEvent('cachechange', animalId);
    },

    reportCaseCreated: function(animalId, category, caseId){
        this.fireEvent('casecreated', animalId, category, caseId);
    }
});