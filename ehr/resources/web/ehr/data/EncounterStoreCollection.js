/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.EncounterStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    getEncountersStore: function(){
        if (this.encountersStore){
            return this.encountersStore;
        }

        this.encountersStore = this.getClientStoreByName('encounters');
        LDK.Assert.assertNotEmpty('Unable to find clinical encounters store in EncountersStoreCollection', this.encountersStore);

        return this.encountersStore;
    },

    getEncountersRecord: function(parentid){
        if (!parentid){
            return null;
        }

        var encountersStore = this.getEncountersStore();
        var er;
        encountersStore.each(function(r){
            if (r.get('objectid') == parentid){
                er = r;
                return false;
            }
        }, this);

        return er;
    },

    onClientStoreUpdate: function(){
        this.doUpdateRecords();
        this.callParent(arguments);
    },

    setClientModelDefaults: function(model){
        this.callParent(arguments);

        var encountersStore = this.getEncountersStore();
        if (model.store && model.store.storeId == encountersStore.storeId){
            console.log('is encounters, skipping');
            return;
        }


        if (encountersStore.getCount() == 1){
            if (model.fields.get('parentid') && model.get('parentid') == null){
                model.data.parentid = encountersStore.getAt(0).get('objectid');
            }
        }

        if (model.fields.get('parentid') && model.get('parentid')){
            //find matching encounters record and update fields if needed
            var parentRec = this.getEncountersRecord(model.get('parentid'));
            if (parentRec){
                model.beginEdit();
                if (parentRec.get('Id') !== model.get('Id')){
                    model.set('Id', parentRec.get('Id'));
                }

                if (model.fields.get('date') && !model.get('date') && parentRec.get('date')){
                    model.set('date', parentRec.get('date'));
                }

                if (model.fields.get('project') && !model.get('project') && parentRec.get('project')){
                    model.set('project', parentRec.get('project'));
                }

                if (model.fields.get('chargetype') && !model.get('chargetype') && parentRec.get('chargetype')){
                    model.set('chargetype', parentRec.get('chargetype'));
                }

                model.endEdit(true);
            }
        }
    },

    doUpdateRecords: function(){
        var encountersStore = this.getEncountersStore();
        this.clientStores.each(function(cs){
            if (cs.storeId == encountersStore.storeId){
                return;
            }

            if (cs.getFields().get('Id') == null || cs.getFields().get('parentid') == null){
                return;
            }

            var isEncounterChild = cs.model.prototype.sectionCfg.configSources && cs.model.prototype.sectionCfg.configSources.indexOf('EncounterChild') > -1;
            cs.each(function(rec){
                var encountersRec = this.getEncountersRecord(rec.get('parentid'));
                if (encountersRec != null){
                    var obj = {};
                    if (rec.get('Id') !== encountersRec.get('Id')){
                        //the goal of this is to allow specific sections to avoid inheriting the Id of the parent
                        if (isEncounterChild || !encountersRec.get('Id'))
                            obj.Id = encountersRec.get('Id');

                        //if the ID doesnt match, clear parentid
                        if (!isEncounterChild){
                            obj.parentid = null;
                        }
                    }

                    var pf = rec.fields.get('project');
                    if (pf && encountersRec.get('project')){
                        if (!rec.get('project')){
                            obj.project = encountersRec.get('project');
                        }
                        else if (pf.inheritFromParent && encountersRec.get('project') !== rec.get('project')){
                            obj.project = encountersRec.get('project');
                        }
                    }

                    var cf = rec.fields.get('chargetype');
                    if (cf && encountersRec.get('chargetype')){
                        if (!rec.get('chargetype') || cf.inheritDateFromParent){
                            obj.chargetype = encountersRec.get('chargetype');
                        }
                    }

                    var df = rec.fields.get('date');
                    if (df && encountersRec.get('date')){
                        if (!rec.get('date') || df.inheritDateFromParent){
                            if (!Ext4.Date.isEqual(rec.get('date'), encountersRec.get('date')))
                                obj.date = encountersRec.get('date');
                        }
                    }

                    if (!Ext4.Object.isEmpty(obj)){
                        rec.beginEdit();
                        rec.set(obj);
                        rec.endEdit(true);

                        // this is a slight misuse of this event.  validation will queue and batch changes, rather than immediately updating each row
                        // individually.  this is better than doing them one-by-one in large grids
                        if (rec.store){
                            rec.store.fireEvent('validation', rec.store, rec);
                        }
                    }
                }
            }, this);
        }, this);
    }
});