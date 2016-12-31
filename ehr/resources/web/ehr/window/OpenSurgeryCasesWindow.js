/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg sourceStore
 */
Ext4.define('EHR.window.OpenSurgeryCasesWindow', {
    extend: 'Ext.window.Window',
    minWidth: 600,
    minHeight: 200,

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Open Cases',
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'Loading...',
                border: false
            }],
            buttons: [{
                text: 'Open Selected Cases',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        this.getDemographics();
    },

    getDemographics: function(){
        var ids = [];
        this.sourceStore.each(function(rec){
            if (!rec.get('Id')){
                return;
            }

            ids.push(rec.get('Id'));
        }, this);

        ids = Ext4.unique(ids);
        EHR.DemographicsCache.getDemographics(ids, this.onLoad, this);
    },

    onLoad: function(ids, demographicsMap){
        var animalMap = {};
        var columns = 6;

        this.sourceStore.each(function(rec, recIdx){
            if (!rec.get('Id') || !rec.get('procedureid')){
                return;
            }

            animalMap[rec.get('Id')] = animalMap[rec.get('Id')] || {
                encounterRecords: [],
                procedureRecords: [],
                procedureNames: [],
                maxFollowup: 0
            };

            var procedureStore = EHR.DataEntryUtils.getProceduresStore();
            var procedureRecIdx = procedureStore.findExact('rowid', rec.get('procedureid'));
            LDK.Assert.assertTrue('Unknown procedure id: ' + rec.get('procedureid'), procedureRecIdx != -1);
            if (procedureRecIdx == -1){
                return;
            }

            var procedureRec = procedureStore.getAt(procedureRecIdx);

            animalMap[rec.get('Id')].procedureRecords.push(procedureRec);
            animalMap[rec.get('Id')].procedureNames.push(procedureRec.get('name'));

            if (procedureRec.get('followupDays') > animalMap[rec.get('Id')].maxFollowup)
                animalMap[rec.get('Id')].maxFollowup = procedureRec.get('followupDays');

            animalMap[rec.get('Id')].encounterRecords.push(rec);
        }, this);

        var toAdd = [];
        var rowIdx = 0;
        for (var id in animalMap){
            var obj = animalMap[id];
            obj.procedureNames = Ext4.unique(obj.procedureNames);
            var ar = demographicsMap[id];
            rowIdx++;

            toAdd.push({
                xtype: 'displayfield',
                value: id,
                fieldName: 'Id',
                rowIdx: rowIdx
            });

            if (!ar || ar.getCalculatedStatus() != 'Alive'){
                toAdd.push({
                    xtype: 'displayfield',
                    value: 'Unknown or non-living animal Id, cannot open case',
                    colspan: columns - 1,
                    rowIdx: rowIdx
                });

                continue;
            }

            toAdd.push({
                xtype: 'displayfield',
                value: obj.procedureNames.join(', '),
                width: 200,
                rowIdx: rowIdx
            });

            toAdd.push({
                xtype: 'displayfield',
                value: obj.maxFollowup
            });

            var hasSurgCase = false;
            var caseRec = null;
            if (ar.getActiveCases()){
                Ext4.Array.forEach(ar.getActiveCases(), function(rec){
                    if (rec.category == 'Surgery'){
                        hasSurgCase = true;
                        caseRec = rec;
                    }
                }, this);
            }

            toAdd.push({
                xtype: 'textarea',
                fieldName: 'remark',
                height: 75,
                width: 250,
                rowIdx: rowIdx,
                value: caseRec ? ((caseRec.remark ? (caseRec.remark + '\n' + Ext4.Date.format(new Date(), 'Y-m-d') + ': ') : '') + obj.procedureNames.join(', ')) : 'Open Sx Case: ' + obj.procedureNames.join(', ')
            });

            toAdd.push({
                xtype: 'displayfield',
                value: hasSurgCase ? 'Y' : 'N',
                rowIdx: rowIdx,
                fieldName: 'caseId',
                caseId: caseRec ? caseRec.lsid : null
            });

            toAdd.push({
                xtype: 'checkbox',
                fieldName: 'exclude',
                encounterRecords: obj.encounterRecords,
                checked: (obj.maxFollowup === 0),
                rowIdx: rowIdx
            });
        }

        this.removeAll();

        if (toAdd.length){
            toAdd = [{
                html: 'Id'
            },{
                html: 'Procedure(s)'
            },{
                html: 'Followup Days',
                width: 80
            },{
                html: 'Case Description'
            },{
                html: 'Has Existing Case?',
                width: 80
            },{
                html: 'Skip Opening?',
                width: 70
            }].concat(toAdd);

            this.add({
                defaults: {
                    style: 'margin-right: 5px;',
                    border: false
                },
                border: false,
                layout: {
                    type: 'table',
                    columns: columns
                },
                items: toAdd
            });
        }
        else {
            this.add({
                html: 'No IDs To Show'
            });
        }
    },

    onSubmit: function(){
        var recordMap = {};
        var caseRecordsToInsert = [];
        var caseRecordsToUpdate = [];

        var success = true;
        var cbs = this.query('checkbox');
        Ext4.Array.forEach(cbs, function(cb){
            if (!cb.getValue()){
                var id = this.query('field[rowIdx=' + cb.rowIdx + '][fieldName=Id]')[0].getValue();
                var remark = this.query('field[rowIdx=' + cb.rowIdx + '][fieldName=remark]')[0].getValue();
                var existingCase = this.query('component[rowIdx=' + cb.rowIdx + '][fieldName=caseId]')[0].caseId;
                recordMap[id] = recordMap[id] || [];
                recordMap[id] = recordMap[id].concat(cb.encounterRecords);

                if (!remark){
                    Ext4.Msg.alert('Error', 'Must Enter A Remark For All Cases');
                    success = false;
                    return;
                }

                if (existingCase){
                    caseRecordsToUpdate.push({
                        lsid: existingCase,
                        remark: remark
                    });
                }
                else {
                    caseRecordsToInsert.push({
                        Id: id,
                        date: new Date(),
                        remark: remark,
                        category: 'Surgery',
                        performedby: LABKEY.Security.currentUser.displayName
                    });
                }
            }
        }, this);

        if (!success){
            return;
        }

        if (caseRecordsToInsert.length || caseRecordsToUpdate.length){
            this.hide();
            Ext4.Msg.wait('Loading...');
            var multi = new LABKEY.MultiRequest();

            if (caseRecordsToInsert.length){
                multi.add(LABKEY.Query.insertRows, {
                    schemaName: 'study',
                    queryName: 'cases',
                    rows: caseRecordsToInsert,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function(results){
                        if (!results || !results.rows){
                            return;
                        }

                        Ext4.Array.forEach(results.rows, function(row){
                            if (row.Id && row.objectid){
                                var records = recordMap[row.Id];
                                Ext4.Array.forEach(records, function(rec){
                                    console.log('updating procedure with caseid');
                                    rec.set('caseid', row.objectid);
                                }, this);
                            }
                        }, this);
                    }
                });
            }

            if (caseRecordsToUpdate.length){
                multi.add(LABKEY.Query.updateRows, {
                    schemaName: 'study',
                    queryName: 'cases',
                    rows: caseRecordsToUpdate,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function(results){
                        if (!results || !results.rows){
                            return;
                        }

                        Ext4.Array.forEach(results.rows, function(row){
                            if (row.Id && row.objectid){
                                var records = recordMap[row.Id];
                                Ext4.Array.forEach(records, function(rec){
                                    console.log('updating procedure with caseid')
                                    rec.set('caseid', row.objectid);
                                }, this);
                            }
                        }, this);
                    }
                });
            }

            multi.send(function(){
                this.close();
                Ext4.Msg.hide();
                Ext4.Msg.alert('Success', 'Surgical cases opened');
                EHR.DemographicsCache.clearCache(Ext4.Object.getKeys(recordMap));
            }, this);
        }
        else {
            this.close();
            Ext4.Msg.alert('Complete', 'There are no cases to open');
        }
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('OPENSURGERYCASES', {
    text: 'Open Cases',
    name: 'openSurgeryCase',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'openSurgeryCases',
    requiredPermissions: [
        [EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]]
    ],
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataentrypanel from OPENSURGERYCASES button', panel);

        //find id
        var clientStore = panel.storeCollection.getClientStoreByName('encounters') || panel.storeCollection.getClientStoreByName('Clinical Encounters');
        LDK.Assert.assertNotEmpty('Unable to find clientStore from OPENSURGERYCASES button', clientStore);

        if (!clientStore.getCount()){
            Ext4.Msg.alert('Error', 'No Surgeries Entered');
            return;
        }

        Ext4.create('EHR.window.OpenSurgeryCasesWindow', {
            sourceStore: clientStore
        }).show();
    }
});
