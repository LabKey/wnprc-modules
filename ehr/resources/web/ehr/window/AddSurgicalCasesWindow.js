/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddSurgicalCasesWindow', {
    extend: 'EHR.window.AddClinicalCasesWindow',
    caseCategory: 'Surgery',
    templateName: 'Surgical Rounds',

    allowNoSelection: true,
    allowReviewAnimals: false,
    showAssignedVetCombo: false,
    caseDisplayField: 'remark',
    caseEmptyText: 'No description available',
    defaultRemark: 'Surgical rounds performed.',

    initComponent: function(){
        this.callParent(arguments);

        this.obsStore = this.targetStore.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddSurgicalCasesWindow', this.obsStore);
    },

    getCases: function(button){
        Ext4.Msg.wait("Loading...");
        this.hide();

        var casesFilterArray = this.getCasesFilterArray();
        var obsFilterArray = this.getBaseFilterArray();
        obsFilterArray.push(LABKEY.Filter.create('caseCategory', this.caseCategory, LABKEY.Filter.Types.EQUAL));
        obsFilterArray.push(LABKEY.Filter.create('caseIsActive', true, LABKEY.Filter.Types.EQUAL));

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
            sort: 'Id/curLocation/room_sortValue,Id/curLocation/cage_sortValue,Id,remark',
            columns: 'Id,objectid,remark,Id/curLocation/location',
            filterArray: casesFilterArray,
            scope: this,
            success: function(results){
                this.casesResults = results;
            },
            failure: LDK.Utils.getErrorCallback()
        });

        multi.send(this.onSuccess, this);
    },

    onSuccess: function(){
        if (!this.casesResults || !this.casesResults.rows || !this.casesResults.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No active cases were found' + (this.down('#excludeToday').getValue() ? ', excluding those reviewed today.' : '.'));
            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddSurgicalCasesWindow', this.targetStore);

        var records = [];
        var idMap = {};
        this.caseRecordMap = {};
        this.recordData = {
            performedby: this.down('#performedBy').getValue(),
            date: this.down('#date').getValue()
        };

        Ext4.Array.each(this.casesResults.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            idMap[row.getValue('Id')] = row;
            this.caseRecordMap[row.getValue('objectid')] = row;

            var obj = {
                Id: row.getValue('Id'),
                date: this.recordData.date,
                category: this.caseCategory,
                s: null,
                o: null,
                a: null,
                p: null,
                caseid: row.getValue('objectid'),
                remark: this.defaultRemark,
                performedby: this.recordData.performedby,
                'Id/curLocation/location': row.getValue('Id/curLocation/location')
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        //check for dupes
        this.addRecords(records);
    },

    doAddRecords: function(records){
        var toAdd = this.checkForExistingCases(records);
        this.targetStore.add(toAdd);
        if (toAdd.length){
            this.processObservations(records);
        }
        else {
            this.onComplete();
        }
    },

    processObservations: function(records){
        var previousObsMap = {};
        if (this.obsResults && this.obsResults.rows && this.obsResults.rows.length){
            Ext4.Array.forEach(this.obsResults.rows, function(sr){
                var row = new LDK.SelectRowsRow(sr);

                var caseId = row.getValue('caseid');
                if (!previousObsMap[caseId])
                    previousObsMap[caseId] = [];

                previousObsMap[caseId].push({
                    Id: row.getValue('Id'),
                    date: this.recordData.date,
                    performedby: this.recordData.performedby,
                    caseid: row.getValue('caseid'),
                    category: row.getValue('category'),
                    area: row.getValue('area'),
                    observation: row.getValue('observation'),
                    remark: row.getValue('remark')
                });
            }, this);
        }

        var toAdd = [];
        var recordsNeedingTemplate = [];
        Ext4.Array.forEach(records, function(rec){
            var caseId = rec.get('caseid');
            if (previousObsMap[caseId]){
                Ext4.Array.forEach(previousObsMap[caseId], function(obsRec){
                    toAdd.push(this.obsStore.createModel(obsRec));
                }, this);
            }
            else {
                console.log('no existing obs');
                recordsNeedingTemplate.push(rec)
            }
        }, this);

        if (toAdd.length){
            this.obsStore.add(toAdd);
        }

        if (recordsNeedingTemplate.length){
            this.applyObsTemplate(recordsNeedingTemplate);
        }
        else {
            Ext4.Msg.hide();
            this.close();
        }
    }
});

EHR.DataEntryUtils.registerGridButton('ADDSURGICALCASES', function(config){
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

            Ext4.create('EHR.window.AddSurgicalCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
