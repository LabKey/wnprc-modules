/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to diplay EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the staff assign to the specific protocol.
 *
 * @cfg includeDefaultProjects defaults to true
 */

Ext4.define('WNPRC.ext.components.fields.protocolStaffField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprcehr-protocolStaffField',

    fieldLabel: 'protocolContact',
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
            displayField: 'invest1',
            valueField: 'invest1',
            queryMode: 'local',

            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: {
                type: 'labkey-store',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'project',
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
                        field.mon(target, 'projectchange', field.getProjects, field);
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

        this.onTrigger2Click = function() {
            this.getProjects(null);
            Ext4.form.field.ComboBox.prototype.onTriggerClick.call(this, arguments);
        };

        this.on('focus', function() {
            this.getProjects();
        });
    },

    getInnerTpl: function(){
        return ['<span style="white-space:nowrap;{[values["isAssigned"] ? "font-weight:bold;" : ""]}">{[values["displayName"] + " " + (values["shortname"] ? ("(" + values["shortname"] + ")") : (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") : "") + (values["invest1"] ? ": " + values["invest1"] : "") + (values["investigator"] ? ")" : ""))]}&nbsp;</span>'];
        //return ['<span style="white-space:nowrap;{[values["isAssigned"] ? "font-weight:bold;" : ""]}">{[values["displayName"] + " " + (values["shortname"] ? ("(" + values["shortname"] + ")") : (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") : "") + (values["account"] ? ": " + values["account"] : "") + (values["investigator"] ? ")" : ""))]}&nbsp;</span>'];
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

    makeSql: function(id, date, project){
        if (!id && !this.includeDefaultProjects)
            return;

        //avoid unnecessary reloading
        var key = id + '||' + date;
        if (this.loadedKey == key){
            return;
        }
        this.loadedKey = key;

        if (id && project)
        {
            var sql = "SELECT protocol, displayName,project, invest1, false as fromClient FROM " +
                    "(SELECT protocol, displayName,project ,CAST(locate(',' ,protocol.contacts) AS DOUBLE)-1 AS position, substr(protocol.contacts,0,locate(',', protocol.contacts) ) as invest1 FROM ehr.project\n" +
                    "\n" +
                    "UNION ALL\n" +
                    "\n" +
                    "SELECT protocol, displayName,project ,CAST(locate(',' ,protocol.contacts) AS DOUBLE)-1 AS position, substr(protocol.contacts,CAST(locate(',', protocol.contacts) AS INTEGER)+1 ,length(protocol.contacts) ) as invest1 FROM ehr.project)" +
                    "WHERE project=" + project;
        }


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
        var project;
        if(boundRecord){
            project = boundRecord.get('project');
        }


        this.emptyText = 'Select staff...';
        var sql = this.makeSql(id, date, project);
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
            rec = this.store.findRecord('investigator1', val);
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
                investigator1: rec.data['invest1'],
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
