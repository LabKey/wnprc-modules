/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.CopyFromCaseWindow', {
    extend: 'Ext.window.Window',

    encounterType: 'Necropsy',

    initComponent: function(){
        Ext4.apply(this, {
            width: 500,
            bodyStyle: 'padding: 5px;',
            closeAction: 'destroy',
            modal: true,
            title: 'Copy From Previous Case',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper will copy records from a previous case and pre-populate this form.  Please note, for the single-textbox fields (Gross Findings and Notes), this will delete any pre-existing text you have in the current form.  Otherwise it will append any new records to the section, keeping any records you may have already added to this form.  You can choose which sections to copy using the checkboxes below.',
                style: 'padding-bottom: 20px;'
            },{
                html: 'You can search using either Case No or Animal Id:',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'textfield',
                fieldLabel: 'Case No',
                itemId: 'caseField'
            },{
                xtype: 'textfield',
                fieldLabel: 'Animal Id',
                itemId: 'animalField'
            },{
                xtype: 'container',
                style: 'padding-top: 20px',
                items: this.getSections()
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    SECTIONS: {
        tissue_samples: {
            label: 'Tissues',
            targetStore: 'tissue_samples',
            schemaName: 'study',
            queryName: 'tissue_samples',
            columns: ['tissue', 'preparation', 'formSort', 'noWeight']
        },
        tissueDistributions: {
            label: 'Tissue Distributions',
            targetStore: 'tissueDistributions',
            schemaName: 'study',
            queryName: 'tissueDistributions',
            columns: ['tissue', 'sampletype', 'recipient', 'requestcategory', 'formSort']
        },
        measurements: {
            label: 'Tissue Measurements',
            targetStore: 'measurements',
            schemaName: 'study',
            queryName: 'measurements',
            columns: ['tissue', 'units', 'formSort']
        },
        histology: {
            label: 'Histologic Findings',
            targetStore: 'histology',
            schemaName: 'study',
            queryName: 'histology',
            columns: ['tissue', 'sort_order', 'remark', 'codesRaw', 'formSort']
        },
        pathologyDiagnoses: {
            label: 'Diagnoses',
            targetStore: 'pathologyDiagnoses',
            schemaName: 'study',
            queryName: 'pathologyDiagnoses',
            columns: ['sort_order', 'remark', 'codesRaw', 'formSort']
        },
        encounter_summaries: {
            label: 'Notes',
            targetStore: 'encounter_summaries',
            schemaName: 'ehr',
            queryName: 'encounter_summaries',
            shouldClearStore: true,
            columns: ['remark']
        },
        grossFindings: {
            label: 'Gross Findings',
            targetStore: 'grossFindings',
            schemaName: 'study',
            queryName: 'grossFindings',
            shouldClearStore: true,
            columns: ['remark', 'formSort']
        },
        encounter_participants: {
            label: 'Staff',
            targetStore: 'encounter_participants',
            schemaName: 'ehr',
            queryName: 'encounter_participants',
            columns: ['username', 'role']
        }
    },

    getSections: function(){
        var toAdd = [];

        var keys = Ext4.Object.getKeys(this.SECTIONS).sort();
        for (var i=0;i<keys.length;i++){
            var sectionName = keys[i];
            var targetStore = this.dataEntryPanel.storeCollection.getClientStoreByName(sectionName);
            if (targetStore){
                var cfg = Ext4.apply({}, this.SECTIONS[sectionName]);
                cfg.targetStore = targetStore;

                toAdd.push({
                    xtype: 'checkbox',
                    boxLabel: this.SECTIONS[sectionName].label,
                    sectionCfg: cfg
                });
            }
            else {
                console.log('Unable to find client store: ' + sectionName);
            }
        }

        return toAdd;
    },

    onSubmit: function(btn){
        //first find the animal
        var animalId = this.down('#animalField').getValue();
        var caseNo = this.down('#caseField').getValue();
        if (!animalId && !caseNo){
            Ext4.Msg.alert('Error', 'Must enter either a case or animal Id');
            return;
        }

        var cbs = this.query('checkbox[checked=true]');
        if (!cbs.length){
            Ext4.Msg.alert('Error', 'Must choose at least one section to copy');
            return;
        }

        Ext4.Msg.wait('Loading...');
        var filterArray = [];
        if (animalId){
            filterArray.push(LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL));
            filterArray.push(LABKEY.Filter.create('caseno', null, LABKEY.Filter.Types.NONBLANK));
        }
        else if (caseNo){
            filterArray.push(LABKEY.Filter.create('caseno', caseNo, LABKEY.Filter.Types.EQUAL));
        }

        filterArray.push(LABKEY.Filter.create('type', this.encounterType, LABKEY.Filter.Types.EQUAL));

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'encounters',
            columns: 'Id,objectid',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'No case found to copy');
            return;
        }

        var objectIds = [];
        Ext4.Array.forEach(results.rows, function(row){
            objectIds.push((new LDK.SelectRowsRow(row)).getValue('objectid'));
        }, this);

        objectIds = Ext4.unique(objectIds);

        if (objectIds.length > 1){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'More than 1 matching case found, cannot copy.  This may indicate a problem with the animal record');
            return;
        }

        var multi = new LABKEY.MultiRequest();
        this.recordsToAdd = [];

        Ext4.Array.forEach(this.query('checkbox[checked=true]'), function(cb){
            var section = cb.sectionCfg;

            multi.add(LABKEY.Query.selectRows, {
                requiredVersion: 9.1,
                schemaName: section.schemaName,
                queryName: section.queryName,
                columns: section.columns.join(','),
                sort: 'formSort',
                filterArray: [LABKEY.Filter.create('parentid', objectIds[0], LABKEY.Filter.Types.EQUAL)],
                scope: this,
                success: function(results){
                    console.log('Loaded: ' + section.label);

                    if (results && results.rows && results.rows.length){
                        var item = {
                            targetStore: section.targetStore,
                            shouldClearStore: section.shouldClearStore,
                            records: []
                        };

                        Ext4.Array.forEach(results.rows, function(r){
                            var row = new LDK.SelectRowsRow(r);

                            var obj = {};
                            Ext4.Array.forEach(section.columns, function(col){
                                obj[col] = row.getValue(col);
                            }, this);

                            item.records.push(item.targetStore.createModel(obj));
                        }, this);

                        this.recordsToAdd.push(item);
                    }
                },
                failure: LDK.Utils.getErrorCallback()
            });
        }, this);

        multi.send(this.onLoaded, this);
    },

    onLoaded: function(){
        Ext4.Array.forEach(this.recordsToAdd, function(item){
            if (item.records && item.records.length) {

                if (item.shouldClearStore) {
                    //NOTE: Ext4 does not seem to always fire the right events with removeAll(), and this should accomplish the same thing
                    item.targetStore.remove(item.targetStore.getRange());
                    LDK.Assert.assertEquality('Records not removed from target store in CopyFromCaseWindow', 0, item.targetStore.getCount());
                }

                item.targetStore.add(item.records);
            }
        }, this);

        Ext4.Msg.hide();
        this.close();
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('COPYFROMCASE', {
    text: 'Copy Previous Case',
    name: 'copyFromCase',
    itemId: 'copyFromCase',
    tooltip: 'Click to copy records from a previous case',
    handler: function(btn){
        var dataEntryPanel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find v in CopyFromCaseButton', dataEntryPanel);

        Ext4.create('EHR.window.CopyFromCaseWindow', {
            dataEntryPanel: dataEntryPanel
        }).show();
    }
});
