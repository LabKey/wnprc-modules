/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetStore
 */
Ext4.define('EHR.window.AddScheduledBloodDrawsWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.bloodDrawStore = this.targetStore.storeCollection.getServerStoreForQuery('study', 'blood');
        this.tasksStore = this.targetStore.storeCollection.getServerStoreForQuery('ehr', 'tasks');

        Ext4.applyIf(this, {
            modal: true,
            title: 'Import Scheduled Blood',
            border: true,
            closeAction: 'destroy',
            bodyStyle: 'padding: 5px',
            width: 350,
            defaults: {
                width: 330,
                border: false
            },
            items: [{
                html: 'This helper is used to add unclaimed blood draws from the schedule to this task.  The fields below determine which blood draws will be added.  This will only add blood draw requests that have not already been added to a different task',
                style: 'margin-bottom: 20px;'
            },{
                xtype: 'datefield',
                fieldLabel: 'Date',
                value: (new Date()),
                //TODO
                //hidden: !EHR.Security.hasPermission('Completed', 'update', {queryName: 'Blood Draws', schemaName: 'study'}),
                maxValue: (new Date()),
                itemId: 'dateField'
            },{
                xtype: 'ehr-areafield',
                multiSelect: false,
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'checkcombo',
                forceSelection: true,
                multiSelect: true,
                fieldLabel: 'Assigned To',
                itemId: 'chargeTypeField',
                displayField: 'value',
                valueField: 'value',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'bloodChargeType'
                }
            },{
                xtype: 'textfield',
                fieldLabel: 'Performed By',
                value: LABKEY.Security.currentUser.displayName,
                itemId: 'performedBy'
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.getBloodDraws
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    getFilterArray: function(){
        var area = this.down('#areaField') ? this.down('#areaField').getValue() : null;
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];
        var chargeType = EHR.DataEntryUtils.ensureArray(this.down('#chargeTypeField').getValue()) || [];

        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        if (!area && !rooms.length){
            Ext4.Msg.alert('Error', 'Must provide at least one room or an area');
            return;
        }

        if (!chargeType){
            Ext4.Msg.alert('Error', 'Must pick enter a value in the \'Assigned To\' field');
            return;
        }
        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', date.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        filterArray.push(LABKEY.Filter.create('taskId', null, LABKEY.Filter.Types.ISBLANK));
        filterArray.push(LABKEY.Filter.create('QCState/label', 'Request: Approved', LABKEY.Filter.Types.STARTS_WITH));

        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (chargeType.length)
            filterArray.push(LABKEY.Filter.create('chargeType', chargeType.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getBloodDraws: function(button){
        var filterArray = this.getFilterArray();
        if (!filterArray || !filterArray.length){
            return;
        }

        Ext4.Msg.wait("Loading...");
        this.hide();

        //find distinct animals matching criteria
        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'blood',
            sort: 'date,Id/curlocation/room_sortValue,Id/curlocation/cage_sortValue,Id',
            columns: 'lsid,Id,date,project,tube_type,quantity,charge_type,additionalServices,instructions,daterequested,reason,objectid,requestid',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No matching blood draws were found.');
            return;
        }

        var records = [];
        var performedby = this.down('#performedBy').getValue();

        Ext4.Array.each(results.rows, function(row){
            var sr = new LDK.SelectRowsRow(row);
            var toAdd = {
                lsid: sr.getValue('lsid'),
                taskId: this.targetStore.storeCollection.getTaskId(),
                QCStateLabel: 'Scheduled'
            };

            records.push(toAdd);
        }, this);

        if (records.length){
            var taskRecord = this.tasksStore.getAt(0);
            LDK.Assert.assertNotEmpty('Unable to find taskRecord', taskRecord);
            if (taskRecord.phantom){
                this.tasksStore.sync({
                    scope: this,
                    success: function(store){
                        console.log('saving task record');
                        this.doUpdateBloodDraws(records);
                    },
                    failure: LDK.Utils.getErrorCallback()
                })
            }
            else {
                this.doUpdateBloodDraws(records);
            }

        }
    },

    doUpdateBloodDraws: function(records){
        LABKEY.Query.updateRows({
            method: 'POST',
            schemaName: 'study',
            queryName: 'blood',
            rows: records,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                console.log('refreshing blood');

                Ext4.Msg.hide();
                Ext4.Msg.wait('Reloading blood draws...');
                this.bloodDrawStore.load();
                this.bloodDrawStore.on('load', function(){
                    Ext4.Msg.hide();
                }, this, {single: true});
            }
        });
    }
});

EHR.DataEntryUtils.registerGridButton('ADDBLOODDRAWS', function(config){
    return Ext4.Object.merge({
        text: 'Add Scheduled Draws',
        tooltip: 'Click to automatically fill out scheduled blood draws',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddScheduledBloodDrawsWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
