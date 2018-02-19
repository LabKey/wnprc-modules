/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This window will allow users to query the treatment schedule and add records to a task based on the scheduled treatments
 * that match their criteria.  It is connected to the 'Add Treatments' button in the treatments form.
 */
Ext4.define('EHR.window.AddScheduledFoodDeprivesWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.foodDeprivesStore = this.targetStore.storeCollection.getServerStoreForQuery('study', 'foodDeprives');
        this.tasksStore = this.targetStore.storeCollection.getServerStoreForQuery('ehr', 'tasks');

        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Import Scheduled Food Deprives',
            border: true,
            bodyStyle: 'padding: 5px',
            width: 400,
            height: 400,
            defaults: {
                width: 380,
                border: false
            },
            items: [{
                html: 'This helper allows you to pull records from the food deprive schedule into this form.  It will identify any records matching the criteria below that have not already been marked as started.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'datefield',
                fieldLabel: 'Date',
                value: new Date(),
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
                itemId: 'assignedto',
                displayField: 'title',
                valueField: 'title',
                defaultListConfig: {loadingHeight: 70, minHeight: 95, maxHeight: 600, shadow: 'sides'},
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_assigned'
                }

            },{
                xtype: 'checkcombo',
                forceSelection: true,
                multiSelect: true,
                fieldLabel: 'Start Time Range',
                itemId: 'schedule',
                displayField: 'title',
                valueField: 'value',
                defaultListConfig: {loadingHeight: 70, minHeight: 95, maxHeight: 600, shadow: 'sides'},
                store: {
                    type: 'labkey-store',
                    autoLoad: true,
                    schemaName: 'ehr_lookups',
                    queryName: 'schedule_deprive',
                    sort: 'sort_order'
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
                handler: this.getTreatments
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
        var assignedto = EHR.DataEntryUtils.ensureArray(this.down('#assignedto').getValue()) || [];
        var schedule = EHR.DataEntryUtils.ensureArray(this.down('#schedule').getValue()) || [];
      //  var times = EHR.DataEntryUtils.ensureArray(this.down('#timeField').getTimeValue()) || [];
      //  var categories = EHR.DataEntryUtils.ensureArray(this.down('#categoryField').getValue()) || [];

        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        if (!area && !rooms.length){
            alert('Must provide at least one room or an area');
            return;
        }
        if (!assignedto){
            Ext4.Msg.alert('Error','Must choose a value for \'Assigned To\' field');
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', date.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        //filterArray.push(LABKEY.Filter.create('date', (new Date()).format('Y-m-d H:i'), LABKEY.Filter.Types.LTE));  //exclude treatments in the future
        filterArray.push(LABKEY.Filter.create('taskid', null, LABKEY.Filter.Types.ISBLANK));
        filterArray.push(LABKEY.Filter.create('QCState/label', 'Scheduled', LABKEY.Filter.Types.STARTS_WITH));
        //filterArray.push(LABKEY.Filter.create('treatmentStatus', null, LABKEY.Filter.Types.ISBLANK));

        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (assignedto.length)
            filterArray.push(LABKEY.Filter.create('assignedTo', assignedto.join(';'), LABKEY.Filter.Types.EQUAL));

        if (schedule && schedule.length)
            filterArray.push(LABKEY.Filter.create('schedule', schedule.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getTreatments: function(button){
        var filterArray = this.getFilterArray();
        if (!filterArray || !filterArray.length){
            return;
        }

        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());
        Ext4.Msg.wait("Loading...");
        this.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'foodDeprives',
            sort: 'date,Id/curlocation/room,Id/curlocation/cage,Id',
            columns: 'lsid,Id,date,project,schedule',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No scheduled food deprives were found.');
            return;
        }

        //LDK.Assert.assertNotEmpty('Unable to find targetStore in AddScheduledTreatmentsWindow', this.targetStore);

        var records = [];
        var performedby = this.down('#performedBy').getValue();

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);

            var toUpdate = {
                lsid: row.getValue('lsid'),
                depriveStartedBy: performedby,
                QCStateLabel: 'Started',
                taskId: this.targetStore.storeCollection.getTaskId()
            }

            //row.date = row.getDateValue('date');

            //var date = row.date;

            // NOTE: the following block has been disabled.
            // we always use the scheduled time, rather than the current time
            // we could also consider putting a toggle on the window to switch behavior
//            var date = new Date();
//
//            //if retroactively entering (more than 2 hours after the scheduled time), we take the time that record was scheduled to be administered.  otherwise we use the current time
//            if ((date.getTime() - row.date.getTime()) > (1000 * 60 * 60 * 2))
//                date = row.date;

            records.push(toUpdate);
        }, this);

        if (records.length){
            var taskRecord = this.tasksStore.getAt(0);
            LDK.Assert.assertNotEmpty('Unable to find taskRecord', taskRecord);
            if (taskRecord.phantom){
                this.tasksStore.sync({
                    scope: this,
                    success: function(store){
                        console.log('saving task record');
                        this.doUpdateFoodDeprives(records);
                    },
                    failure: LDK.Utils.getErrorCallback()
                })
            }
        }
        else{
            this.doUpdateFoodDeprives(records);
        }

    },

    doUpdateFoodDeprives: function(records){
        LABKEY.Query.updateRows({
            method: 'POST',
            schemaName: 'study',
            queryName: 'foodDeprives',
            rows: records,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                console.log('refreshing food deprives');

                Ext4.Msg.hide();
                Ext4.Msg.wait('Reloading food deprives...');
                this.foodDeprivesStore.load();
                this.foodDeprivesStore.on('load', function(){
                    Ext4.Msg.hide();
                }, this, {single: true});
            }
        });
    }

});

EHR.DataEntryUtils.registerGridButton('ADDDEPRIVES', function(config){
    return Ext4.Object.merge({
        text: 'Add Scheduled Deprives',
        tooltip: 'Click to automatically add scheduled deprives',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddScheduledFoodDeprivesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
