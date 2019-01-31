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
Ext4.define('WNPRC.form.field.PregnancyIdField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-pregnancyidfield',

    fieldLabel: 'pregnancyid',
    typeAhead: true,
    forceSelection: true, //NOTE: has been re-enabled, but it is important to let the field get set prior to loading
    emptyText:'',
    disabled: false,
    matchFieldWidth: false,
    includeDefaultProjects: true,

    initComponent: function(){
        var ctx = EHR.Utils.getEHRContext();

        this.allPregnancyStore = new LABKEY.ext4.data.Store({
            type: 'labkey-store',
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            schemaName: 'study',
            queryName: 'pregnancies',
            columns: 'lsid,date_conception_early',
            //filterArray: [LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)],
            sort: 'date_conception_early',
            storeId: ['study', 'pregnancies', 'Id', 'lsid'].join('||'),
            autoLoad: true
        });

        this.trigger2Cls = Ext4.form.field.ComboBox.prototype.triggerCls;
        this.onTrigger2Click = Ext4.form.field.ComboBox.prototype.onTriggerClick;

        Ext4.apply(this, {
            displayField: 'date_conception_early',
            valueField: 'lsid',
            queryMode: 'local',
            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: {
                type: 'labkey-store',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'date_conception_early',
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.resolvePregnancyFromStore();
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
                        field.mon(target, 'animalchange', field.getPregnancies, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }

                    //attempt to load for the bound Id
                    this.getPregnancies();
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

        // this.addEvents('projectchange');
        // this.enableBubble('projectchange');
        //
        // this.on('change', function(field, val, oldVal){
        //     this.fireEvent('projectchange', val);
        // }, this, {buffer: 200});
        //
        // this.on('render', function(){
        //     Ext4.QuickTips.register({
        //         target: this.triggerEl.elements[0],
        //         text: 'Click to recalculate allowable projects'
        //     });
        // }, this);
    },

    getInnerTpl: function(){
        //return ['{[values["displayName"] + " " + (values["shortname"] ? ("(" + values["shortname"] + ")") : (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") : "") + (values["account"] ? ": " + values["account"] : "") + (values["investigator"] ? ")" : ""))]}&nbsp;</span>'];
        return '{[values["date_conception_early"]]}';
    },

    /*<span style="white-space:nowrap;{[values["isAssigned"] ? "font-weight:bold;" : ""]}">*/

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

        this.getPregnancies(id);
    },

    getDisallowedProtocols: function(){
        return null;
    },

    makeSql: function(id){
        if (!id && !this.includeDefaultProjects)
            return;

        //avoid unnecessary reloading
        var key = id;
        if (this.loadedKey == key){
            return;
        }
        this.loadedKey = key;

        var sql = 'select lsid,date_conception_early \
               from (select p.lsid \
                           ,p.date_conception_early \
                       from pregnancies p \
                      where p.Id = ' + id + ' \
                        and not exists (select * \
                                          from pregnancy_outcomes po \
                                         where po.pregnancyid = p.lsid) \
                                      order by date_conception_early desc) \
              limit 1'.replace(/\s+/g, ' ');

        // var sql = "SELECT DISTINCT t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.title, t.shortname, false as fromClient, min(sort_order) as sort_order, max(isAssigned) as isAssigned FROM (";
        //
        // if (id){
        //     //NOTE: show any actively assigned projects, or projects under the same protocol.  we also only show projects if either the animal is assigned, or that project is active
        //     sql += "SELECT p.project as project, p.displayName as displayName, p.account as account, p.protocol.displayName as protocolDisplayName, p.protocol as protocol, p.title, p.shortname, CASE WHEN (a.project = p.project AND p.use_category = 'Research') THEN 0 WHEN (a.project = p.project) THEN 1 ELSE 2 END as sort_order, CASE WHEN (a.project = p.project) THEN 1 ELSE 0 END as isAssigned " +
        //             " FROM ehr.project p JOIN study.assignment a ON (a.project.protocol = p.protocol) " +
        //             " WHERE a.id='"+id+"' AND (a.project = p.project) "; //TODO: restore this OR p.enddate IS NULL OR p.enddate >= curdate()
        //
        //     //NOTE: if the date is in the future, we assume active projects
        //     if (date){
        //         sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND ((a.enddateCoalesced >= '"+date.format('Y-m-d')+"') OR ('"+date.format('Y-m-d')+"' >= now() and a.enddate IS NULL))";
        //     }
        //     else {
        //         sql += "AND a.isActive = true ";
        //     }
        //
        //     if (this.getDisallowedProtocols()){
        //         sql += " AND p.protocol NOT IN ('" + this.getDisallowedProtocols().join("', '") + "') ";
        //     }
        // }
        //
        // if (this.includeDefaultProjects){
        //     if (id)
        //         sql += ' UNION ALL ';
        //
        //     sql += " SELECT p.project, p.displayName, p.account, p.protocol.displayName as protocolDisplayName, p.protocol as protocol, p.title, p.shortname, 3 as sort_order, 0 as isAssigned FROM ehr.project p WHERE p.alwaysavailable = true"; //TODO: restore this: and p.enddateCoalesced >= curdate()
        // }
        //
        // sql+= " ) t GROUP BY t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.title, t.shortname";

        return sql;
    },

    getPregnancies : function(id){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('PregnancyIdField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!id && boundRecord)
            id = boundRecord.get('Id');

        // var date;
        // if (boundRecord){
        //     date = boundRecord.get('date');
        // }

        this.emptyText = 'Select project...';
        var sql = this.makeSql(id);
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
            rec = this.store.findRecord('pregnancyid', val);
            // if (!rec){
            //     rec = this.store.findRecord('displayName', val, null, false, false, true);
            //
            //     if (rec)
            //         console.log('resolved project entry field by display value')
            // }

            if (!rec){
                rec = this.resolvePregnancy(val);
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

    resolvePregnancyFromStore: function(){
        var val = this.getValue();
        if (!val || this.isDestroyed)
            return;

        LDK.Assert.assertNotEmpty('Unable to find store in PregnancyIdField', this.store);
        var rec = this.store ? this.store.findRecord('pregnancyid', val) : null;
        if (rec){
            return;
        }

        rec = this.allPregnancyStore.findRecord('pregnancyid', val);
        if (rec){
            var newRec = this.store.createModel({});
            newRec.set({
                lsid: rec.data.lsid,
                date_conception_early: rec.data.date_conception_early,
                // displayName: rec.data.displayName,
                // protocolDisplayName: rec.data['protocol/displayName'],
                // protocol: rec.data.protocol,
                // title: rec.data.title,
                // //      investigator: rec.data['investigatorId/lastName'],
                // isAssigned: 0,
                fromClient: true
            });

            this.store.insert(0, newRec);

            return newRec;
        }
    },

    resolvePregnancy: function(val){
        if (this.allPregnancyStore.isLoading()){
            this.allPregnancyStore.on('load', function(store){
                var newRec = this.resolvePregnancyFromStore();
                if (newRec)
                    this.setValue(val);
            }, this, {single: true});
        }
        else {
            this.resolvePregnancyFromStore();
        }
    }
});