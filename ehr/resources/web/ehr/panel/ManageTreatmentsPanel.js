/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageTreatmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managetreatmentspanel',

    statics: {
        getOrderTreatmentButtonConfig: function(owner){
            return [{
                xtype: 'button',
                text: 'Order Treatment',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'insert', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                menu: [{
                    text: 'Clinical Treatment',
                    handler: function(btn){
                        EHR.panel.ManageTreatmentsPanel.createNewTreatmentWindow(owner, btn, 'Clinical');
                    }
                },{
                    text: 'Surgical Treatment',
                    handler: function(btn){
                        EHR.panel.ManageTreatmentsPanel.createNewTreatmentWindow(owner, btn, 'Surgical');
                    }
                }]
            },{
                xtype: 'button',
                text: 'Show Inactive',
                handler: function(btn){
                    var owner = btn.up('window');
                    if (owner)
                        owner = owner.down('panel');

                    var store = owner.getStore();
                    LDK.Assert.assertNotEmpty('Unable to find animalId in ManageTreatmentsPanel', owner.animalId);
                    var filterArray = [
                        LABKEY.Filter.create('Id', owner.animalId, LABKEY.Filter.Types.EQUAL)
                    ];

                    if (btn.text == 'Show Inactive'){
                        btn.setText('Hide Inactive');
                    }
                    else {
                        btn.setText('Show Inactive');
                        filterArray.push(LABKEY.Filter.create('isExpired', false, LABKEY.Filter.Types.EQUAL));
                    }

                    store.filterArray = filterArray;
                    store.load();
                }
            }]
        },

        createNewTreatmentWindow: function(owner, btn, category){
            EHR.panel.ManageTreatmentsPanel.createTreatmentWindow(btn, {
                listeners: {
                    scope: this,
                    save: function(){
                        var win = btn.up('window');
                        var panel;
                        if (win){
                            panel = win.down('ehr-managetreatmentspanel');
                        }
                        else {
                            panel = btn.up('ehr-managetreatmentspanel');
                        }

                        panel.down('grid').store.load();
                    }
                }
            }, (owner ? owner.animalId : null), category);
        },

        createTreatmentWindow: function(btn, config, animalId, category){
            var cfg = Ext4.apply({
                schemaName: 'study',
                queryName: 'treatment_order',
                pkCol: 'objectid',
                pkValue: LABKEY.Utils.generateUUID().toUpperCase(),
                extraMetaData: {
                    Id: {
                        defaultValue: animalId,
                        editable: false
                    },
                    category: {
                        defaultValue: category
                    }
                }
            }, config);

            Ext4.create('EHR.window.ManageRecordWindow', cfg).show();
        },

        getActionBtnMenu: function(rec){
            return Ext4.create('Ext.menu.Menu', {
                items: [{
                    text: 'Change End Date',
                    disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                    handler: function(btn){
                        Ext4.create('Ext.window.Window', {
                            title: 'Change End Date',
                            modal: true,
                            closeAction: 'destroy',
                            bodyStyle: 'padding: 5px',
                            width: 420,
                            items: [{
                                xtype: 'xdatetime',
                                itemId: 'dateField',
                                timeFormat: 'H:i',
                                width: 400,
                                fieldLabel: 'End Date',
                                minValue: new Date(),
                                value: rec.get('enddate')
                            }],
                            buttons: [{
                                text: 'Submit',
                                handler: function(btn){
                                    var win = btn.up('window');
                                    var val = win.down('#dateField').getValue();
                                    if (!val){
                                        Ext4.Msg.alert('Error', 'Must choose a date');
                                        return;
                                    }

                                    rec.set('enddate', val);
                                    rec.store.sync();

                                    win.close();
                                }
                            },{
                                text: 'Cancel',
                                handler: function(btn){
                                    btn.up('window').close();
                                }
                            }]
                        }).show();
                    }
                },{
                    text: 'Delete Treatment',
                    disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'delete', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                    handler: function(btn){
                        Ext4.Msg.confirm('Delete Treatment', 'This will delete all record of this treatment.  If the treatment has already been given, you should end it rather than delete it.  Do you want to do this?', function(val){
                            if (val == 'yes'){
                                var store = rec.store;
                                store.remove(rec);
                                store.sync();
                            }
                        }, this);
                    }
                },{
                    text: 'Edit Treatment',
                    disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                    handler: function(btn){
                        EHR.panel.ManageTreatmentsPanel.createTreatmentWindow(btn, {
                            pkCol: 'objectid',
                            pkValue: rec.get('objectid'),
                            listeners: {
                                scope: this,
                                save: function(){
                                    rec.store.load();
                                }
                            }
                        }, this.animalId);
                    }
                }]
            });
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            items: [this.getGridConfig()],
            buttons: this.hideButtons ? null : this.getOrderTreatmentButtonConfig(this)
        });

        this.callParent();
    },

    getStore: function(){
        if (this.store)
            return this.store;

        this.store = Ext4.create('LABKEY.ext4.data.Store', {
            schemaName: 'study',
            queryName: 'treatment_order',
            columns: 'lsid,objectid,Id,date,enddate,project,category,remark,performedby,code,route,frequency,frequency/meaning,amountAndVolume',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isExpired', false, LABKEY.Filter.Types.EQUAL)
            ],
            autoLoad: true,
            listeners: {
                scope: this,
                synccomplete: function(store){
                    var grid = this.down('grid');
                    if (grid)
                        grid.getView().refresh();

                    EHR.DemographicsCache.clearCache(this.animalId);
                }
            }
        });

        return this.store;
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            border: true,
            store: this.getStore(),
            viewConfig: {
                loadMask: !(Ext4.isIE && Ext4.ieVersion <= 8)
            },
            columns: [{
                xtype: 'actioncolumn',
                width: 40,
                icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
                tooltip: 'Edit',
                handler: function(view, rowIndex, colIndex, item, e, rec){
                    EHR.panel.ManageTreatmentsPanel.getActionBtnMenu(rec).showAt(e.getXY());
                }
            },{
                header: 'Date',
                xtype: 'datecolumn',
                width: 160,
                format: 'Y-m-d H:i',
                dataIndex: 'date'
            },{
                header: 'End Date',
                xtype: 'datecolumn',
                width: 160,
                format: 'Y-m-d H:i',
                dataIndex: 'enddate'
            },{
                header: 'Code',
                width: 300,
                dataIndex: 'code',
                tdCls: 'ldk-wrap-text',
                noWrap: false,
                renderer: function(value, cellMetaData, record){
                    if(record && record.raw && record.raw['code']){
                        if(Ext4.isDefined(record.raw['code'].displayValue))
                            return record.raw['code'].displayValue;
                    }

                    return value;
                }
            },{
                header: 'Frequency',
                width: 160,
                dataIndex: 'frequency/meaning'
            },{
                header: 'Route',
                width: 60,
                dataIndex: 'route'
            },{
                header: 'Amount',
                width: 120,
                tdCls: 'ldk-wrap-text',
                noWrap: false,
                dataIndex: 'amountAndVolume',
                renderer: function(value, cellMetaData, record){
                    if (value){
                        return value.replace(/\n/, '<br>');
                    }

                    return value;
                }
            },{
                header: 'Ordered By',
                width: 160,
                dataIndex: 'performedby'
            }]
        }
    }
});