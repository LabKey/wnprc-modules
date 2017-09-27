/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.panel.ClinicalManagementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalmanagementpanel',

    statics: {
        getActionMenu: function(animalId, showReplace){
            var ret = {
                xtype: 'menu',
                showSeparator: false,
                plugins: [{
                    ptype: 'menuqtips'
                }],
                items: [{
                    text: 'Manage Treatments',
                    disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                    tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]) ? 'You do not have permission for this action' : null,
                    scope: this,
                    handler: function(btn){
                        Ext4.create('EHR.window.ManageTreatmentsWindow', {
                            animalId: animalId
                        }).show(btn);
                    }
                },{
                    text: 'Manage Cases',
                    disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                    tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]) ? 'You do not have permission for this action' : null,
                    scope: this,
                    handler: function(btn){
                        Ext4.create('EHR.window.ManageCasesWindow', {
                            animalId: animalId
                        }).show();
                    }
                },{
                    text: 'Enter SOAP',
                    disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
                    tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Clinical Remarks'}]) ? 'You do not have permission for this action' : null,
                    scope: this,
                    handler: function(btn){
                        Ext4.create('EHR.window.ManageRecordWindow', {
                            schemaName: 'study',
                            queryName: 'clinRemarks',
                            maxItemsPerCol: 11,
                            pkCol: 'objectid',
                            pkValue: LABKEY.Utils.generateUUID().toUpperCase(),
                            extraMetaData: {
                                Id: {
                                    defaultValue: animalId,
                                    editable: false
                                }
                            },
                            listeners: {
                                scope: this,
                                save: function(){
                                    //NOTE: if we use this as a panel button, we want to refresh.  we can also show this from a dataregion, in which case we abort
                                    var panel = btn.up('ehr-clinicalmanagementpanel') || btn.up('window');
                                    if (!panel){
                                        return;
                                    }

                                    var grid = panel.down('ehr-clinicalhistorypanel');
                                    if (grid){
                                        grid.doReload();
                                    }
                                }
                            }
                        }).show();
                    }
                },{
                    text: 'Open Exam Form',
                    disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.IN_PROGRESS, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
                    tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.IN_PROGRESS, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]) ? 'You do not have permission for this action' : null,
                    scope: this,
                    handler: function(btn){
                        window.open(LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: 'Clinical Report'}), '_blank')
                    }
                },{
                    text: 'Mark Vet Review',
                    disabled: !EHR.Security.hasVetPermission(),
                    tooltip: !EHR.Security.hasVetPermission() ? 'You do not have permission for this action' : null,
                    scope: this,
                    handler: function(btn){
                        Ext4.Msg.confirm('Mark Reviewed', 'You are about to mark this animal\'s record as reviewed.  Do you want to do this?', function(val){
                            if (val == 'yes'){
                                Ext4.Msg.wait('Saving...');
                                LABKEY.Query.insertRows({
                                    schemaName: 'study',
                                    queryName: 'clinical_observations',
                                    failure: LDK.Utils.getErrorCallback(),
                                    rows: [{
                                        Id: animalId,
                                        performedby: LABKEY.Security.currentUser.displayName,
                                        category: EHR.window.VetReviewWindow.VET_REVIEW,
                                        date: new Date()
                                    }],
                                    success: function(){
                                        Ext4.Msg.hide();
                                    }
                                })
                            }
                        }, this);
                    }
                }]
            };

            if (showReplace){
                ret.items.push({
                    text: 'Replace/Amend Selected Remark',
                    disabled: !EHR.Security.hasVetPermission(),
                    scope: this,
                    handler: function(btn){
                        var panel = btn.up('ehr-clinicalmanagementpanel') || btn.up('window');
                        var grid = panel.down('ehr-clinicalhistorypanel').down('grid');
                        var rows = grid.getSelectionModel().getSelection();
                        if (!rows || !rows.length){
                            Ext4.Msg.alert('Error', 'Must select a record');
                            return;
                        }
                        else if (rows.length != 1){
                            Ext4.Msg.alert('Error', 'Can only select 1 record');
                            return;
                        }

                        if (!rows[0].get('objectId') || rows[0].get('source') != 'Clinical Remark'){
                            Ext4.Msg.alert('Error', 'This can only be performed on SOAP notes');
                            return;
                        }

                        EHR.panel.ClinicalManagementPanel.replaceSoap({
                            objectid: rows[0].get('objectId'),
                            scope: this,
                            callback: function(){
                                var panel = btn.up('ehr-clinicalmanagementpanel') || btn.up('window');
                                var grid = panel.down('ehr-clinicalhistorypanel').doReload();
                            }
                        });
                    }
                })
            }

            return ret;
        },

        replaceSoap: function(config){
            config = config || {};
            if (!config){
                Ext4.Msg.alert('Error', 'Must provide the objectid to edit');
                return;
            }

            Ext4.Msg.wait('Loading...');
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'clinremarks',
                columns: 'lsid,objectid,Id,date,project,category,s,o,a,p,p2,hx,remark,caseid',
                filterArray: [LABKEY.Filter.create('objectid', config.objectid, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                failure: LDK.Utils.getErrorCallback(),
                success: function(results){
                    Ext4.Msg.hide();
                    if (!results || !results.rows || !results.rows.length){
                        Ext4.Msg.alert('Error', 'Record not found');
                        LDK.Utils.logToServer({
                            message: 'ERROR: unable to find clinremarks record with objectid: ' + config.objectid
                        });
                        return;
                    }

                    //TODO: consider toggling edit/replace based on category
                    var guid = LABKEY.Utils.generateUUID().toUpperCase();

                    Ext4.create('EHR.window.ManageRecordWindow', {
                        schemaName: 'study',
                        queryName: 'clinRemarks',
                        maxItemsPerCol: 11,
                        pkCol: 'objectid',
                        pkValue: guid,
                        extraMetaData: {
                            Id: {
                                defaultValue: results.rows[0]['Id']
                            },
                            date: {
                                defaultValue: LDK.ConvertUtils.parseDate(results.rows[0]['date'])
                            },
                            hx: {
                                defaultValue: results.rows[0]['hx']
                            },
                            s: {
                                defaultValue: results.rows[0]['s']
                            },
                            o: {
                                defaultValue: results.rows[0]['o']
                            },
                            a: {
                                defaultValue: results.rows[0]['a']
                            },
                            p: {
                                defaultValue: results.rows[0]['p']
                            },
                            p2: {
                                defaultValue: results.rows[0]['p2']
                            },
                            remark: {
                                defaultValue: results.rows[0]['remark']
                            },
                            caseid: {
                                defaultValue: results.rows[0]['caseid']
                            },
                            project: {
                                defaultValue: results.rows[0]['project']
                            },
                            performedby: {
                                defaultValue: LABKEY.Security.currentUser.displayName
                            },
                            category: {
                                defaultValue: 'Replacement SOAP'
                            },
                            parentid: {
                                defaultValue: config.objectid
                            },
                            objectid: {
                                defaultValue: guid
                            }
                        },
                        listeners: {
                            scope: this,
                            save: function(win, sc){
                                if (config.callback){
                                    config.callback.call((config.scope || this), sc, guid);
                                }
                            }
                        }
                    }).show();
                }
            });
        },

        updateVetColumn: function(el, storeCollection, objectId){
            el.style.setProperty('text-decoration', 'line-through');
            el.setAttribute( 'onclick', 'EHR.panel.ClinicalManagementPanel.replaceSoap({objectid: \'' + objectId + '\', scope: this, callback: function(){EHR.panel.ClinicalManagementPanel.updateVetColumn(this, arguments[0], arguments[1]);}})');
        },

        displayActionMenu: function(el, subjectId){
            var menuCfg = EHR.panel.ClinicalManagementPanel.getActionMenu(subjectId);
            menuCfg.items.unshift({
                text: 'Show Recent SOAPs',
                scope: this,
                handler: function(){
                    EHR.window.RecentRemarksWindow.showRecentRemarks(subjectId);
                }
            });

            menuCfg.items.unshift({
                text: 'Show History',
                scope: this,
                handler: function(){
                    EHR.window.ClinicalHistoryWindow.showClinicalHistory(null, subjectId);
                }
            });

            var menu = Ext4.widget(menuCfg);
            menu.floating = true;

            var owner = Ext4.create('Ext.panel.Panel', {
                border: false
            });
            owner.render(el);
            menu.setFloatParent(owner);
            menu.show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            bodyStyle: 'padding: 3px;',
            border: false,
            items: this.getItems(),
            buttonAlign: 'left',
            buttons: [{
                text: 'Close',
                handler: function(btn){
                    //btn.up('window').close();
                    window.location = LABKEY.ActionURL.buildURL('project', 'home');
                }
            },{
                text: 'Actions',
                menu: EHR.panel.ClinicalManagementPanel.getActionMenu(this.subjectId, true)
            }]
        });

        this.callParent(arguments);
    },

    getItems: function(){
        return [{
            xtype: 'ehr-smallformsnapshotpanel',
            showActionsButton: false,
            subjectId: this.subjectId,
            hideHeader: true,
            style: 'padding: 5px;'
        },{
            xtype: 'tabpanel',
            items: [{
                xtype: 'ehr-clinicalhistorypanel',
                title: 'History',
                border: true,
                width: 1180,
                gridHeight: 400,
                height: 400,
                autoLoadRecords: true,
                autoScroll: true,
                subjectId: this.subjectId,
                minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
            },{
                xtype: 'ehr-weightgraphpanel',
                title: 'Weights',
                subjectId: this.subjectId,
                width: 1180,
                border: true
            }]
        }];
    }
});