/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('WNPRC_EHR');

EHR.DatasetButtons.registerMoreActionsCustomizer(function(dataRegionName){
    var dataRegion = LABKEY.DataRegions[dataRegionName],
        headerEl = Ext4.DomQuery.select('table[lk-region-name=' + dataRegion.name + ']'),
        menu_customized = false;

    if (headerEl) {
        var btnEls = Ext4.DomQuery.select('.labkey-menu-button', headerEl);
        Ext4.each(btnEls, function(btnEl) {
            if (btnEl.innerHTML.indexOf('More Actions') > -1) {
                var menu = Ext4.menu.MenuMgr.get(Ext4.get(btnEl).getAttribute('lk-menu-id'));
                if (menu) {
                    menu_customized = true;
                    var action = LABKEY.ActionURL.getAction();
                    var queryName = dataRegion.queryName.replace(' ', '');
                    if (dataRegion.schemaName.match(/^study$/i) && queryName.match(/^Demographics$/i)) {
                        if (EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Weight', schemaName: 'study'})) {
                            WNPRC_EHR.DatasetButtons.addCreateTaskFromIdsBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Weight'}], formType: 'Weight'});
                        }
                    }

                    if (action.match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && queryName.match(/^ClinpathRuns$/i)) {
                        if (EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Clinpath Runs', schemaName: 'study'})) {
                            WNPRC_EHR.DatasetButtons.addCreateTaskBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Clinpath Runs'}], formType: 'Clinpath'});
                            WNPRC_EHR.DatasetButtons.addChangeQCStateBtn(dataRegion.name, menu);
                        }
                    }

                    if (dataRegion.schemaName.match(/^study$/i) && queryName.match(/^ClinpathRuns$/i)) {
                        if (EHR.Security.hasPermission('Completed', 'update', {queryName: 'Clinpath Runs', schemaName: 'study'})) {
                            WNPRC_EHR.DatasetButtons.addMarkReviewedBtn(dataRegion.name, menu);
                        }
                    }

                    if (action.match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && queryName.match(/^BloodDraws$/i)) {
                        if (EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})) {
                            WNPRC_EHR.DatasetButtons.addCreateTaskBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Blood Draws'}], formType: 'Blood Draws'});
                            WNPRC_EHR.DatasetButtons.addChangeBloodQCStateBtn(dataRegion.name, menu);
                        }
                    }

                    if (action.match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && queryName.match(/^StudyData$/i)) {
                        if (EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})) {
                            WNPRC_EHR.DatasetButtons.addChangeQCStateBtn(dataRegion.name, menu);
                        }
                    }
                    if (action.match(/^dataEntry$/i) && dataRegion.schemaName.match(/^wnprc$/i) && queryName.match(/^vvc$/i)) {
                        if (EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'vvc', schemaName: 'wnprc'})) {
                            WNPRC_EHR.DatasetButtons.addChangeQCStateBtn(dataRegion.name, menu);
                        }
                    }
                    if (dataRegion.schemaName.match(/^wnprc$/i) && queryName.match(/^vvc$/i)) {
                        if (EHR.Security.hasPermission('Completed', 'update', {queryName: 'vvc', schemaName: 'wnprc'})) {
                            WNPRC_EHR.DatasetButtons.addMarkReviewedBtn(dataRegion.name, menu);
                            WNPRC_EHR.DatasetButtons.addVVCChangeQCStateBtn(dataRegion.name, menu);
                        }
                    }
                }
                return false;
            }
        });
    }
});


WNPRC_EHR.ProjectField2 = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function() {
        Ext4.apply(this, {
            fieldLabel: 'Second Project',
            name: this.name || 'project_2',
            dataIndex: 'project_2',
            emptyText:'',
            displayField:'project',
            valueField: 'project',
            typeAhead: true,
            triggerAction: 'all',
            forceSelection: true,
            mode: 'local',
            disabled: false,
            plugins: ['ehr-usereditablecombo'],
            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: new LABKEY.ext.Store({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                requiredVersion: 9.1,
                sql: this.makeSql(),
                sort: 'project',
                autoLoad: true
            }),
            listeners: {
                select: function(combo, rec){
                    var target = this.findParentByType('ehr-formpanel');

                    if(target.boundRecord){
                        target.boundRecord.beginEdit();
                        target.boundRecord.set('project_2', rec.get('project'));
                        target.boundRecord.set('account_2', rec.get('account'));
                        target.boundRecord.endEdit();
                    }
                }
            },
            tpl: function(){
                var tpl = new Ext.XTemplate(
                    '<tpl for=".">' +
                    '<div class="x-combo-list-item">{[values["project"] + " " + (values["protocol"] ? "("+values["protocol"]+")" : "")]}' +
                    '&nbsp;</div></tpl>'
                );

                return tpl.compile()
            }()
        });

        WNPRC_EHR.ProjectField2.superclass.initComponent.call(this, arguments);

        var target = this.findParentByType('ehr-formpanel');
        console.log(target);

        this.mon(target, 'participantchange', this.getProjects2, this);
    },
    makeSql: function(id, date) {
        var sql = "SELECT DISTINCT a.project, a.project.account, a.project.protocol as protocol FROM study.assignment a " +
                "WHERE a.id='"+id+"' " +
                    //this protocol contains tracking projects
                "AND a.project.protocol != 'wprc00' ";

        if(!this.allowAllProtocols){
            sql += ' AND a.project.protocol IS NOT NULL '
        }

        if(date)
            sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND (cast(a.enddate as date) >= '"+date.format('Y-m-d')+"' OR a.enddate IS NULL)";
        else
            sql += "AND a.enddate IS NULL ";

        if(this.defaultProjects){
            sql += " UNION ALL (SELECT project, account, project.protocol as protocol FROM ehr.project WHERE project IN ('"+this.defaultProjects.join("','")+"'))";
        }

        return sql;
    },
    getProjects2 : function(field, id) {
        console.log('get projects second iteration...');
        var target = this.findParentByType('ehr-formpanel');
        if(!id && target.boundRecord)
            id = target.boundRecord.get('Id');

        var date;
        if(target.boundRecord){
            date = target.boundRecord.get('date');
        }

        this.emptyText = 'Select second project...';
        this.store.baseParams.sql = this.makeSql(id, date);
        this.store.load();
    }
});

Ext.reg('ehr-project_2', WNPRC_EHR.ProjectField2);

EHR.Metadata.Columns['Irregular Observations'] = 'id/curlocation/location,id,id/curlocation/cond,date,enddate,inRoom,feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'+EHR.Metadata.bottomCols;
EHR.Metadata.Columns['Treatment Orders']       = EHR.Metadata.topCols+',account,meaning,code,qualifier,route,frequency,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,remark,nocharge,project_2,account_2,billedby,performedBy,qcstate,'+EHR.Metadata.hiddenCols;
EHR.Metadata.Columns['Behavior Remarks']       = EHR.Metadata.topCols+',so,a,p,,behatype,category, behatreatment, followup,'+EHR.Metadata.bottomCols;
EHR.Metadata.Columns['Behavior Abstract']      = EHR.Metadata.topCols+',behavior,performedby,'+EHR.Metadata.bottomCols;
EHR.Metadata.Columns['Virology Results']       = EHR.Metadata.topCols+',virus,method,source,resultOORIndicator,result,units,qualResult,laboratory,performing_lab,'+EHR.Metadata.bottomCols;
EHR.Metadata.Columns['Housing']                = 'id,date,enddate,room,cage,id/numroommates/cagemates,cond,reason,ejacConfirmed,project,isTemp,' + EHR.Metadata.bottomCols;

EHR.Metadata.registerMetadata('Default', {
    byQuery: {
        cage_observations: {
            cage: {
                allowBlank: false
            },
            room: {
                editorConfig: {
                    listeners: {
                        //Add a listener that will automatically fill in the room field for the Observations Per Cage
                        //section based on the room selected in the Observations Per Animal section on the Irregular obs page.
                        render: function(){
                            if (this.ownerCt.ownerCt && this.ownerCt.ownerCt.ownerCt.formType === 'Irregular Observations') {
                                let formGridPanel = this.ownerCt.ownerCt.items.items[0];
                                formGridPanel.on('recordchange', function () {
                                    let theForm = this.ownerCt.getForm();
                                    let roomField = theForm.findField('room');
                                    if (!roomField.value) {
                                        let irregularObsStore = Ext.StoreMgr.get('study||Irregular Observations||||');
                                        let firstRecord = irregularObsStore.getAt(0);
                                        if (firstRecord) {
                                            let location = firstRecord.data['id/curlocation/location'];
                                            if (location) {
                                                let roomValue = location.substr(0, location.indexOf('-') === -1 ? location.length : location.indexOf('-'));
                                                roomField.setValue(roomValue);
                                                theForm.findField('cage').focus();
                                            }
                                        }
                                    }
                                }, this, {buffer: 20});
                            }
                        }
                    }
                }
            }
        },
        'Blood Draws': {
            'id/curlocation/location': {
                shownInGrid: false
            },
            quantity: {
                shownInGrid: true
            },
            billedby: {
                shownInGrid: true
            },
            restraint: {
                shownInGrid: true
            },
            restraintDuration: {
                shownInGrid: true
            },
            project: {
                shownInGrid: false
            },
            tube_type: {
                shownInGrid: true // SPI (Jen) wants tube type to be there for folks doing th blood draws.
            },
            tube_vol: {
                shownInGrid: false
            },
            num_tubes: {
                shownInGrid: false
            },
            additionalServices: {
                shownInGrid: false
            },
            performedby: {
                shownInGrid: true
            }
        },
        'Chemistry Results': {
            date: { setInitialValue: function() { return null; } }
        },
        'Hematology Results': {
            date: { setInitialValue: function() { return null; } }
        },
        'Hematology Morphology': {
            date: { setInitialValue: function() { return null; } }
        },
        'Housing': {
            Id: {
                //attached to Id for now because I couldn't figure out how to just attach it to the form itself
                editorConfig: {
                    listeners: {
                        render: function(){
                            var formPanel = this.ownerCt.ownerCt.items.items[0];
                            formPanel.on('recordchange', function() {
                                var theForm = this.ownerCt.getForm();
                                var reasonField = theForm.findField('reason');
                                var projectField = theForm.findField('project');
                                var ejacConfirmed = theForm.findField('ejacConfirmed');

                                if(reasonField.value === 'Breeding') {
                                    projectField.show();
                                } else {
                                    projectField.hide();
                                }
                                if(reasonField.value === 'Breeding ended') {
                                    ejacConfirmed.show();
                                } else {
                                    ejacConfirmed.hide();
                                }
                            }, this, {buffer: 20});
                        }
                    }
                }
            },
            // Out Date
            enddate: {
                shownInGrid: false
            },
            cond: {
                shownInGrid: true
            },
            reason: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'housing_reason',
                    displayColumn: 'title',
                    keyColumn: 'value'
                },
                includeNullRecord: true,
                editorConfig: {
                    tpl: null,
                    multiSelect: true,
                    separator: ',',
                    listeners: {
                        select: function(field, val){
                            var theForm = this.ownerCt.getForm();

                            if(theForm){
                                var projectField = theForm.findField('project');
                                var ejacConfirmed = theForm.findField('ejacConfirmed');
                                //show & hide fields as necessary
                                //also clear values before hiding them
                                var breeding = false;
                                var breedingEnded = false;
                                if (field.value) {
                                    let reasons = field.value.split(',');
                                    for (let i = 0; i < reasons.length; i++) {
                                        if (reasons[i] === 'Breeding') {
                                            breeding = true;
                                        } else if (reasons[i] === 'Breeding ended') {
                                            breedingEnded = true;
                                        }
                                    }
                                }
                                if(breeding) {
                                    projectField.show();
                                } else {
                                    projectField.setValue('');
                                    projectField.hide();
                                }
                                if(breedingEnded) {
                                    ejacConfirmed.show();
                                } else {
                                    ejacConfirmed.setValue(false);
                                    ejacConfirmed.hide();
                                }
                            }
                        }
                    }
                },
                columnConfig: {
                    width: 500
                },
                shownInGrid: true,
            },
            ejacConfirmed: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be unhidden later
                        render: function(field){
                            field.hide();
                        }
                    }
                }
            },
            project: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be unhidden later
                        render: function(field){
                            field.hide();
                        }
                    }
                }
            },
            performedby: {
                shownInGrid: true
            }
        },
        'Irregular Observations':{
            behavior: {
                shownInGrid: false,
                xtype: 'lovcombo',
                hasOwnTpl: true,
                //xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                lookup: {   filterArray: [LABKEY.Filter.create('date_disabled', null, LABKEY.Filter.Types.ISBLANK)],
                    schemaName: 'ehr_lookups',
                    queryName: 'obs_behavior',
                    displayColumn: 'title',
                    keyColumn: 'value',
                    sort: 'sort_order'
                },
                formEditorConfig: {
                    columns: 1,
                    tpl: null,
                    separator: ';'
                }
            }
            ,otherbehavior: {
                xtype: 'ehr-remark',
                label: 'Other Behavior / Remarks',
                isAutoExpandColumn: true,
                printWidth: 550,
                shownInGrid: false,
                hidden: false,
                formEditorConfig: {
                    resizeDirections: 's',
                }
            }
        },
        'Treatment Orders': {
            enddate: {
                setInitialValue: function(v,rec) {
                    return v ? v : new Date()
                }
            }
        },
        'Pregnancy':{
            conception:{
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            var theForm = this.ownerCt.getForm();
                            if(theForm){
                                conceptionDate = new Date (val);
                                conp40field = theForm.findField('conp40');
                                conceptionDate.setDate(conceptionDate.getDate()+40);
                                conp40field.setValue(conceptionDate);
                            }
                        }
                    }
                }
            }
        },
        Necropsies: {
            Weight: {
                date: {
                    parentConfig: {
                        storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'}
                    },
                    hidden: false,
                    shownInGrid: false
                }
            }
        },
        Birth: {
            type: {
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'currentBirthTypes'
                }
            }
        }
    }
});

EHR.Metadata.registerMetadata('Treatments', {
    allQueries: {
        project_2: {
            xtype: 'ehr-project_2',
            editorConfig: {
                defaultProjects: [300901]
            },
            shownInGrid: false,
            useNull: true,
            lookup: {
                columns: 'project,account'
            }
        },
        account_2: {
            shownInGrid: false
        }
    },
    byQuery: {
        'Treatment Orders': {
            project_2: {
                allowBlank: true
            },
            nocharge:{
                allowBlank: false
            }
        }
    }
});

/*
 * The following surgery changes are described in Issue 4340.
 */
EHR.Metadata.registerMetadata('Surgery', {
    byQuery: {
        "Drug Administration": {
            'id/curlocation/location': {
                shownInGrid: false
            },
            code: {
                colModel: {
                    width: 345,
                    fixed: true
                }
            },
            category: {
                shownInGrid: false
            },
            route: {
                shownInGrid: true,
                colModel: {
                    width: 110,
                    fixed: true
                }
            },
            amount: {
                shownInGrid: true,
                colModel: {
                    width: 70,
                    fixed: true
                }
            },
            amount_units: {
                shownInGrid: true,
                colModel: {
                    width: 95,
                    fixed: true
                }
            },
            volume: {
                shownInGrid: false
            },
            vol_units: {
                shownInGrid: false
            }
        }
    }
});

EHR.Metadata.registerMetadata('Irregular_Obs_OKRooms', {
    byQuery: {
        cage_observations: {
            no_observations: {
                shownInGrid: true,
                hidden: true,
                defaultValue: true
            },
            cage: {
                hidden: true,
                allowBlank: true,
                shownInGrid: false
            },
            feces: {
                hidden: true,
                shownInGrid: false
            },
            userid: {
                hidden: true
            }
        }
    }
});
EHR.Metadata.registerMetadata('MPR', {
    byQuery: {
        "Drug Administration": {
            'Id': {
                colModel: {
                    width: 55,
                    fixed: true
                }
            },
            'id/curlocation/location': {
                shownInGrid: false
            },
            route: {
                shownInGrid: true,
                colModel: {
                    width: 110,
                    fixed: true
                }
            },
            project: {
                shownInGrid: true,
                colModel: {
                    fixed: true,
                    width: 75
                }
            },
            code: {
                colModel: {
                    fixed: true,
                    width: 135
                }
            },
            category: {
                shownInGrid: false
            },
            volume: {
                shownInGrid: false
            },
            vol_units: {
                shownInGrid: false
            },
            performedby: {
                shownInGrid: true,
                colModel: {
                    width: 90,
                    fixed: true
                }
            },
            amount: {
                shownInGrid: true,
                colModel: {
                    width: 70,
                    fixed: true
                }
            },
            amount_units: {
                shownInGrid: true,
                colModel: {
                    width: 95,
                    fixed: true
                }
            }
        }
    }
});

/*
 * WNPRC#4356 - Make restraints show up for blood draw requests.
 */
EHR.Metadata.registerMetadata('Request', {
    byQuery: {
        'Blood Draws': {
            restraint: {
                shownInGrid: false
            },
            restraintDuration: {
                shownInGrid: false
            }
        }
    }
});

/*
 * WNPRC#4409 - Instead of storing the display name for users in
 *              irregular obs/cage obs, store the userid number
 *              in the database, while still displaying the display
 *              name for the user in the form.
 */
(function(){
    var Ext = Ext4;
    var userSelector = {
        lookup: {
            schemaName: 'core',
            queryName: 'Users',
            displayColumn: 'DisplayName',
            keyColumn: 'UserId',
            sort: 'Email'
        },
        formEditorConfig: {
            readOnly: false
        },
        editorConfig: {
            plugins: ['ehr-usereditablecombo']
        },
        defaultValue: LABKEY.Security.currentUser.id,
        shownInGrid: false
    };

    EHR.Metadata.registerMetadata('Default', {
        byQuery: {
            'Irregular Observations': {
                performedby: Ext.clone(userSelector)
            },
            'cage_observations': {
                userid: Ext.clone(userSelector)
            }
        }
    });
})();


Ext4.override(EHR.form.field.ProjectEntryField, {
    getDisallowedProtocols: function(){
        return ['wprc00'];
    }
});

(function(){
    var caseNoTypes = {
        Necropsy: {
            prefix: {
                internal: "c",
                external: "e"
            },
            query: "necropsies"
        },
        Biopsy: {
            prefix: {
                internal: "b",
                external: "x"
            },
            query: "biopsies"
        }
    };

    var getcasenoObj = function(type) {
        var valid = false;
        jQuery.each(caseNoTypes, function(typeName, typeObj){
            if (type === typeObj) {
                valid = true;
                return false;
            }
        });
        if ( !valid ) {
            throw "Invalid type passed to getcasenoObj";
        }

        return {
            xtype: 'trigger',
            allowBlank: false,
            editorConfig: {
                triggerClass: 'x-form-search-trigger',
                onTriggerClick: function () {
                    var theWin = new Ext.Window({
                        layout: 'form',
                        title: 'Case Number',
                        bodyBorder: true,
                        border: true,
                        theField: this,
                        bodyStyle: 'padding:5px',
                        width: 350,
                        defaults: {
                            width: 200,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype: 'radiogroup',
                                ref: 'prefix',
                                fieldLabel: 'Prefix',
                                vertical: false,
                                items: [
                                    {
                                        boxLabel: 'Internal',
                                        name: 'rb',
                                        inputValue: type.prefix.internal,
                                        checked: true
                                    },
                                    {
                                        boxLabel: 'External',
                                        name: 'rb',
                                        inputValue: type.prefix.external
                                    }
                                ]
                            },
                            {
                                xtype: 'numberfield',
                                ref: 'year',
                                fieldLabel: 'Year',
                                allowBlank: false,
                                value: (new Date()).getFullYear()
                            }
                        ],
                        buttons: [
                            {
                                text: 'Submit',
                                disabled: false,
                                ref: '../submit',
                                //scope: this,
                                handler: function (p) {
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },
                            {
                                text: 'Close',
                                handler: function () {
                                    this.ownerCt.ownerCt.hide();
                                }
                            }
                        ]
                    });
                    theWin.show();

                    var getCaseNo = function(panel) {
                        var year = panel.year.getValue();
                        var prefix = panel.prefix.getValue().inputValue;

                        var sourceClause = (function() {
                            var sources = [];

                            jQuery.each(caseNoTypes, function(typeName, typeObj) {
                                var prefix = typeObj.prefix;

                                var whereClauses = [prefix.internal, prefix.external].map(function(prefix) {
                                    return "(caseno LIKE '" + year + prefix + "%')";
                                });

                                sources.push("SELECT caseno FROM study." + typeObj.query + " WHERE (" + whereClauses.join(" OR ") + ")");
                            });

                            return "SELECT caseno FROM (" + sources.join(" UNION ") + ")";
                        })();

                        var sqlQueryString = "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno ";
                        sqlQueryString += " FROM ( " + sourceClause + " )";

                        if (!year || !prefix) {
                            Ext.Msg.alert('Error', "Must supply both year and prefix");
                            return
                        }

                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sqlQueryString,
                            scope: this,
                            success: function (data) {
                                var caseno;
                                if (data.rows && data.rows.length == 1) {
                                    caseno = data.rows[0].caseno;
                                    caseno++;
                                }
                                else {
                                    console.log('no existing cases found');
                                    caseno = 1;
                                }

                                caseno = EHR.Utils.padDigits(caseno, 3);
                                var val = year + prefix + caseno;
                                panel.theField.setValue(val);
                                panel.theField.fireEvent('change', val)
                            },
                            failure: EHR.Utils.onError
                        });
                    };
                }
            }
        }
    };

    EHR.Metadata.registerMetadata('Necropsy', {
        byQuery: {
            'Necropsies': {
                caseno: getcasenoObj(caseNoTypes.Necropsy)
            }
        }
    });

    EHR.Metadata.registerMetadata('Biopsy', {
        byQuery: {
            'Biopsies': {
                caseno: getcasenoObj(caseNoTypes.Biopsy)
            }
        }
    });
})();

EHR.Metadata.registerMetadata('Default', {
    byQuery: {
        'Virology Results': {
            "performing_lab": {
                hidden: false,
                shownInGrid: true,
                colModel: {
                    header: "Lab"
                }
            }
        }
    }
});

EHR.Metadata.registerMetadata('NewAnimal', {
    byQuery: {
        'Virology Results': {
            "performing_lab": {
                hidden: true,
                shownInGrid: false
            }
        }
    }
});

/*
 *  This (the rest of this file) is a patch for the Hematology bulk add button, to fix issue WNPRC#4430.
 *  However, as it duplicates code from ExtContainers.js and  ehrGridFormPanel.js, it is only meant as
 *  a temporary solution until a more permanent solution can be formulated.
 */
WNPRC_EHR.HematologyBulkAdd = Ext.extend(Ext.Panel, {
    initComponent: function() {
        Ext.applyIf(this, {
            title: 'Enter Hematology From Sysmex Analyzer',
            bodyBorder: true,
            border: true,
            bodyStyle: 'padding:5px',
            width: '100%',
            defaults: {
                border: false,
                bodyBorder: false
            },
            items: [
                {
                    xtype: 'displayfield',
                    value: 'This allows bulk import of hematology results using the output of a Sysmex Hematology Analyzer.  Cut/paste the contents of the output below.'
                },{
                    xtype: 'textarea',
                    ref: 'fileField',
                    height: 350,
                    width: 430
                }
            ],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.processData();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.HematologyExcelWin.superclass.initComponent.call(this, arguments);
    },
    processData: function(){
        var data = this.fileField.getValue();

        if (!data) {
            alert('Must Paste Contents of File');
            return;
        }

        var skippedRows = [];

        var hematologyResults = Ext.StoreMgr.get("study||Hematology Results||||");
        var runsStore = Ext.StoreMgr.get("study||Clinpath Runs||||");
        var unitStore = Ext.StoreMgr.get("ehr_lookups||hematology_tests||testid||testid");

        var result;
        var tests;
        var row1;
        var row2;
        var toAdd = [];

        if(!data.length || !data[0].length){
            alert('Something went wrong processing the file');
            console.log(data);
            return;
        }

        data = data.split(/D1U/i);

        Ext.each(data, function(row, idx){
            if(!row.match(/D2U/i))
                return;

            row = row.split(/D2U/i);

            row1 = row[0];
            row2 = row[1];
            row1 = row1.replace(/\s+/g, '');
            row2 = row2.split(/\s+/);
            row2 = row2.slice(2, row2.length-1);
            row2 = row2.join('');

            result = {};
            tests = {};

            result.animalId = row1.substr(27,6);
            result.animalId = result.animalId.toLowerCase();

            var requestNumber = runsStore.find('Id',result.animalId)
            var record = runsStore.getAt(requestNumber);

            //Getting the collection time from the request itself, if it matches animalId
            if(requestNumber!= -1 && result.animalId == record.get('Id')){

                var collectionDate = record.get('date');
            }

            result.date= new Date(collectionDate);

            if(!result.animalId || runsStore.find('Id', result.animalId)==-1){
                //alert('ID: '+result.animalId+' not found in Clinpath Runs section. Records will not be added');
                skippedRows.push('Not found in Clinpath Runs: '+result.animalId);
                return;
            }

            tests['WBC'] = row2.substr(6,6);
            tests['RBC'] = row2.substr(12,5);
            tests['HGB'] = row2.substr(17,5);
            tests['HCT'] = row2.substr(22,5);
            tests['MCV'] = row2.substr(27,5);
            tests['MCH'] = row2.substr(32,5);
            tests['MCHC'] = row2.substr(37,5);
            tests['PLT'] = row2.substr(42,5);
            //tests['LYMPH%'] = row2.substr(47,5);
            tests['LY'] = row2.substr(47,5);

            //tests['MONO%'] = row2.substr(52,5);
            tests['MN'] = row2.substr(52,5);

            //tests['SEG%'] = row2.substr(57,5);
            tests['NE'] = row2.substr(57,5);

            //tests['EOSIN%'] = row2.substr(62,5);
            tests['EO'] = row2.substr(62,5);

            //tests['BASO%'] = row2.substr(67,5);
            tests['BS'] = row2.substr(67,5);

            //tests['LYMPH#'] = row2.substr(72,6);
            //tests['MONO#'] = row2.substr(78,6);
            //tests['SEG#'] = row2.substr(84,6);
            //tests['EOSIN#'] = row2.substr(90,6);
            //tests['BASO#'] = row2.substr(96,6);
            tests['RDW'] = row2.substr(102,5);
            //tests'RDW-CV'] = row2.substr(102,5);
            //tests['RDW-SD'] = row2.substr(107,5);
            //tests['PDW'] = row2.substr(112,5);
            tests['MPV'] = row2.substr(117,5);
            //tests['P-LCR'] = row2.substr(122,5);

            var value;
            for(var test in tests){
                var origVal = tests[test];
                value = tests[test];

                if (value.match(/^00(\d){4}$/)) {
                    tests[test] = value.substr(2,3) / 100;
                }
                //note: at the moment WBC is the only test with 6 chars, so this test is possibly redundant
                else if (value.match(/^0(\d){4,}$/) && test=='WBC') {
                    tests[test] = value.substr(1,4) / 100;
                }
                else if (value.match(/^0\d{4}$/)){
                    if (test=='RBC') {
                        tests[test] = value.substr(1,3) / 100;
                    }
                    else if (test=='PLT') {
                        tests[test] = value.substr(1,3) / 1; //convert to number
                    }
                    else {
                        tests[test] = value.substr(1,3) / 10;
                    }
                }
                else if (test=='PLT') {
                    tests[test] = value.substr(0,4);
                }

                //find units
                var idx = unitStore.find('testid', test);
                var units = null;
                var sortOrder = null;
                if(idx!=-1){
                    units = unitStore.getAt(idx).get('units');
                    sortOrder = unitStore.getAt(idx).get('sort_order');
                }

                if(tests[test] && isNaN(tests[test])){
                    skippedRows.push('Invalid Result for: '+result.animalId+', TestId: '+test+', '+tests[test]);
                    tests[test] = null;
                }

                toAdd.push({
                    Id: result.animalId,
                    date: result.date,
                    testid: test,
                    result: tests[test],
                    units: units,
                    sortOrder: sortOrder
                });
            }

        }, this);

        if(toAdd.length){
            toAdd.sort(function(a, b){
                return a.Id < b.Id ? -1 :
                        a.Id > b.Id ? 1 :
                                a.date < b.date ? -1 :
                                        a.date > b.date ? 1 :
                                                a.sortOrder < b.sortOrder ? -1 :
                                                        a.sortOrder > b.sortOrder ? 1 :
                                                                0
            });
            hematologyResults.addRecords(toAdd);
        }

        if(skippedRows.length){
            alert('One or more rows were skipped:\n'+skippedRows.join('\n'));
        }
    }
});
Ext.reg('wnprc_ehr-hematologybulkadd', WNPRC_EHR.HematologyBulkAdd);

/*
 * Let Ctrl+x open the popup
 */
WNPRC_EHR.HematologyPopup = function() {
    var popup = new Ext.Window({
        closeAction:'hide',
        width: 450,
        items: [{
            xtype: 'wnprc_ehr-hematologybulkadd'
        }]
    });

    popup.show();
};
jQuery(document).on('keypress', function(e){
    if (e.ctrlKey && (e.which == 24)) {
        WNPRC_EHR.HematologyPopup();
    }
});