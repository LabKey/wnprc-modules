/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddBehaviorCasesWindow', {
    extend: 'EHR.window.AddSurgicalCasesWindow',
    caseCategory: 'Behavior',
    templateName: null,

    allowNoSelection: true,
    showAssignedVetCombo: false,
    showAllowOpen: true,
    defaultRemark: 'BSU Rounds Entered',

    getCases: function(button){
        Ext4.Msg.wait("Loading...");
        this.hide();

        var casesFilterArray = this.getCasesFilterArray();
        var obsFilterArray = this.getBaseFilterArray();
        obsFilterArray.push(LABKEY.Filter.create('caseCategory', this.caseCategory, LABKEY.Filter.Types.EQUAL));
        var includeOpen = this.down('#includeOpen') ? this.down('#includeOpen').getValue() : false;
        if (includeOpen){
            obsFilterArray.push(LABKEY.Filter.create('caseIsOpen', true, LABKEY.Filter.Types.EQUAL));
        }
        else {
            obsFilterArray.push(LABKEY.Filter.create('caseIsActive', true, LABKEY.Filter.Types.EQUAL));
        }

        //find distinct animals matching criteria
        var multi = new LABKEY.MultiRequest();

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'latestObservationsForCase',
            columns: 'Id,date,category,area,observation,remark,caseid',
            filterArray: obsFilterArray,
            scope: this,
            success: function(results){
                this.obsResults = results;
            },
            failure: LDK.Utils.getErrorCallback()
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'cases',
            sort: 'Id/curLocation/location,Id,remark',
            columns: 'Id,objectid',
            filterArray: casesFilterArray,
            scope: this,
            success: function(results){
                this.casesResults = results;
            },
            failure: LDK.Utils.getErrorCallback()
        });

        multi.send(this.onSuccess, this);
    },

    //@Override.  this is to skip the duplicate case check
    addRecords: function(records){
        this.doAddRecords(records);
    },

    //@Override.  this is to skip the duplicate case check
    doAddRecords: function(records){
        this.processObservations(records);
    },

    //apply previous observations, or inser a blank obs record.
    processObservations: function(caseRecords){
        //find all distinct IDs with cases.
        var distinctCaseIds = [];
        if (caseRecords && caseRecords.length){
            Ext4.Array.forEach(caseRecords, function(cr){
                if (distinctCaseIds.indexOf(cr.get('caseid') == -1)){
                    distinctCaseIds.push(cr.get('caseid'));
                }
            }, this);
        }

        var previousObsMap = {};
        if (this.obsResults && this.obsResults.rows && this.obsResults.rows.length){
            Ext4.Array.forEach(this.obsResults.rows, function(sr){
                var row = new LDK.SelectRowsRow(sr);

                //note: this has been changed to ensure 1 row per case
                var key = row.getValue('caseid');
                if (!previousObsMap[key])
                    previousObsMap[key] = [];

                previousObsMap[key].push({
                    Id: row.getValue('Id'),
                    date: this.recordData.date,
                    performedby: this.recordData.performedby,
                    caseid: row.getValue('caseid'),
                    category: row.getValue('category'),
                    area: row.getValue('area'),
                    //dont copy value
                    //observation: row.getValue('observation'),
                    remark: row.getValue('remark')
                });
            }, this);
        }

        var obsRecords = [];
        var obsStore = this.targetStore.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Unable to find Clinical Observations store', obsStore);

        var treatmentRecords = [];
        var treatmentStore = this.targetStore.storeCollection.getClientStoreByName('Drug Administration');
        LDK.Assert.assertNotEmpty('Unable to find Drug Administration store', treatmentStore);

        Ext4.Array.forEach(caseRecords, function(cr){
            if (previousObsMap[cr.get('caseid')]){
                Ext4.Array.forEach(previousObsMap[cr.get('caseid')], function(r){
                    r = Ext4.apply(r, {
                        'Id/curLocation/location': cr.get('Id/curLocation/location')
                    });

                    obsRecords.push(obsStore.createModel(r));
                }, this);
            }
            else {
                obsRecords.push(obsStore.createModel({
                    'Id/curLocation/location': cr.get('Id/curLocation/location'),
                    Id: cr.get('Id'),
                    date: this.recordData.date,
                    performedby: this.recordData.performedby,
                    caseid: cr.get('caseid')
                }));
            }

            treatmentRecords.push(treatmentStore.createModel({
                Id: cr.get('Id'),
                caseid: cr.get('caseid'),
                date: this.recordData.date,
                performedby: this.recordData.performedby
            }));
        }, this);

        if (obsRecords.length){
            obsStore.add(obsRecords);
        }

        if (treatmentRecords.length){
            treatmentStore.add(treatmentRecords);
        }

        Ext4.Msg.hide();
        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('ADDBEHAVIORCASES', function(config){
    return Ext4.Object.merge({
        text: 'Add Open Cases',
        tooltip: 'Click to automatically add animals with open cases',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddBehaviorCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
