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
        var popUpRoom = null;

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
                xtype: 'ehr-areafield',
                multiSelect: false,
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'boxselect',
                height: 100,
                itemId: 'animalId',
                fieldLabel: 'Animal ID',
                displayField: 'Id',
                valueField: 'Id',
               // modal: true,
                multiSelect: true,
                delimiter: ';',
                queryMode: 'local',
                pinList: true,
                growMax: true,
                /*triggerOnClick: true,
                triggerAction: this.getFieldListeners(),*/
               // stacked: false,
                store: {
                    type: 'labkey-store',
                    autoLoad: true,
                    schemaName: 'study',
                    queryName: 'foodDeprives',
                    viewName: 'Started Food Deprives',
                    sort: 'id'

                },
                listConfig:{
                    itemCls: 'x-boundlist-item'
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
        var animalid = EHR.DataEntryUtils.ensureArray(this.down('#animalId').getValue()) || [];
        var area = this.down('#areaField') ? this.down('#areaField').getValue() : null;
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];
        var performedBy = this.down('#performedBy') ? this.down('#performedBy').getValue() : null;

        if (!animalid.length && !area && !rooms.length){
            alert('Must provide at least an animalId, one room, or an area');
            return;
        }
        if (!performedBy){
            Ext4.Msg.alert('Error','Must enter initials in the  \'PerformedBy\' field');
            return;
        }
        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('QCState/label', 'Started', LABKEY.Filter.Types.STARTS_WITH));

        if (animalid.length > 0)
            filterArray.push(LABKEY.Filter.create('Id', animalid.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));
        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

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
            columns: 'lsid,objectid,Id,date,project,account,schedule,reason,remarks,assignedTo,separated,protocolContact,depriveStartedBy,depriveStartTime,taskid,requestid,modified,qcstate',
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

            var tempModel = this.targetStore.createModel({
                lsid:               row.getValue('lsid'),
                Id:                 row.getValue('Id'),
                date:               row.getValue('date'),
                project:            row.getValue('project'),
                account:            row.getValue('account'),
                schedule:           row.getValue('schedule'),
                reason:             row.getValue('reason'),
                remarks:            row.getValue('remarks'),
                assignedTo:         row.getValue('assignedTo'),
                depriveStartTime:   row.getValue('depriveStartTime'),
                depriveStartedBy:   row.getValue('depriveStartedBy'),
                separated:          row.getValue('separated'),
                protocolContact:    row.getValue('protocolContact'),
                foodRestoredBy:     performedby,
                startedTaskId:      startTaskId,
                taskId:             this.targetStore.storeCollection.getTaskId(),
                requestid:          row.getValue('requestid'),
                modified:           row.getValue('modified'),
                qcstate:            row.getValue('qcstate')

            });
            tempModel.phantom = false;
            records.push(tempModel);
        }, this);

        if (records.length && startedTaskIds.length){
            this.targetStore.add(records);
            this.completeStartedTask(startedTaskIds);
            Ext4.Msg.hide();
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
                            //Ext4.Msg.hide();
                           // this.close();
                        },
                        failure: function(){
                            console.log('Cannot update start tasks');
                           // Ext4.Msg.hide();
                        }

                    })

                }
            })
        },this);


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
