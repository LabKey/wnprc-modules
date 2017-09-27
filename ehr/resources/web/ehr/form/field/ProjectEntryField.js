/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 *
 * @cfg includeDefaultProjects defaults to true
 */
Ext4.define('EHR.form.field.ProjectEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-projectentryfield',

    fieldLabel: 'Project',
    typeAhead: true,
    forceSelection: true, //NOTE: has been re-enabled, but it is important to let the field get set prior to loading
    emptyText:'',
    disabled: false,
    matchFieldWidth: false,
    includeDefaultProjects: true,

    initComponent: function(){
        this.allProjectStore = EHR.DataEntryUtils.getProjectStore();

        this.trigger2Cls = Ext4.form.field.ComboBox.prototype.triggerCls;
        this.onTrigger2Click = Ext4.form.field.ComboBox.prototype.onTriggerClick;

        Ext4.apply(this, {
            displayField: 'displayName',
            valueField: 'project',
            queryMode: 'local',
            plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                createWindow: function(){
                    this.window = Ext4.create('Ext.window.Window', {
                        modal: true,
                        closeAction: 'destroy',
                        bodyStyle: 'padding: 5px',
                        title: 'Choose Project',
                        items: [{
                            xtype: 'ehr-projectfield',
                            width: 400,
                            fieldLabel: 'Project',
                            itemId: 'projectField',
                            listeners: {
                                specialkey: function(field, e){
                                    if (e.getKey() === e.ENTER && !field.isExpanded){
                                        var btn = field.up('window').down('button[text=Submit]');
                                        btn.handler.apply(btn.scope, [btn]);
                                    }
                                }
                            }
                        },{
                            xtype: 'ldk-linkbutton',
                            linkTarget: '_blank',
                            text: '[View All Projects]',
                            href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'ehr', 'query.queryName': 'project', 'query.viewName': 'Active Projects'}),
                            style: 'padding-top: 5px;padding-bottom: 5px;padding-left: 100px;'
                        }],
                        buttons: [{
                            scope: this,
                            text: 'Submit',
                            handler: function(btn){
                                var win = btn.up('window');
                                var field = win.down('#projectField');
                                var project = field.getValue();
                                if (!project){
                                    Ext4.Msg.alert('Error', 'Must enter a project');
                                    return;
                                }

                                var rec = field.findRecord('project', project);
                                LDK.Assert.assertTrue('Project record not found for id: ' + project, !!rec);

                                if (rec){
                                    this.onPrompt('ok', {
                                        project: project,
                                        displayName: rec.get('displayName'),
                                        protocolDisplayName: rec.get('protocol/displayName'),
                                        protocol: rec.get('protocol'),
                                        title: rec.get('title'),
                                        shortname: rec.get('shortname'),
                                        investigator: rec.get('investigatorId/lastName')
                                    });

                                    win.close();
                                }
                                else {
                                    Ext4.Msg.alert('Error', 'Unknown Project');
                                }
                            }
                        },{
                            text: 'Cancel',
                            handler: function(btn){
                                btn.up('window').close();
                            }
                        }],
                        listeners: {
                            show: function(win){
                                var field = win.down('combo');
                                Ext4.defer(field.focus, 100, field);
                            }
                        }
                    }).show();
                },

                onBeforeComplete: function(){
                    return !this.window || !this.window.isVisible();
                }
            })],
            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: {
                type: 'labkey-store',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'sort_order,project',
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.resolveProjectFromStore();
                        this.getPicker().refresh();
                    }
                }
            },
            listeners: {
                scope: this,
                beforerender: function(field){
                    var target = field.up('form');
                    if (!target)
                        target = field.up('grid');

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'animalchange', field.getProjects, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }

                    //attempt to load for the bound Id
                    this.getProjects();
                }
            }
        });

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            innerTpl: this.getInnerTpl(),
            getInnerTpl: function(){
                return this.innerTpl;
            },
            style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        });

        this.callParent(arguments);

        this.on('render', function(){
            Ext4.QuickTips.register({
                target: this.triggerEl.elements[0],
                text: 'Click to recalculate allowable projects'
            });
        }, this);
    },

    getInnerTpl: function(){
        return ['<span style="white-space:nowrap;{[values["isAssigned"] ? "font-weight:bold;" : ""]}">{[values["displayName"] + " " + (values["shortname"] ? ("(" + values["shortname"] + ")") : (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") : "") + (values["account"] ? ": " + values["account"] : "") + (values["investigator"] ? ")" : ""))]}&nbsp;</span>'];
    },

    trigger1Cls: 'x4-form-search-trigger',

    onTrigger1Click: function(){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            Ext4.Msg.alert('Error', 'Unable to locate associated animal Id');
            return;
        }

        var id = boundRecord.get('Id');
        if (!id){
            Ext4.Msg.alert('Error', 'No Animal Id Provided');
            return;
        }

        this.getProjects(id);
    },

    getDisallowedProtocols: function(){
        return null;
    },

    makeSql: function(id, date){
        if (!id && !this.includeDefaultProjects)
            return;

        //avoid unnecessary reloading
        var key = id + '||' + date;
        if (this.loadedKey == key){
            return;
        }
        this.loadedKey = key;

        var sql = "SELECT DISTINCT t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.investigator, t.title, t.shortname, false as fromClient, min(sort_order) as sort_order, max(isAssigned) as isAssigned FROM (";

        if (id){
            //NOTE: show any actively assigned projects, or projects under the same protocol.  we also only show projects if either the animal is assigned, or that project is active
            sql += "SELECT p.project as project, p.displayName as displayName, p.account as account, p.protocol.displayName as protocolDisplayName, p.protocol as protocol, p.title, p.shortname, p.investigatorId.lastName as investigator, CASE WHEN (a.project = p.project AND p.use_category = 'Research') THEN 0 WHEN (a.project = p.project) THEN 1 ELSE 2 END as sort_order, CASE WHEN (a.project = p.project) THEN 1 ELSE 0 END as isAssigned " +
            " FROM ehr.project p JOIN study.assignment a ON (a.project.protocol = p.protocol) " +
            " WHERE a.id='"+id+"' AND (a.project = p.project) "; //TODO: restore this OR p.enddate IS NULL OR p.enddate >= curdate()

            //NOTE: if the date is in the future, we assume active projects
            if (date){
                sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND ((a.enddateCoalesced >= '"+date.format('Y-m-d')+"') OR ('"+date.format('Y-m-d')+"' >= now() and a.enddate IS NULL))";
            }
            else {
                sql += "AND a.isActive = true ";
            }

            if (this.getDisallowedProtocols()){
                sql += " AND p.protocol NOT IN ('" + this.getDisallowedProtocols().join("', '") + "') ";
            }
        }

        if (this.includeDefaultProjects){
            if (id)
                sql += ' UNION ALL ';

            sql += " SELECT p.project, p.displayName, p.account, p.protocol.displayName as protocolDisplayName, p.protocol as protocol, p.title, p.shortname, p.investigatorId.lastName as investigator, 3 as sort_order, 0 as isAssigned FROM ehr.project p WHERE p.alwaysavailable = true"; //TODO: restore this: and p.enddateCoalesced >= curdate()
        }

        sql+= " ) t GROUP BY t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.investigator, t.title, t.shortname";

        return sql;
    },

    getProjects : function(id){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('ProjectEntryField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!id && boundRecord)
            id = boundRecord.get('Id');

        var date;
        if (boundRecord){
            date = boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        var sql = this.makeSql(id, date);
        if (sql){
            this.store.loading = true;
            this.store.sql = sql;
            this.store.removeAll();
            this.store.load();
        }
    },

    setValue: function(val){
        var rec;
        if (Ext4.isArray(val)){
            val = val[0];
        }

        if (val && Ext4.isPrimitive(val)){
            rec = this.store.findRecord('project', val);
            if (!rec){
                rec = this.store.findRecord('displayName', val, null, false, false, true);

                if (rec)
                    console.log('resolved project entry field by display value')
            }

            if (!rec){
                rec = this.resolveProject(val);
            }
        }

        if (rec){
            val = rec;
        }

        // NOTE: if the store is loading, Combo will set this.value to be the actual model.
        // this causes problems downstream when other code tries to convert that into the raw datatype
        if (val && val.isModel){
            val = val.get(this.valueField);
        }

        this.callParent([val]);
    },

    resolveProjectFromStore: function(){
        var val = this.getValue();
        if (!val || this.isDestroyed)
            return;

        LDK.Assert.assertNotEmpty('Unable to find store in ProjectEntryField', this.store);
        var rec = this.store ? this.store.findRecord('project', val) : null;
        if (rec){
            return;
        }

        rec = this.allProjectStore.findRecord('project', val);
        if (rec){
            var newRec = this.store.createModel({});
            newRec.set({
                project: rec.data.project,
                account: rec.data.account,
                displayName: rec.data.displayName,
                protocolDisplayName: rec.data['protocol/displayName'],
                protocol: rec.data.protocol,
                title: rec.data.title,
                investigator: rec.data['investigatorId/lastName'],
                isAssigned: 0,
                fromClient: true
            });

            this.store.insert(0, newRec);

            return newRec;
        }
    },

    resolveProject: function(val){
        if (this.allProjectStore.isLoading()){
            this.allProjectStore.on('load', function(store){
                var newRec = this.resolveProjectFromStore();
                if (newRec)
                    this.setValue(val);
            }, this, {single: true});
        }
        else {
            this.resolveProjectFromStore();
        }
    }
});