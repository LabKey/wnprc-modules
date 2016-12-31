/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This window will allow users to query the treatment schedule and add records to a task based on the scheduled treatments
 * that match their criteria.  It is connected to the 'Add Treatments' button in the treatments form.
 */
Ext4.define('EHR.window.AddScheduledTreatmentsWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Import Scheduled Treatments',
            border: true,
            bodyStyle: 'padding: 5px',
            width: 350,
            defaults: {
                width: 330,
                border: false
            },
            items: [{
                html: 'This helper allows you to pull records from the treatment schedule into this form.  It will identify any records matching the criteria below that have not already been marked as completed.  NOTE: it will only return records with a scheduled time that is in the past.',
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
                xtype: 'ehr-timeofdayfield',
                itemId: 'timeField'
            },{
                xtype: 'checkcombo',
                forceSelection: true,
                multiSelect: true,
                fieldLabel: 'Category',
                itemId: 'categoryField',
                displayField: 'category',
                valueField: 'category',
                store: {
                    type: 'array',
                    fields: ['category'],
                    data: [
                        ['Clinical'],
                        ['Surgical'],
                        ['Diet']
                    ]
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
        var times = EHR.DataEntryUtils.ensureArray(this.down('#timeField').getTimeValue()) || [];
        var categories = EHR.DataEntryUtils.ensureArray(this.down('#categoryField').getValue()) || [];

        var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        if (!area && !rooms.length){
            alert('Must provide at least one room or an area');
            return;
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', date.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        filterArray.push(LABKEY.Filter.create('date', (new Date()).format('Y-m-d H:i'), LABKEY.Filter.Types.LTE));  //exclude treatments in the future
        filterArray.push(LABKEY.Filter.create('taskid', null, LABKEY.Filter.Types.ISBLANK));
        filterArray.push(LABKEY.Filter.create('treatmentStatus', null, LABKEY.Filter.Types.ISBLANK));

        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (categories.length)
            filterArray.push(LABKEY.Filter.create('category', categories.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (times && times.length)
            filterArray.push(LABKEY.Filter.create('timeOfDay', times.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

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
            queryName: 'treatmentSchedule',
            parameters: {
                NumDays: 1,
                StartDate: date.format('Y-m-d')
            },
            sort: 'date,Id/curlocation/room_sortValue,Id/curlocation/cage_sortValue,Id',
            columns: 'primaryKey,lsid,treatmentid,Id,date,project,meaning,code,qualifier,route,concentration,conc_units,amount,amount_units,dosage,dosage_units,volume,vol_units,remark,category,chargetype',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No uncompleted treatments were found.');
            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddScheduledTreatmentsWindow', this.targetStore);

        var records = [];
        var performedby = this.down('#performedBy').getValue();

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);

            row.date = row.getDateValue('date');

            var date = row.date;

            // NOTE: the following block has been disabled.
            // we always use the scheduled time, rather than the current time
            // we could also consider putting a toggle on the window to switch behavior
//            var date = new Date();
//
//            //if retroactively entering (more than 2 hours after the scheduled time), we take the time that record was scheduled to be administered.  otherwise we use the current time
//            if ((date.getTime() - row.date.getTime()) > (1000 * 60 * 60 * 2))
//                date = row.date;

            records.push(this.targetStore.createModel({
                Id: row.getValue('Id'),
                date: date,
                project: row.getValue('project'),
                code: row.getValue('code'),
                qualifier: row.getValue('qualifier'),
                route: row.getValue('route'),
                concentration: row.getValue('concentration'),
                conc_units: row.getValue('conc_units'),
                amount: row.getValue('amount'),
                amount_units: row.getValue('amount_units'),
                volume: row.getValue('volume'),
                vol_units: row.getValue('vol_units'),
                dosage: row.getValue('dosage'),
                dosage_units: row.getValue('dosage_units'),
                treatmentid: row.getValue('treatmentid'),
                timeordered: row.getValue('date'),
                performedby: performedby,
                remark: row.getValue('remark'),
                category: row.getValue('category'),
                chargetype: row.getValue('chargetype')
            }));
        }, this);

        this.targetStore.add(records);

        Ext4.Msg.hide();
    }
});

EHR.DataEntryUtils.registerGridButton('ADDTREATMENTS', function(config){
    return Ext4.Object.merge({
        text: 'Add Scheduled Treatments',
        tooltip: 'Click to automatically add scheduled treatments',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddScheduledTreatmentsWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
