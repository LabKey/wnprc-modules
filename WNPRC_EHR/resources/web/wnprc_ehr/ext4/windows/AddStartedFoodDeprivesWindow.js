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
Ext4.define('EHR.window.AddStartedFoodDeprivesWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.foodDeprivesStore = this.targetStore.storeCollection.getServerStoreForQuery('study', 'foodDeprives');
        this.tasksStore = this.targetStore.storeCollection.getServerStoreForQuery('ehr', 'tasks');

        Ext4.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Import Started Food Deprives',
            border: true,
            bodyPadding: 3,
            //bodyStyle: 'background: #666 !important;',
            width: 500,


            /*layout: {
                type: 'hbox',
                align: 'stretch'
            },*/
            defaults: {
                width: 450,
                border: false
            },
            items: [{
                html: 'This helper allows you to pull records from the food deprive that have been started into this form.  It will identify any records matching the criteria below that have not already been marked as completed.',
                style: 'padding-bottom: 5px;'
            },{
                xtype: 'boxselect',
                height: 50,
                itemId: 'animalId',
                fieldLabel: 'Animal ID',
                displayField: 'Id',
                valueField: 'Id',
               // modal: true,
                multiSelect: true,
                delimiter: ';',
                queryMode: 'local',
                pinList: true,
                /*triggerOnClick: true,
                triggerAction: this.getFieldListeners(),*/
                stacked: false,
                store: {
                    type: 'labkey-store',
                    autoLoad: true,
                    schemaName: 'study',
                    queryName: 'foodDeprives',
                    viewName: 'Started Food Deprive',
                    sort: 'id'
                    /*filterArray: [
                        LABKEY.Filter.create('formtype', section.name, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
                    ]*/

                },
                listConfig:{
                    //cls: 'min-item-height',
                    itemCls: 'x-boundlist-item',

                    padding: '15 0 15 0'
                },
               // defaultListConfig: {cls: '',resizable: false, loadingHeight: 70, minHeight: 95, shadow: 'slides'},
                listeners: this.getFieldListeners()
            },{
                xtype: 'ehr-areafield',
                multiSelect: false,
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
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
        var animalid = EHR.DataEntryUtils.ensureArray(this.down('#animalId').getValue()) || [];
        var area = this.down('#areaField') ? this.down('#areaField').getValue() : null;
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];
        //var assignedto = EHR.DataEntryUtils.ensureArray(this.down('#assignedto').getValue()) || [];
        //var schedule = EHR.DataEntryUtils.ensureArray(this.down('#schedule').getValue()) || [];
      //  var times = EHR.DataEntryUtils.ensureArray(this.down('#timeField').getTimeValue()) || [];
      //  var categories = EHR.DataEntryUtils.ensureArray(this.down('#categoryField').getValue()) || [];

       // var date = (this.down('#dateField') ? this.down('#dateField').getValue() : new Date());

        if (!animalid.length && !area && !rooms.length){
            alert('Must provide at least an animalId, one room, or an area');
            return;
        }
        /*if (!assignedto){
            Ext4.Msg.alert('Error','Must choose a value for \'Assigned To\' field');
        }*/

        var filterArray = [];
        console.log ('animalid '+ animalid);

        filterArray.push(LABKEY.Filter.create('Id', animalid.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        //filterArray.push(LABKEY.Filter.create('date', date.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        //filterArray.push(LABKEY.Filter.create('date', (new Date()).format('Y-m-d H:i'), LABKEY.Filter.Types.LTE));  //exclude treatments in the future
        //filterArray.push(LABKEY.Filter.create('taskid', null, LABKEY.Filter.Types.IS));
        filterArray.push(LABKEY.Filter.create('QCState/label', 'Started', LABKEY.Filter.Types.STARTS_WITH));
        //filterArray.push(LABKEY.Filter.create('treatmentStatus', null, LABKEY.Filter.Types.ISBLANK));

        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

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
            columns: 'lsid,Id,date,project,schedule,taskid',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No started food deprives were found.');
            return;
        }

        //LDK.Assert.assertNotEmpty('Unable to find targetStore in AddScheduledTreatmentsWindow', this.targetStore);

        var records = [];
        var startedTaskIds = [];
        var performedby = this.down('#performedBy').getValue();

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            var startTaskId = row.getValue('taskid');

            startedTaskIds.push(startTaskId);

            var toUpdate = {
                lsid: row.getValue('lsid'),
                foodRestoredBy: performedby,
                startedTaskId: startTaskId,
                //scheduleTime: scheduleTime,
                //date: new Date(),
                //QCStateLabel: 'Started',
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
                        this.completeStartedTask(startedTaskIds);
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
    completeStartedTask: function(taskIds){
        //var objToUpdate;
        Ext4.Array.each(taskIds, function(taskToComplete){
            var taskId = taskToComplete;
            var objToUpdate =[];
            objToUpdate.push({
                                taskid : taskId,
                                QCStateLabel: 'Completed',
                                qcstate: 1
                            });
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'tasks',
                filterArray: [
                        LABKEY.Filter.create('taskid', taskId, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data){
                    if (!data.rows || !data.rows.length){
                        return;
                    }
                    LABKEY.Query.updateRows({
                        method: 'POST',
                        schemaName: 'ehr',
                        queryName: 'tasks',
                        scope: this,
                        rows: objToUpdate,
                        success: function () {
                            console.log ('Completed Task for Food Deprive');
                           // this.close();
                        },
                        failure: function(){
                            console.log('Cannot update start tasks');
                        }

                    })

                }
            })
        },this);


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
    },
    getFieldListeners: function() {
        return {
            'change': function(field, newValue, oldValue) {
                this.addMessage(field, 'change',
                        'New value is "' + (newValue ? newValue : '') + '" ' +
                        '(Old was "' + (oldValue ? oldValue : '') + '") ' +
                        field.getValueRecords().length + ' records selected.');
            },
            'select': function(field, records) {
                this.addMessage(field, 'select',
                        records.length + ' records selected.');
            },
            'valueselectionchange': function(field, records) {
                this.addMessage(field, 'valueselectionchange',
                        records.length + ' records selected.');
            },
            'valuefocuschange': function(field, oldFocused, newFocused) {
                var newHighlightValue = newFocused ? newFocused.get(field.valueField) : '',
                        oldHighlightValue = oldFocused ? oldFocused.get(field.valueField) : '';

                this.addMessage(field, 'valuefocuschange',
                        'New highlight is "' + newHighlightValue + '" ' +
                        '(Old was "' + oldHighlightValue + '")');
            },
            scope: this
        };
    },
    addMessage: function(fromField, msgType, msg) {
        if (this.exampleWindow) {
            var msgBlock = this.exampleWindow.down('#eventMessages');

            var newMsg = '[' + Ext.Date.format(new Date(), "g:i:s A ") + '] ';

            newMsg += '[<i>' + (fromField.name ? fromField.name : fromField) + '</i> fired <b>' + msgType + '</b>]<br />' + msg;

            msgBlock.update(msgBlock.el.dom.innerHTML + '<hr />' + newMsg);
            msgBlock.el.scroll('down', msgBlock.el.dom.scrollHeight);
        } else {
            if (!this._msgs) {
                this._msgs = [];
            }
            this._msgs.push([fromField, msgType, msg]);
        }
    }


});

EHR.DataEntryUtils.registerGridButton('ADDSTARTEDDEPRIVES', function(config){
    return Ext4.Object.merge({
        text: 'Add Started Deprives',
        tooltip: 'Click to automatically add started deprives',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddStartedFoodDeprivesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
