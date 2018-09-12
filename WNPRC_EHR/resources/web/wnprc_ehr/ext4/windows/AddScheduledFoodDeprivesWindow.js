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
                multiSelect: true,
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'checkcombo',
                forceSelection: true,
                multiSelect: true,
                fieldLabel: 'Animal Id',
                itemId: 'animalId',
                displayField: 'Id',
                valueField: 'Id',
                defaultListConfig: {loadingHeight: 70, minHeight: 95, maxHeight: 600, shadow: 'sides'},
                store: {
                    type: 'labkey-store',
                    schemaName: 'study',
                    queryName: 'foodDeprives',
                    schemaView: 'Scheduled Food Deprives',
                    filterArray: [LABKEY.Filter.create('date',(new Date()).format('Y-m-d'), LABKEY.Filter.Types.EQUAL)],
                    autoLoad: true

                }

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
                itemId: 'performedBy'
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.getFoodDeprives
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
        var area = EHR.DataEntryUtils.ensureArray(this.down('#areaField').getValue()) || [];
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];
        var animalIds = EHR.DataEntryUtils.ensureArray(this.down('#animalId').getValue()) || [];
        var assignedto = EHR.DataEntryUtils.ensureArray(this.down('#assignedto').getValue()) || [];
        var schedule = EHR.DataEntryUtils.ensureArray(this.down('#schedule').getValue()) || [];
        var performedBy = this.down('#performedBy') ? this.down('#performedBy').getValue() : null;
      //  var times = EHR.DataEntryUtils.ensureArray(this.down('#timeField').getTimeValue()) || [];
      //  var categories = EHR.DataEntryUtils.ensureArray(this.down('#categoryField').getValue()) || [];

        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        if (area.length==0 && rooms.length==0 && animalIds.length==0){
            alert('Must provide at least an id, one room or an area');
            return;
        }

        if (!performedBy){
            Ext4.Msg.alert('Error','Must enter initials in the  \'PerformedBy\' field');
            return;
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', date.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        //filterArray.push(LABKEY.Filter.create('date', (new Date()).format('Y-m-d H:i'), LABKEY.Filter.Types.LTE));  //exclude treatments in the future
        filterArray.push(LABKEY.Filter.create('taskid', null, LABKEY.Filter.Types.ISBLANK));
        filterArray.push(LABKEY.Filter.create('QCState/label', 'Scheduled', LABKEY.Filter.Types.STARTS_WITH));
        //filterArray.push(LABKEY.Filter.create('treatmentStatus', null, LABKEY.Filter.Types.ISBLANK));

        if (area.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (animalIds.length)
            filterArray.push(LABKEY.Filter.create('Id', animalIds.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (assignedto.length)
            filterArray.push(LABKEY.Filter.create('assignedTo', assignedto.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (schedule && schedule.length)
            filterArray.push(LABKEY.Filter.create('schedule', schedule.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getFoodDeprives: function(button){
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
            columns: 'lsid,objectid,Id,date,project,schedule,reason,remarks,assignedTo,protocolContact,requestid,modified',
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

            var tempModel = this.targetStore.createModel({
                lsid:               row.getValue('lsid'),
                Id:                 row.getValue('Id'),
                date:               row.getValue('date'),
                project:            row.getValue('project'),
                reason:             row.getValue('reason'),
                schedule:           row.getValue('schedule'),
                remarks:            row.getValue('remarks'),
                assignedTo:         row.getValue('assignedTo'),
                protocolContact:    row.getValue('protocolContact'),
                depriveStartedBy:   performedby,
                objectid:           row.getValue('objectid'),
                taskId:             this.targetStore.storeCollection.getTaskId(),
                requestid:          row.getValue('requestid'),
                modified:           row.getValue('modified')
            });
            tempModel.phantom = false;
            records.push(tempModel);
        }, this);

        this.targetStore.add(records);
        Ext4.Msg.hide();
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
