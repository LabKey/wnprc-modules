/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('WNPRC_EHR.ext', 'WNPRC_EHR.Utils', 'WNPRC_EHR.DatasetButtons');


WNPRC_EHR.DatasetButtons = new function(){

    return {
        /**
         * Designed to duplicate a previously saved task.  It appears on the Task dataregions of the data entry page.
         * It allows the user to pick a default date for all new records.  If the task type is an encounter (ie. one animal per form)
         * then it will let the user enter a list of animals and one task will be created per animal.  If not, then all animal IDs will be copied
         * exactly from the previous task.
         *
         * @param dataRegionName
         */
        duplicateTaskHandler: function(dataRegion){
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }
            else if (checked.length > 1) {
                alert('Can only select 1 task at a time');
                return;
            }

            var existingQueries = [];
            var existingRecords = {};
            var pendingRequests = -1;
            var taskid = checked[0];

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'tasks',
                columns: 'taskid,qcstate,title,formtype,formtype/category,formtype/permitsSingleIdOnly',
                filterArray: [
                    LABKEY.Filter.create('taskid', taskid, LABKEY.Filter.Types.EQUAL)
                    //LABKEY.Filter.create('category', 'Task', LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: onSuccess,
                failure: LDK.Utils.getErrorCallback()
            });

            function onSuccess(data){
                if (!data || data.rows.length!=1){
                    alert('Task not found');
                    return;
                }

                var row = data.rows[0];
                var oldDate = row.duedate;

                LABKEY.Query.selectRows({
                    schemaName: 'ehr',
                    queryName: 'formpanelsections',
                    columns: 'schemaName,queryName',
                    filterArray: [
                        LABKEY.Filter.create('formtype', row.formtype, LABKEY.Filter.Types.EQUAL)
                    ],
                    scope: this,
                    success: function(data){
                        pendingRequests = 0;
                        Ext4.each(data.rows, function(r){
                            if (r.schemaName && r.schemaName.match(/study/i)){
                                pendingRequests++;
                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: r.queryName,
                                    viewName:  '~~UPDATE~~',
                                    columns: EHR.Metadata.Columns[r.queryName] || null,
                                    filterArray: [
                                        LABKEY.Filter.create('taskid', taskid, LABKEY.Filter.Types.EQUAL)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        if (data.rows.length){
                                            existingRecords[r.queryName] = [];
                                            Ext4.each(data.rows, function(rec){
                                                delete rec.lsid;
                                                delete rec.objectid;
                                                delete rec.taskid;
                                                delete rec.requestid;
                                                delete rec.performedby;

                                                existingRecords[r.queryName].push(rec);
                                            }, this);
                                        }
                                        pendingRequests--;
                                    },
                                    failure: LDK.Utils.getErrorCallback()
                                });
                            }
                        });
                    },
                    failure: LDK.Utils.getErrorCallback()
                });

                new Ext.Window({
                    title: 'Duplicate Task',
                    width: 330,
                    autoHeight: true,
                    items: [{
                        xtype: 'form',
                        ref: 'theForm',
                        bodyStyle: 'padding: 5px;',
                        defaults: {
                            border: false
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Title',
                            width: 200,
                            value: row.formtype,
                            ref: 'titleField'
                        },{
                            xtype: 'combo',
                            fieldLabel: 'Assigned To',
                            width: 200,
                            value: LABKEY.Security.currentUser.id,
                            triggerAction: 'all',
                            mode: 'local',
                            store: new LABKEY.ext.Store({
                                xtype: 'labkey-store',
                                schemaName: 'core',
                                queryName: 'PrincipalsWithoutAdmin',
                                columns: 'UserId,DisplayName',
                                sort: 'Type,DisplayName',
                                autoLoad: true
                            }),
                            displayField: 'DisplayName',
                            valueField: 'UserId',
                            ref: 'assignedTo'
                        },{
                            xtype: 'textarea',
                            fieldLabel: 'ID(s)',
                            ref: 'ids',
                            width: 200,
                            hidden: !row['formtype/permitsSingleIdOnly']
                        },{
                            xtype: 'xdatetime',
                            fieldLabel: 'Date',
                            width: 200,
                            //value: new Date(),
                            ref: 'date'
                        },{
                            xtype: 'displayfield',
                            value: '**Leave date blank to copy from existing records'
                        }]
                    }],
                    buttons: [{
                        text:'Submit',
                        disabled:false,
                        formBind: true,
                        ref: '../submit',
                        scope: this,
                        handler: function(o){
                            Ext4.Msg.wait('Loading...');

                            var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                            if (!assignedTo){
                                alert('Must assign to someone');
                                Ext4.Msg.hide();
                                return;
                            }
                            var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                            if (!title){
                                alert('Must enter a title');
                                Ext4.Msg.hide();
                                return;
                            }

                            var date = o.ownerCt.ownerCt.theForm.date.getValue();

                            var subjectArray = o.ownerCt.ownerCt.theForm.ids.getValue();
                            if (subjectArray){
                                subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
                                subjectArray = subjectArray.replace(/(^;|;$)/g, '');
                                subjectArray = subjectArray.toLowerCase();
                                subjectArray = subjectArray.split(';');
                            }

                            o.ownerCt.ownerCt.close();

                            LABKEY.Utils.onTrue({
                                testCallback: function(){
                                    return pendingRequests==0;
                                },
                                success: onTrue,
                                scope: this,
                                //successArguments: ['FileUploadField is ready to use!'],
                                failure: LDK.Utils.getErrorCallback(),
                                maxTests: 1000
                            });

                            function onTrue(){
                                var toUpdate = [];
                                var obj;
                                for(var query in existingRecords){
                                    obj = {
                                        schemaName: 'study',
                                        queryName: query,
                                        rows: []
                                    }
                                    Ext4.each(existingRecords[query], function(record){
                                        if (date)
                                            record.date = date;

                                        obj.rows.push(record);
                                    }, this);
                                    if (obj.rows.length)
                                        toUpdate.push(obj);
                                }

                                var duedate = date || oldDate;
                                if (duedate){ duedate = duedate.toGMTString()};

                                var taskConfig = {
                                    initialQCState: 'Scheduled',
                                    childRecords: toUpdate,
                                    existingRecords: null,
                                    taskRecord: {duedate: duedate, assignedTo: assignedTo, category: 'task', title: title, formType: row.formtype},
                                    success: function(response, options, config){
                                        Ext4.Msg.hide();
                                        Ext4.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                            if (btn == 'yes'){
                                                window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                            }
                                            else {
                                                dataRegion.refresh();
                                            }
                                        }, this)
                                    },
                                    failure: function(error){
                                        console.log('failure');
                                        console.log(error);
                                        Ext4.Msg.hide();
                                    }
                                }

                                if (subjectArray.length){

                                    Ext4.each(subjectArray, function(id){
                                        var cfg = Ext4.apply({}, taskConfig);
                                        cfg.taskRecord.title = title + ': ' + id;
                                        Ext4.each(cfg.childRecords, function(tableRecords){
                                            Ext4.each(tableRecords.rows, function(record){
                                                // Strip off the ': ID' suffix on the title if there is one
                                                if (record.title && record.title.indexOf(':') > 0)
                                                {
                                                    record.title = record.title.substring(0, record.title.indexOf(':') );
                                                }
                                                record.Id = id;
                                            }, this);
                                        }, this);
                                        EHR.Utils.createTask(cfg);
                                    }, this);
                                }
                                else {
                                    EHR.Utils.createTask(taskConfig);
                                }
                            }
                        }
                    },{
                        text: 'Close',
                        handler: function(o){
                            o.ownerCt.ownerCt.close();
                        }
                    }]
                }).show();
            }
        },

        /**
         * Adds a button to a dataRegion that will allow the user to mark Clinpath Runs records as 'reviewed' (which means updating the reviewedBy field).
         * This was intended as a mechanism for vets to indicate that they have viewed clinpath results.
         * @param dataRegionName
         * @param menu
         * @param schemaName
         * @param queryName
         * @param config
         */
        addMarkReviewedBtn: function(dataRegionName, menu, schemaName, queryName, config){
            config = config || {};

            menu.add({
                text: 'Mark Reviewed',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    new Ext.Window({
                        title: 'Mark Reviewed',
                        closeAction: 'destory',
                        width: 330,
                        autoHeight: true,
                        items: [{
                            xtype: 'form',
                            ref: 'theForm',
                            bodyStyle: 'padding: 5px;',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Initials',
                                width: 200,
                                value: LABKEY.Security.currentUser.displayName,
                                ref: 'initials'
                            }]
                        }],
                        buttons: [{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: function(o){
                                Ext.Msg.wait('Loading...');
                                var initials = o.ownerCt.ownerCt.theForm.initials.getValue();
                                if(!initials){
                                    alert('Must enter initials');
                                    return;
                                }

                                o.ownerCt.ownerCt.close();

                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: 'Clinpath Runs',
                                    filterArray: [
                                        LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        var toUpdate = [];
                                        var skipped = [];

                                        if(!data.rows || !data.rows.length){
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                            return;
                                        }

                                        Ext.each(data.rows, function(row){
                                            if(!row.dateReviewed)
                                                toUpdate.push({lsid: row.lsid, dateReviewed: new Date(), reviewedBy: initials});
                                            else
                                                skipped.push(row.lsid)
                                        }, this);

                                        if(toUpdate.length){
                                            LABKEY.Query.updateRows({
                                                schemaName: 'study',
                                                queryName: 'Clinpath Runs',
                                                rows: toUpdate,
                                                scope: this,
                                                success: function(){
                                                    Ext.Msg.hide();
                                                    dataRegion.selectNone();
                                                    dataRegion.refresh();
                                                },
                                                failure: EHR.Utils.onError
                                            });
                                        }
                                        else {
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                        }

                                        if(skipped.length){
                                            alert('One or more rows was skipped because it already has been reviewed');
                                        }
                                    },
                                    failure: EHR.Utils.onError
                                });
                            }
                        },{
                            text: 'Close',
                            handler: function(o){
                                o.ownerCt.ownerCt.close();
                            }
                        }]
                    }).show();



                    function onSuccess(data){
                        if(!data || !data.rows){
                            return;
                        }

                        Ext.Msg.hide();

                    }
                }
            })
        },

        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         * @param dataRegion
         * @param menu
         * @param config
         * @param [config.formType]
         */
        addCreateTaskFromIdsBtn: function(dataRegionName, menu, config){
            menu.add({
                text: 'Schedule '+config.formType,
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    var ids = [];
                    Ext.each(checked, function(item){
                        item = item.split('.');
                        ids.push(item[item.length-1]);
                    }, this);

                    new Ext.Window({
                        title: 'Schedule '+config.formType,
                        width: 330,
                        autoHeight: true,
                        items: [{
                            xtype: 'form',
                            ref: 'theForm',
                            bodyStyle: 'padding: 5px;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: 'Total IDs: '+checked.length+'<br><br>',
                                tag: 'div'
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'Title',
                                width: 200,
                                value: config.formType,
                                ref: 'titleField'
                            },{
                                xtype: 'xdatetime',
                                fieldLabel: 'Date',
                                width: 200,
                                value: new Date(),
                                ref: 'date'
                            },{
                                xtype: 'combo',
                                fieldLabel: 'Assigned To',
                                width: 200,
                                value: LABKEY.Security.currentUser.id,
                                triggerAction: 'all',
                                mode: 'local',
                                store: new LABKEY.ext.Store({
                                    xtype: 'labkey-store',
                                    schemaName: 'core',
                                    queryName: 'PrincipalsWithoutAdmin',
                                    columns: 'UserId,DisplayName',
                                    sort: 'Type,DisplayName',
                                    autoLoad: true
                                }),
                                displayField: 'DisplayName',
                                valueField: 'UserId',
                                ref: 'assignedTo'
                            }]
                        }],
                        buttons: [{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: function(o){
                                Ext.Msg.wait('Loading...');
                                var date = o.ownerCt.ownerCt.theForm.date.getValue();
                                date = date.toGMTString();
                                if(!date){
                                    alert('Must enter a date');
                                    o.ownerCt.ownerCt.close();
                                }

                                var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                                if(!assignedTo){
                                    alert('Must assign to someone');
                                    o.ownerCt.ownerCt.close();
                                }
                                var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                                if(!title){
                                    alert('Must enter a title');
                                    o.ownerCt.ownerCt.close();
                                }

                                var toUpdate = [];
                                Ext.each(config.queries, function(q){
                                    var obj = {
                                        schemaName: q.schemaName,
                                        queryName: q.queryName,
                                        rows: []
                                    };

                                    Ext.each(ids, function(id){
                                        obj.rows.push({Id: id, date: date});
                                    }, this);

                                    toUpdate.push(obj);
                                }, this);

                                o.ownerCt.ownerCt.close();

                                EHR.Utils.createTask({
                                    initialQCState: 'Scheduled',
                                    childRecords: toUpdate,
                                    taskRecord: {date: date, assignedTo: assignedTo, category: 'task', title: title, formType: config.formType},
                                    success: function(response, options, config){
                                        Ext.Msg.hide();
                                        Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                            if(btn == 'yes'){
                                                window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                            }
                                            else {
                                                dataRegion.refresh();
                                            }
                                        }, this)
                                    },
                                    failure: function(){
                                        console.log('failure');
                                        Ext.Msg.hide();
                                    }
                                });
                            }
                        },{
                            text: 'Close',
                            handler: function(o){
                                o.ownerCt.ownerCt.close();
                            }
                        }]
                    }).show();



                    function onSuccess(data){
                        if(!data || !data.rows){
                            return;
                        }

                        Ext.Msg.hide();

                    }
                }
            });
        },

        /**
         * This add a button that allows the user to create a task from requested records.  It was originally created to allow users to create Blood Draw or ClinPath
         * tasks from requested records.
         * @param dataRegionName
         * @param menu
         * @param config
         * @param [config.formType]
         */
        addCreateTaskBtn: function(dataRegionName, menu, config){
            config = config || {};

            menu.add({
                text: 'Schedule '+config.formType+' Task',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    //NOTE: it might be a good idea to check that the dates match on input records and enforce this when making a task
                    //            if(config.enforceDate){
                    //
                    //            }
                    //            else {
                    //                createWindow();
                    //            }

                    createWindow();

                    function createWindow(){
                        new Ext.Window({
                            title: 'Schedule '+config.formType,
                            width: 330,
                            autoHeight: true,
                            items: [{
                                xtype: 'form',
                                ref: 'theForm',
                                bodyStyle: 'padding: 5px;',
                                defaults: {
                                    border: false
                                },
                                items: [{
                                    html: 'Total Records: '+checked.length+'<br><br>',
                                    tag: 'div'
                                },{
                                    xtype: 'textfield',
                                    fieldLabel: 'Title',
                                    width: 200,
                                    value: config.formType,
                                    ref: 'titleField'
                                },{
                                    xtype: 'xdatetime',
                                    fieldLabel: 'Date',
                                    width: 200,
                                    value: new Date(),
                                    ref: 'date'
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'Assigned To',
                                    width: 200,
                                    value: LABKEY.Security.currentUser.id,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    store: new LABKEY.ext.Store({
                                        xtype: 'labkey-store',
                                        schemaName: 'core',
                                        queryName: 'PrincipalsWithoutAdmin',
                                        columns: 'UserId,DisplayName',
                                        sort: 'Type,DisplayName',
                                        autoLoad: true
                                    }),
                                    displayField: 'DisplayName',
                                    valueField: 'UserId',
                                    ref: 'assignedTo'
                                }]
                            }],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                formBind: true,
                                ref: '../submit',
                                scope: this,
                                handler: function(o){
                                    Ext.Msg.wait('Loading...');
                                    var date = o.ownerCt.ownerCt.theForm.date.getValue();
                                    date = date.toGMTString();
                                    if(!date){
                                        alert('Must enter a date');
                                        o.ownerCt.ownerCt.close();
                                    }

                                    var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                                    if(!assignedTo){
                                        alert('Must assign to someone');
                                        o.ownerCt.ownerCt.close();
                                    }
                                    var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                                    if(!title){
                                        alert('Must enter a title');
                                        o.ownerCt.ownerCt.close();
                                    }

                                    o.ownerCt.ownerCt.close();

                                    var existingRecords = {};
                                    existingRecords[dataRegion.queryName] = checked;

                                    EHR.Utils.createTask({
                                        initialQCState: 'Scheduled',
                                        childRecords: null,
                                        existingRecords: existingRecords,
                                        taskRecord: {date: date, assignedTo: assignedTo, category: 'task', title: title, formType: config.formType},
                                        success: function(response, options, config){
                                            Ext.Msg.hide();
                                            Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                                if(btn == 'yes'){
                                                    window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                                }
                                                else {
                                                    dataRegion.refresh();
                                                }
                                            }, this)
                                        },
                                        failure: function(){
                                            console.log('failure');
                                            Ext.Msg.hide();
                                        }
                                    });
                                }
                            },{
                                text: 'Close',
                                handler: function(o){
                                    o.ownerCt.ownerCt.close();
                                }
                            }]
                        }).show();
                    }

                    function onSuccess(data){
                        if(!data || !data.rows){
                            return;
                        }

                        Ext.Msg.hide();

                    }
                }
            });
        },

        /**
         * This add a button to a dataset that allows the user to change the QCState of the records, designed to approve or deny blood requests.
         * It also captures values for 'billedBy' and 'instructions'.
         * @param dataRegionName
         * @param menu
         */
        addChangeBloodQCStateBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Change Request Status',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    Ext.Msg.wait('Loading...');
                    LABKEY.Query.selectRows({
                        schemaName: dataRegion.schemaName,
                        queryName: dataRegion.queryName,
                        columns: 'lsid,dataset/Label,Id,date,requestid,taskid',
                        filterArray: [LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
                        scope: this,
                        success: onSuccess,
                        failure: EHR.Utils.onError
                    });

                    function onSuccess(data){
                        var records = data.rows;

                        if(!records || !records.length){
                            Ext.Msg.hide();
                            alert('No records found');
                            return;
                        }

                        Ext.Msg.hide();
                        new Ext.Window({
                            title: 'Change Request Status',
                            width: 330,
                            autoHeight: true,
                            items: [{
                                xtype: 'form',
                                ref: 'theForm',
                                bodyStyle: 'padding: 5px;',
                                defaults: {
                                    border: false
                                },
                                items: [{
                                    html: 'Total Records: '+checked.length+'<br><br>',
                                    tag: 'div'
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'Status',
                                    width: 200,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    store: new LABKEY.ext.Store({
                                        xtype: 'labkey-store',
                                        schemaName: 'study',
                                        queryName: 'qcstate',
                                        columns: 'rowid,label',
                                        sort: 'label',
                                        filterArray: [LABKEY.Filter.create('label', 'Request', LABKEY.Filter.Types.STARTS_WITH)],
                                        autoLoad: true
                                    }),
                                    displayField: 'Label',
                                    valueField: 'RowId',
                                    ref: 'qcstate'
                                },{
                                    xtype: 'combo',
                                    width: 200,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    fieldLabel: 'Billed By (for blood only)',
                                    store: new LABKEY.ext.Store({
                                        xtype: 'labkey-store',
                                        schemaName: 'ehr_lookups',
                                        queryName: 'blood_billed_by',
                                        columns: 'value,description',
                                        sort: 'title',
                                        autoLoad: true
                                    }),
                                    displayField: 'description',
                                    valueField: 'value',
                                    ref: 'billedby'
                                },{
                                    xtype: 'textarea',
                                    ref: 'instructions',
                                    fieldLabel: 'Instructions',
                                    width: 200
                                }]
                            }],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                formBind: true,
                                ref: '../submit',
                                scope: this,
                                handler: function(o){
                                    var qc = o.ownerCt.ownerCt.theForm.qcstate.getValue();
                                    var billedby = o.ownerCt.ownerCt.theForm.billedby.getValue();
                                    var instructions = o.ownerCt.ownerCt.theForm.instructions.getValue();

                                    if(!qc && !billedby && !instructions){
                                        alert('Must enter either status, billed by or instructions');
                                        return;
                                    }

                                    Ext.Msg.wait('Loading...');

                                    var multi = new LABKEY.MultiRequest();

                                    var toUpdate = {};
                                    var obj;
                                    Ext.each(records, function(rec){
                                        if(!toUpdate[rec['dataset/Label']])
                                            toUpdate[rec['dataset/Label']] = [];

                                        obj = {lsid: rec.lsid};
                                        if(qc)
                                            obj.QCState = qc;
                                        if(billedby)
                                            obj.billedby = billedby;
                                        if(instructions)
                                            obj.instructions = instructions;

                                        toUpdate[rec['dataset/Label']].push(obj)
                                    }, this);

                                    for(var i in toUpdate){
                                        multi.add(LABKEY.Query.updateRows, {
                                            schemaName: 'study',
                                            queryName: i,
                                            rows: toUpdate[i],
                                            scope: this,
                                            failure: EHR.Utils.onError
                                        });
                                    }

                                    multi.send(function(){
                                        Ext.Msg.hide();
                                        dataRegion.selectNone();

                                        o.ownerCt.ownerCt.close();
                                        dataRegion.refresh();
                                    }, this);
                                }
                            },{
                                text: 'Close',
                                handler: function(o){
                                    o.ownerCt.ownerCt.close();
                                }
                            }]
                        }).show();
                    }
                }
            })
        },

        /**
         * This add a button to a dataset that allows the user to change the QCState of the records, designed to approve or deny clinpath requests.
         * @param dataRegionName
         * @param menu
         */
        addChangeQCStateBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Change Request Status',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    Ext.Msg.wait('Loading...');
                    LABKEY.Query.selectRows({
                        schemaName: dataRegion.schemaName,
                        queryName: dataRegion.queryName,
                        columns: 'lsid,dataset/Label,Id,date,requestid,taskid',
                        filterArray: [LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
                        scope: this,
                        success: onSuccess,
                        failure: EHR.Utils.onError
                    });

                    function onSuccess(data){
                        var records = data.rows;

                        if(!records || !records.length){
                            Ext.Msg.hide();
                            alert('No records found');
                            return;
                        }

                        Ext.Msg.hide();
                        new Ext.Window({
                            title: 'Change Request Status',
                            width: 330,
                            autoHeight: true,
                            items: [{
                                xtype: 'form',
                                ref: 'theForm',
                                bodyStyle: 'padding: 5px;',
                                defaults: {
                                    border: false
                                },
                                items: [{
                                    html: 'Total Records: '+checked.length+'<br><br>',
                                    tag: 'div'
                                },{
                                    xtype: 'combo',
                                    fieldLabel: 'Status',
                                    width: 200,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    store: new LABKEY.ext.Store({
                                        xtype: 'labkey-store',
                                        schemaName: 'study',
                                        queryName: 'qcstate',
                                        columns: 'rowid,label',
                                        sort: 'label',
                                        filterArray: [LABKEY.Filter.create('label', 'Request', LABKEY.Filter.Types.STARTS_WITH)],
                                        autoLoad: true
                                    }),
                                    displayField: 'Label',
                                    valueField: 'RowId',
                                    ref: 'qcstate'
                                }]
                            }],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                formBind: true,
                                ref: '../submit',
                                scope: this,
                                handler: function(o){
                                    var qc = o.ownerCt.ownerCt.theForm.qcstate.getValue();

                                    if(!qc){
                                        alert('Must choose a status');
                                        return;
                                    }

                                    Ext.Msg.wait('Loading...');

                                    var multi = new LABKEY.MultiRequest();

                                    var toUpdate = {};
                                    var obj;
                                    Ext.each(records, function(rec){
                                        if(!toUpdate[rec['dataset/Label']])
                                            toUpdate[rec['dataset/Label']] = [];

                                        obj = {lsid: rec.lsid};
                                        if(qc)
                                            obj.QCState = qc;

                                        toUpdate[rec['dataset/Label']].push(obj)
                                    }, this);

                                    for(var i in toUpdate){
                                        multi.add(LABKEY.Query.updateRows, {
                                            schemaName: 'study',
                                            queryName: i,
                                            rows: toUpdate[i],
                                            scope: this,
                                            failure: EHR.Utils.onError
                                        });
                                    }

                                    multi.send(function(){
                                        Ext.Msg.hide();
                                        dataRegion.selectNone();

                                        o.ownerCt.ownerCt.close();
                                        dataRegion.refresh();
                                    }, this);
                                }
                            },{
                                text: 'Close',
                                handler: function(o){
                                    o.ownerCt.ownerCt.close();
                                }
                            }]
                        }).show();
                    }
                }
            })
        },

        /**
         * This button will shift the user to a Task page for assignments, allowing them to enter a batch of assignments at once.
         * @param dataRegion
         * @param menu
         */
        addAssignmentTaskBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Add Batch of Assignments',
                dataRegionName: dataRegionName,
                handler: function(){
                    window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {formtype: 'Assignment'});
                }
            });
        },

        /**
         * This button will shift the user to a Feeding task, allowing them to add a batch of records.
         * @param dataRegionName
         * @param menu
         */
        addFeedingTaskBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Add Batch of Records',
                dataRegionName: dataRegionName,
                handler: function(){
                    window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {formtype: 'Feeding'});
                }
            });
        }
    }
};