/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.MultiAnimalFilterType', {
    extend: 'LDK.panel.MultiSubjectFilterType',
    alias: 'widget.ehr-multianimalfiltertype',

    statics: {
        filterName: 'multiSubject',
        label: 'Multiple Animals'
    },

    searchOptions: {
        room: true,
        cage: true,
        project: true,
        protocol: true
    },

    getItems: function(){
        var ctx = this.filterContext || {};
        var me = this;

        var toAdd = this.callParent();
        var items = [{
            layout: 'hbox',
            border: false,
            defaults: {
                border: false
            },
            items: toAdd
        }];

        if(this.searchOptions.room || this.searchOptions.cage) {
            var roomCageTitle = 'Search By ' + (this.searchOptions.room?'Room':'')
                    + ((this.searchOptions.room && this.searchOptions.cage)?'/':'')
                    + (this.searchOptions.cage?'Cage':'');
            items.push({
                xtype: 'ldk-linkbutton',
                text: '[' + roomCageTitle + ']',
                minWidth: 80,
                style: 'padding-left:200px;',
                handler: function (btn)
                {
                    var panel = btn.up('ehr-multianimalfiltertype');
                    var items = [];

                    if(me.searchOptions.room) {
                        items.push({
                            xtype: 'ehr-roomfield',
                            itemId: 'room',
                            name: 'roomField',
                            multiSelect: false,
                            showOccupiedOnly: true,
                            style: 'margin-top: 5px',
                            width: 300
                        });
                    }

                    if(me.searchOptions.cage) {
                        items.push({
                            xtype: 'ehr-cagefield',
                            fieldLabel: 'Cage',
                            name: 'cageField',
                            itemId: 'cage',
                            style: 'margin-top: 5px',
                            width: 300
                        });
                    }

                    Ext4.create('Ext.window.Window', {
                        modal: true,
                        width: 330,
                        closeAction: 'destroy',
                        title: roomCageTitle,
                        items: [{
                            xtype: 'form',
                            bodyStyle: 'padding:5px',
                            items: items
                        }],
                        buttons: [{
                            text: 'Submit',
                            disabled: false,
                            itemId: 'submit',
                            scope: panel,
                            handler: panel.loadRoom
                        }, {
                            text: 'Close',
                            handler: function (btn) {
                                btn.up('window').hide();
                            }
                        }]
                    }).show(btn);
                }
            });
        }

        if(this.searchOptions.project || this.searchOptions.protocol) {
            var projectProtocolTitle = 'Search By ' + (this.searchOptions.project ? 'Project' : '')
                    + ((this.searchOptions.project && this.searchOptions.protocol) ? '/' : '')
                    + (this.searchOptions.protocol ? 'Protocol' : '');
            items.push({
                xtype: 'ldk-linkbutton',
                text: '[' + projectProtocolTitle + ']',
                minWidth: 80,
                handler: function (btn)
                {
                    var panel = btn.up('ehr-multianimalfiltertype');
                    var items = [];

                    if(me.searchOptions.project) {
                        items.push({
                            xtype: 'ehr-projectfield',
                            itemId: 'project',
                            style: 'margin-top: 5px',
                            onlyIncludeProjectsWithAssignments: true
                        });
                    }

                    if(me.searchOptions.protocol) {
                        items.push({
                            xtype: 'ehr-protocolfield',
                            itemId: 'protocol',
                            style: 'margin-top: 5px',
                            onlyIncludeProtocolsWithAssignments: true
                        });
                    }

                    Ext4.create('Ext.window.Window', {
                        modal: true,
                        width: 330,
                        closeAction: 'destroy',
                        title: projectProtocolTitle,
                        items: items,
                        buttons: [{
                            text: 'Submit',
                            disabled: false,
                            itemId: 'submit',
                            scope: panel,
                            handler: panel.loadProject
                        }, {
                            text: 'Close',
                            handler: function (btn) {
                                btn.up('window').close();
                            }
                        }]
                    }).show(btn);
                },
                style: 'margin-bottom:10px;padding-left:200px;'
            });
        }


        return [{
            xtype: 'panel',
            width: 500,
            border: false,
            defaults: {
                border: false
            },
            items: items
        }];
    },

    loadProject: function(btn){
        var win = btn.up('window');
        var projectEl = win.down('#project'), protocolEl = win.down('#protocol');
        var project, protocol;
        if(projectEl) {
            project = projectEl.getValue();
            projectEl.reset();
        }
        if(protocolEl) {
            protocol = protocolEl.getValue();
            protocolEl.reset();
        }

        win.close();

        Ext4.Msg.wait("Loading..");

        if(!project && !protocol){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(project){
            filters.push(LABKEY.Filter.create('project', project, LABKEY.Filter.Types.EQUAL))
        }

        if(protocol){
            protocol = protocol.toLowerCase();
            if(this.searchOptions.project)
                filters.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL))
            else //Assuming if not looking with project then assignments has a protocol column
                filters.push(LABKEY.Filter.create('protocol', protocol, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Assignment',
            viewName: 'Active Assignments',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.tabbedReportPanel.setSubjGrid(true, Ext4.isDefined(this.aliasTable), subjectArray);
                }
                Ext4.Msg.hide();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    },

    loadRoom: function(btn){
        var housingWin = btn.up('window');
        var roomEl = win.down('#room'), cageEl = win.down('#cage');
        var room, cage;
        if(roomEl) {
            room = roomEl.getValue();
            roomEl.reset();
        }
        if(cageEl) {
            cage = cageEl.getValue();
            cageEl.reset();
        }

        housingWin.close();

        Ext4.Msg.wait("Loading...");

        if(!room && !cage){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(room){
            room = room.toLowerCase();
            filters.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.STARTS_WITH))
        }

        if(cage){
            filters.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            viewName: 'Active Housing',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.tabbedReportPanel.setSubjGrid(true, Ext4.isDefined(this.aliasTable), subjectArray);
                }
                Ext4.Msg.hide();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    }
});