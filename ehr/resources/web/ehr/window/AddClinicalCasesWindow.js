/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddClinicalCasesWindow', {
    extend: 'Ext.window.Window',
    caseCategory: 'Clinical',
    templateName: 'Limited Visual Exam',
    templateStoreId: 'Clinical Observations',

    allowNoSelection: false,
    allowReviewAnimals: true,
    showAssignedVetCombo: true,
    caseDisplayField: 'problemCategories',
    caseEmptyText: 'There are no problems associated with this case',
    showAllowOpen: false,

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Add Open ' + this.caseCategory + ' Cases',
            border: true,
            bodyStyle: 'padding: 5px',
            width: 420,
            defaults: {
                width: 400,
                labelWidth: 150,
                border: false
            },
            items: [{
                html: 'This helper allows you to query open cases and add records for these animals.' +
                    (this.allowNoSelection ? '  Leave blank to load all areas.' : ''),
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'ehr-areafield',
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'textarea',
                fieldLabel: 'Animal(s)',
                itemId: 'idField'
            },{
                xtype: 'ehr-vetfieldcombo',
                fieldLabel: 'Assigned Vet (blank for all)',
                itemId: 'assignedVet',
                hidden: !this.showAssignedVetCombo,
                checked: true
            },{
                xtype: 'xdatetime',
                fieldLabel: 'Date',
                value: new Date(),
                itemId: 'date'
            },{
                xtype: 'textfield',
                fieldLabel: 'Entered By',
                value: LABKEY.Security.currentUser.displayName,
                itemId: 'performedBy'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Exclude Animals w/ Obs Entered Today',
                itemId: 'excludeToday',
                checked: true
            },{
                xtype: 'checkbox',
                fieldLabel: 'Include Cases Closed For Review',
                hidden: !this.showAllowOpen,
                itemId: 'includeOpen',
                checked: false
            },{
                xtype: 'checkbox',
                hidden: !this.allowReviewAnimals,
                fieldLabel: 'Review Animals First',
                itemId: 'reviewAnimals'
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.getCases
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        if (this.templateName){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplates',
                filterArray: [
                    LABKEY.Filter.create('title', this.templateName),
                    LABKEY.Filter.create('formtype', 'Clinical Observations'),
                    LABKEY.Filter.create('category', 'Section')
                ],
                scope: this,
                success: function(results){
                    LDK.Assert.assertTrue('Unable to find template: ' + this.templateName, results.rows && results.rows.length == 1);

                    this.obsTemplateId = results.rows[0].entityid;
                },
                failure: LDK.Utils.getErrorCallback()
            });
        }
    },

    getCasesFilterArray: function(){
        var filterArray = this.getBaseFilterArray();
        if (!filterArray)
            return;

        var includeOpen = this.down('#includeOpen') ? this.down('#includeOpen').getValue() : false;
        if (includeOpen){
            filterArray.push(LABKEY.Filter.create('isOpen', true, LABKEY.Filter.Types.EQUAL));
        }
        else {
            filterArray.push(LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL));
        }
        filterArray.push(LABKEY.Filter.create('category', this.caseCategory, LABKEY.Filter.Types.EQUAL));

        if (this.down('#excludeToday').getValue()){
            filterArray.push(LABKEY.Filter.create('daysSinceLastRounds', 0, LABKEY.Filter.Types.GT));
        }

        var assignedVetField = this.down('#assignedVet');
        if (assignedVetField && assignedVetField.getValue()){
            filterArray.push(LABKEY.Filter.create('assignedvet', assignedVetField.getValue(), LABKEY.Filter.Types.EQUAL));
        }

        return filterArray;
    },

    getBaseFilterArray: function(){
        var area = this.down('#areaField').getValue() || [];
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];
        var ids = this.down('#idField').getValue();
        ids = LDK.Utils.splitIds(ids);

        if (!this.allowNoSelection && !area.length && !rooms.length && !ids.length){
            Ext4.Msg.alert('Error', 'Must provide at least one room or an area');
            return;
        }

        if (ids.length && (rooms.length || area.length)){
            Ext4.Msg.alert('Error', 'Cannot search on both location and IDs at the same time');
            return;
        }

        var filterArray = [];

        if (area.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (ids.length)
            filterArray.push(LABKEY.Filter.create('Id', ids.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getCases: function(button){
        var filterArray = this.getCasesFilterArray();
        if (!filterArray || !filterArray.length){
            return;
        }

        Ext4.Msg.wait("Loading...");
        this.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'cases',
            sort: 'Id/curlocation/room_sortValue,Id/curlocation/cage_sortValue,Id',
            columns: 'Id,Id/curLocation/location,objectid,mostRecentP2,Id/Utilization/use,problemCategories',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No active cases were found' + (this.down('#excludeToday').getValue() ? '.  Note: you selected to exclude those with obs today.' : '.'));
            this.close();

            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddClinicalCasesWindow', this.targetStore);

        var records = [];
        this.caseRecordMap = {};
        this.recordData = {
            performedby: this.down('#performedBy').getValue(),
            date: this.down('#date').getValue()
        }

        var idMap = {};

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            idMap[row.getValue('Id')] = row;
            this.caseRecordMap[row.getValue('objectid')] = row;

            var obj = {
                Id: row.getValue('Id'),
                date: this.recordData.date,
                category: 'Clinical',
                s: null,
                o: null,
                a: null,
                p: null,
                p2: row.getValue('mostRecentP2'),
                caseid: row.getValue('objectid'),
                remark: null,
                performedby: this.recordData.performedby,
                'Id/curLocation/location': row.getValue('Id/curLocation/location')
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        if (this.down('#reviewAnimals').getValue()){
            this.doReviewAnimals(records, idMap);
        }
        else {
            this.addRecords(records);
        }
    },

    doReviewAnimals: function(caseRecords, idMap){
        var toAdd = [{
            html: 'Id'
        },{
            html: 'Projects/Groups'
        },{
            html: 'Include'
        }];

        Ext4.Array.forEach(caseRecords, function(rec){
            var ar = idMap[rec.get('Id')];

            toAdd.push({
                html: rec.get('Id')
            });

            toAdd.push({
                html: ar.getDisplayValue('Id/Utilization/use') ? ar.getDisplayValue('Id/Utilization/use') : 'None'
            });

            toAdd.push({
                xtype: 'checkbox',
                record: rec,
                checked: true
            });
        }, this);

        Ext4.Msg.hide();
        Ext4.create('Ext.window.Window', {
            title: 'Choose Animals To Add',
            ownerWindow: this,
            closeAction: 'destroy',
            width: 450,
            modal: true,
            defaults: {
                border: false
            },
            items: [{
                border: false,
                bodyStyle: 'padding: 5px;',
                items: [{
                    border: false,
                    defaults: {
                        border: false,
                        style: 'margin-right: 10px;'
                    },
                    maxHeight: Ext4.getBody().getHeight() * 0.8,
                    autoScroll: true,
                    layout: {
                        type: 'table',
                        columns: 3
                    },
                    items: toAdd
                },{
                    layout: 'hbox',
                    style: 'padding-top: 15px;',
                    border: false,
                    items: [{
                        xtype: 'ldk-linkbutton',
                        text: '[Check All]',
                        handler: function(btn){
                            var cbs = btn.up('window').query('checkbox');
                            Ext4.Array.forEach(cbs, function(item){
                                item.setValue(true);
                            });
                        }
                    },{
                        border: false,
                        html: '&nbsp;'
                    },{
                        xtype: 'ldk-linkbutton',
                        style: 'margin-left:5px;',
                        text: '[Uncheck All]',
                        handler: function(btn){
                            var cbs = btn.up('window').query('checkbox');
                            Ext4.Array.forEach(cbs, function(item){
                                item.setValue(false);
                            });
                        }
                    }]
                }]
            }],
            buttons: [{
                xtype: 'button',
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                xtype: 'button',
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        }).show();
    },

    onSubmit: function(btn){
        var win = btn.up('window');
        var cbs = win.query('checkbox');

        var records = [];
        Ext4.Array.forEach(cbs, function(cb){
            if (cb.getValue()){
                records.push(cb.record);
            }
        }, this);

        win.close();

        if (records.length){
            Ext4.Msg.wait('Loading...');
            this.addRecords(records);
        }
        else {
            win.ownerWindow.close();
        }
    },

    addRecords: function(records){
        //check for duplicates
        var ids = [];
        var duplicateIds = [];
        Ext4.Array.forEach(records, function(r){
            if (ids.indexOf(r.get('Id')) > -1){
                duplicateIds.push(r.get('Id'));
            }
            else {
                ids.push(r.get('Id'));
            }
        }, this);

        if (!duplicateIds.length){
            this.doAddRecords(records);
        }
        else {
            var items = [{
                html: 'Below are animals with multiple open cases.  For each animal, select the case to review.  Leave blank to skip that animal.',
                style: 'padding-bottom: 10px;',
                border: false
            }];

            duplicateIds = duplicateIds.sort();
            Ext4.Array.forEach(duplicateIds, function(id){
                //find matching records
                var data = [];
                Ext4.Array.forEach(records, function(r){
                    if (r.get('Id') == id){
                        var caseRec = this.caseRecordMap[r.get('caseid')];
                        LDK.Assert.assertNotEmpty('Unable to find case record', caseRec);

                        data.push({
                            value: r.get('caseid'),
                            display: caseRec.getValue(this.caseDisplayField) || this.caseEmptyText,
                            caseRecord: r
                        });
                    }
                }, this);

                items.push({
                    xtype: 'combo',
                    fieldLabel: id,
                    animalId: id,
                    width: 400,
                    queryMode: 'local',
                    valueField: 'value',
                    displayField: 'display',
                    store: {
                        type: 'store',
                        fields: ['value', 'display', 'record'],
                        data: data
                    }
                });
            }, this);

            Ext4.Msg.hide();
            Ext4.create('Ext.window.Window', {
                modal: true,
                title: 'Duplicate Open Cases',
                bodyStyle: 'padding: 5px',
                width: 450,
                items: items,
                buttons: [{
                    text: 'Submit',
                    scope: this,
                    handler: function(btn){
                        var win = btn.up('window');
                        var combos = win.query('combo');
                        var map = {};
                        Ext4.Array.forEach(combos, function(c){
                            map[c.animalId] = c.getValue();
                        }, this);

                        var nonDupes = [];
                        Ext4.Array.forEach(records, function(r){
                            if (!r){
                                console.log('no record');
                                return;
                            }

                            if (map.hasOwnProperty(r.get('Id')) && r.get('caseid') != map[r.get('Id')]){
                                //no need to actually remove.
                                //records.remove(r);
                            }
                            else {
                                nonDupes.push(r);
                            }
                        }, this);

                        win.close();
                        this.doAddRecords(nonDupes);
                    }
                },{
                    text: 'Cancel',
                    scope: this,
                    handler: function(btn){
                        btn.up('window').close();
                        this.close();
                    }
                }]
            }).show();
        }
    },

    doAddRecords: function(records){
        var toAdd = this.checkForExistingCases(records);
        if (toAdd.length){
            this.targetStore.add(toAdd);

            if (this.obsTemplateId){
                this.applyObsTemplate(toAdd);
            }
            else {
                this.onComplete();
            }
        }
        else {
            this.onComplete();
        }
    },

    checkForExistingCases: function(records){
        //check for existing caseids
        var existingIds = {};
        this.targetStore.each(function(r){
            if (r.get('caseid')){
                existingIds[r.get('caseid')] = true;
            }
        }, this);

        var toAdd = [];
        Ext4.Array.forEach(records, function(r){
            if (!existingIds[r.get('caseid')]){
                toAdd.push(r);
            }
            else {
                this.hasSkippedDuplicates = true;
            }
        }, this);

        return toAdd;
    },

    onComplete: function(){
        Ext4.Msg.hide();
        this.close();

        if (this.hasSkippedDuplicates){
            Ext4.Msg.alert('Skipped Animals', 'One or more cases were skipped because they are already in this form');
        }
    },

    applyObsTemplate: function(caseRecords){
        var records = [];
        Ext4.Array.forEach(caseRecords, function(rec){
            records.push({
                Id: rec.get('Id'),
                caseid: rec.get('caseid'),
                date: this.recordData.date,
                performedby: this.recordData.performedby
            });
        }, this);

        EHR.window.ApplyTemplateWindow.loadTemplateRecords(function(recMap){
            if (!recMap || LABKEY.Utils.isEmptyObj(recMap)){
                this.onComplete();
                return;
            }

            for (var i in recMap){
                var store = Ext4.StoreMgr.get(i);
                store.add(recMap[i]);
            }

            this.onComplete();
        }, this, this.targetStore.storeCollection, this.obsTemplateId, records);
    }
});

EHR.DataEntryUtils.registerGridButton('ADDCLINICALCASES', function(config){
    return Ext4.Object.merge({
        text: 'Add Open Cases',
        tooltip: 'Click to automatically add SOAP notes based on open cases',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddClinicalCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
