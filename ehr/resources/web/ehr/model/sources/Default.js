/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * The default metadata applied to all queries when using getTableMetadata().
 * This is the default metadata applied to all queries when using getTableMetadata().  If adding attributes designed to be applied
 * to a given query in all contexts, they should be added here
 */
EHR.model.DataModelManager.registerMetadata('Default', {
    allQueries: {
        fieldDefaults: {
            ignoreColWidths: true
        },
        Id: {
            xtype: 'ehr-animalfield',
            dataIndex: 'Id',
            nullable: false,
            allowBlank: false,
            lookups: false,
            noSaveInTemplateByDefault: true,
            columnConfig: {
                width: 95,
                showLink: false
            }
        },
        'id/curlocation/location': {
            hidden: false,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Location',
            header: 'Location',
            lookups: false,
            //to allow natural sorting
            sortType: function(val){
                return val ? LDK.Utils.naturalize(val) : val;
            },
            allowDuplicateValue: false,
            columnConfig: {
                width: 175,
                showLink: false
            },
            formEditorConfig: {
                hidden: true
            }
        },
        'id/numroommates/cagemates': {
            hidden: true,
            updateValueFromServer: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Animals In Cage',
            header: 'Animals In Cage',
            lookups: false,
            allowDuplicateValue: false,
            columnConfig: {
                width: 120,
                showLink: false
            }
        },
        daterequested: {
            xtype: 'xdatetime',
            noDuplicateByDefault: true,
            extFormat: 'Y-m-d H:i'
        },
        procedureid: {
            columnConfig: {
                width: 250
            },
            editorConfig: {
                caseSensitive: false,
                anyMatch: true,
                listConfig: {
                    innerTpl: '{[(values.category ? "<b>" + values.category + ":</b> " : "") + values.name]}',
                    getInnerTpl: function(){
                        return this.innerTpl;
                    }
                }
            },
            lookup: {
                sort: 'category,name',
                filterArray: [LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)],
                columns: 'rowid,name,category,remark,active'
            }
        },
        protocol: {
            editorConfig: {
                caseSensitive: false,
                anyMatch: true
            }
        },
        investigatorid: {
            editorConfig: {
                anyMatch: true,
                listConfig: {
                    innerTpl: '{[values.lastname + (values.firstname ? ", " + values.firstname : "")]}',
                    getInnerTpl: function(){
                        return this.innerTpl;
                    }
                }
            },
            lookup: {
                sort: 'lastname,firstname',
                columns: 'rowid,lastname,firstname'
            }
        },
        //drug fields
        dosage: {
            xtype: 'ehr-drugdosefield',
            msgTarget: 'under',
            shownInGrid: false,
            compositeField: 'Dosage',
            editorConfig: {
                decimalPrecision: 3
            }
        },
        dosage_units: {
            shownInGrid: false,
            lookup: {columns: '*'},
            compositeField: 'Dosage',
            editorConfig: {
                plugins: ['ldk-usereditablecombo']
            },
            columnConfig: {
                width: 120
            }
        },
        concentration: {
            shownInGrid: false,
            compositeField: 'Drug Conc',
            editorConfig: {
                decimalPrecision: 10
            }
        },
        conc_units: {
            shownInGrid: false,
            lookup: {columns: '*'},
            compositeField: 'Drug Conc',
            editorConfig: {
                plugins: ['ldk-usereditablecombo'],
                listeners: {
                    select: function(combo, recs){
                        if (!recs || recs.length != 1)
                            return;

                        var rec = recs[0];
                        var vals = {
                            amount_units: rec.get('numerator'),
                            conc_units: rec.get('unit'),
                            vol_units: rec.get('denominator')
                        };

                        if (rec.get('numerator'))
                            vals.dosage_units = rec.get('numerator')+'/kg';
                        else
                            vals.dosage_units = null;

                        EHR.DataEntryUtils.setSiblingFields(combo, vals);
                    }
                }
            }
        },
        volume: {
            shownInGrid: true,
            compositeField: 'Volume',
            xtype: 'ehr-drugvolumefield',
            noSaveInTemplateByDefault: true,
            editorConfig: {
                decimalPrecision: 3
            },
            header: 'Vol',
            columnConfig: {
                width: 90
            }
        },
        vol_units: {
            shownInGrid: true,
            compositeField: 'Volume',
            header: 'Vol Units',
            editorConfig: {
                plugins: ['ldk-usereditablecombo']
            },
            columnConfig: {
                width: 90
            }
        },
        amount: {
            compositeField: 'Amount',
            noSaveInTemplateByDefault: true,
            columnConfig: {
                width: 120
            },
            editorConfig: {
                decimalPrecision: 10
            }
        },
        amount_units: {
            compositeField: 'Amount',
            columnConfig: {
                width: 120
            },
            editorConfig: {
                plugins: ['ldk-usereditablecombo']
            }
        },
        chargetype: {
            columnConfig: {
                width: 160
            }
        },
        species: {
            editorConfig: {
                caseSensitive: false,
                anyMatch: true,
                plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                    allowChooseOther: false
                })]
            },
            lookup: {
                filterArray: [LABKEY.Filter.create('dateDisabled', null, LABKEY.Filter.Types.ISBLANK)]
            }
        },
        'Id/demographics/species': {
            editorConfig: {
                caseSensitive: false,
                anyMatch: true,
                plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                    allowChooseOther: false
                })]
            },
            lookup: {
                filterArray: [LABKEY.Filter.create('dateDisabled', null, LABKEY.Filter.Types.ISBLANK)]
            }
        },
        date: {
            allowBlank: false,
            nullable: false,
            noSaveInTemplateByDefault: true,
            editorConfig: {
                dateFormat: 'Y-m-d',
                otherToNow: true,
                timeFormat: 'H:i'
            },
            columnConfig: {
                fixed: true,
                width: 180
            },
            getInitialValue: function(v, rec){
                return v ? v : new Date()
            }
        },
        objectid: {
            noSaveInTemplateByDefault: true,
            getInitialValue: function(v, rec){
                return v || LABKEY.Utils.generateUUID().toUpperCase();
            }
        },
        room: {
            editorConfig: {
                listWidth: 200
            }
        },
        qualresult: {
            columnConfig: {
                width: 150
            }
        },
        result: {
            columnConfig: {
                width: 150
            }
        },
        numericresult: {
            columnConfig: {
                width: 150
            }
        },        resultNumber: {
            hidden: true
        },
        resultInRange: {
            hidden: true
        },
        resultOORIndicator: {
            hidden: false
        },
        quantityNumber: {
            hidden: true
        },
        quantityInRange: {
            hidden: true
        },
        quantityOORIndicator: {
            hidden: true
        },
        testid: {
            columnConfig: {
                showLink: false,
                width: 200
            }
        },
        chargeId: {
            allowBlank: false,
            columnConfig: {
                width: 300
            },
            editorConfig: {
                caseSensitive: false,
                anyMatch: true,
                listConfig: {
                    innerTpl: '{[(values.category ? "<b>" + values.category + ":</b> " : "") + values.name]}',
                    getInnerTpl: function(){
                        return this.innerTpl;
                    }
                }
            },
            lookup: {
                sort: 'category,name',
                columns: '*'
            }
        },
        begindate: {
            xtype: 'xdatetime',
            hidden: true,
            noSaveInTemplateByDefault: true,
            columnConfig: {
                fixed: true,
                width: 130
            }
        },
        enddate: {
            noSaveInTemplateByDefault: true,
            shownInInsertView: true,
            columnConfig: {
                fixed: true,
                width: 180
            },
            //this will be ignored unless we use a datetime editor
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            }
        },
        code: {
            columnConfig: {
                width: 250,
                showLink: false
            }
        },
        tissue: {
            editorConfig: {
                xtype: 'ehr-snomedcombo',
                defaultSubset: 'Organ/Tissue'
            },
            columnConfig: {
                width: 200,
                showLink: false
            }
        },
        performedby: {
            noSaveInTemplateByDefault: true,
            columnConfig: {
                width: 160
            },
            shownInGrid: true
        },
        CreatedBy: {
            hidden: false,
            shownInInsertView: true,
            xtype: 'displayfield',
            shownInGrid: false
        },
        ModifiedBy: {
            hidden: false,
            shownInInsertView: true,
            xtype: 'displayfield',
            shownInGrid: false
        },
        AnimalVisit: {hidden: true},
        SequenceNum: {hidden: true},
        description: {hidden: true},
        Dataset: {hidden: true},
        QCState: {
            allowBlank: false,
            noDuplicateByDefault: true,
            allowSaveInTemplate: false,
            allowDuplicateValue: false,
            noSaveInTemplateByDefault: true,
            facetingBehaviorType: "AUTO",
            getInitialValue: function(v){
                var qc;
                if (!v && EHR.Security.getQCStateByLabel('In Progress'))
                    qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                return v || qc;
            },
            shownInGrid: false,
            hidden: false,
            editorConfig: {
                editable: false,
                listWidth: 200,
                disabled: true
            },
            columnConfig: {
                width: 70
            }
        },
        parentid: {
            alwaysDuplicate: true,
            hidden: true,
            lookups: false
        },
        taskid: {
            //alwaysDuplicate: true,  // should be covered by the form
            lookups: false,
            hidden: true
        },
        requestid: {
            //alwaysDuplicate: true,  //should be covered by the form
            lookups: false,
            hidden: true
        },
        runid: {
            alwaysDuplicate: true,
            lookups: false,
            hidden: true
        },
        AgeAtTime: {hidden: true},
        Notes: {hidden: true},
        DateOnly: {hidden: true},
        Survivorship: {hidden: true},
        remark: {
            xtype: 'ehr-remarkfield',
            height: 100,
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        hx: {
            columnConfig: {
                width: 200
            }
        },
        s: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        so: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        o: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        a: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        p: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        p2: {
            xtype: 'ehr-remarkfield',
            editorConfig: {
                resizeDirections: 's'
            },
            columnConfig: {
                width: 200
            }
        },
        project: {
            xtype: 'ehr-projectentryfield',
            editorConfig: {

            },
            shownInGrid: true,
            useNull: true,
            lookup: {
                columns: 'project,name,displayName,protocol'
            },
            columnConfig: {
                width: 120
            }
        },
        account: {
            shownInGrid: false
        }
    },
    byQuery: {
        'ehr.tasks': {
            taskid: {
                getInitialValue: function(v, rec){
                    v = v || (rec.dataEntryPanel && rec.dataEntryPanel.taskId ? rec.dataEntryPanel.taskId : LABKEY.Utils.generateUUID().toUpperCase());
                    rec.dataEntryPanel.taskId = v;
                    return v;
                },
                hidden: true
            },
            assignedto: {
                useNull: true,
                facetingBehaviorType: "AUTO",
                getInitialValue: function(val, rec){
                    LDK.Assert.assertNotEmpty('No dataEntryPanel for model', rec.dataEntryPanel);
                    return val || rec.dataEntryPanel.formConfig.defaultAssignedTo || LABKEY.Security.currentUser.id
                },
                xtype: 'ehr-usersandgroupscombo',
                lookup: {
                    sort: 'Type,DisplayName'
                },
                editorConfig: {listWidth: 200}
            },
            duedate: {
                xtype: 'xdatetime',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                },
                getInitialValue: function(val){
                    return val || new Date();
                }
            },
            category: {
                hidden: true
            },
            rowid: {
                xtype: 'displayfield'
            },
            formtype: {
                xtype: 'displayfield',
                hidden: true,
                getInitialValue: function(val, rec){
                    return val || rec.dataEntryPanel.formConfig.name;
                }
            },
            title: {
                getInitialValue: function(val, rec){
                    return val || rec.dataEntryPanel.formConfig.label;
                }
            },
            datecompleted: {
                hidden: true
            }
        },
        'ehr.requests': {
            sendemail: {
                //NOTE: Ext doesnt seem to respect value=true, so resort to checked.
                editorConfig: {
                    checked: true
                }
            },
            requestid: {
                getInitialValue: function(v, rec){
                    v = v || (rec.dataEntryPanel && rec.dataEntryPanel.requestId ? rec.dataEntryPanel.requestId : LABKEY.Utils.generateUUID().toUpperCase());
                    rec.dataEntryPanel.requestId = v;
                    return v;
                },
                hidden: true
            },
            notify1: {
                defaultValue: LABKEY.Security.currentUser.id,
                lookup: {
                    sort: 'Type,DisplayName'
                },
                listWidth: 250
            },
            notify2: {
                lookup: {
                    sort: 'Type,DisplayName'
                },
                listWidth: 250
            },
            notify3: {
                lookup: {
                    sort: 'Type,DisplayName'
                },
                listWidth: 250
            },
            daterequested: {
                xtype: 'xdatetime',
                hidden: true
            },
            priority: {
                defaultValue: 'Routine'
            },
            rowid: {
                xtype: 'displayfield'
            },
            pi: {
                hidden: true
            },
            formtype: {
                xtype: 'displayfield',
                hidden: true,
                getInitialValue: function(val, rec){
                    return val || rec.dataEntryPanel.formConfig.name;
                }
            },
            title: {
                getInitialValue: function(val, rec){
                    return val || rec.dataEntryPanel.formConfig.label;
                }
            }
        },
        'study.grossFindings': {
            sort_order: {
                hidden: true
            },
            remark: {
                editorConfig: {
                    resizeDirections: 's se e'
                }
            }
        },
        'study.parentage': {
            parent: {
                lookups: false
            },
            method: {
                columnConfig: {
                    width: 160
                }
            },
            relationship: {
                columnConfig: {
                    width: 160
                }
            }
        },
        'study.Demographics': {
            Id: {
                allowBlank: false,
                editorConfig: {
                    allowAnyId: true
                }
            },
            project: {hidden: true},
            performedby: {hidden: true},
            account: {hidden: true},
            species: {allowBlank: false},
            gender: {allowBlank: false}
        },
        'study.microbiology': {
            tissue: {
                hidden: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organ/Tissue'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            },
            organism: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organisms'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            }
        },
        'study.antibioticSensitivity': {
            tissue: {
                hidden: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organ/Tissue'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            },
            microbe: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organisms'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            },
            antibiotic: {
                allowBlank: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Antibiotics'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            },
            project: {
                hidden: true
            },
            result: {
                allowBlank: false
            }
        },
        'study.parasitologyResults': {
            organism: {
                allowBlank: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Parasitology Results'
                },
                columnConfig: {
                    width: 200
                }
            },
            sampletype: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Parasitology Sampletype'
                },
                columnConfig: {
                    width: 200
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: true
            },
            result: {
                compositeField: 'Numeric Result'
            },
            units: {
                compositeField: 'Numeric Result'
            }
        },
        'study.tissueDistributions': {
            project: {
                hidden: false
            },
            qualifier: {
                hidden: true
            },
            performedby: {
                hidden: true
            },
            tissue: {
                allowBlank: false,
                columnConfig: {
                    width: 250
                }
            },
            sampletype: {
                columnConfig: {
                    width: 200
                }
            },
            recipient: {
                columnConfig: {
                    width: 200
                },
                lookup: {
                    filterArray: [LABKEY.Filter.create('dateDisabled', null, LABKEY.Filter.Types.ISBLANK)]
                }
            },
            requestcategory: {
                columnConfig: {
                    width: 200
                }
            }
        },
        'study.matings': {
            matingtype: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            male: {
                allowBlank: false
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            enddate: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            }
        },
        'study.pregnancyConfirmation': {
            confirmationType: {
                columnConfig: {
                    width: 150
                }
            },
            estDeliveryDate: {
                columnConfig: {
                    width: 150
                }
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            }
        },
        'study.tissue_samples': {
            tissue: {
                allowBlank: false
            },
            performedby: {
                hidden: true
            },
            tissueCondition: {
                columnConfig: {
                    width: 150
                }
            },
            preparation: {
                columnConfig: {
                    width: 200
                }
            },
            qualifier: {
                hidden: true,
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                shownInGrid: false
            },
            quantity: {
                shownInGrid: true
            },
            ship_to : {
                shownInGrid: false
            },
            tissueRemarks : {
                shownInGrid: false
            },
            stain: {
                defaultValue: 'Hematoxylin & Eosin',
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                shownInGrid: false
            },
            recipient: {
                shownInGrid: false
            }
        },
        'study.pathologyDiagnoses': {
            performedby: {
                hidden: true
            },
            remark: {
                columnConfig: {
                    width: 400
                }
            },
            sort_order: {
                allowDuplicateValue: false
            }
        },
        'study.histology': {
            sort_order: {
                allowDuplicateValue: false
            },
            performedby: {
                hidden: true
            },
            stain: {
                defaultValue: 'Hematoxylin & Eosin',
                hidden: true,
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            tissue: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organ/Tissue'
                },
                allowBlank: false
            },
            qualifier: {
                hidden: true,
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            remark: {
                columnConfig: {
                    width: 400
                }
            }
        },
        'study.housing': {
            date: {

            },
            enddate: {

            },
            performedby: {
                allowBlank: false,
                lookup: {
                    schemaName: 'core',
                    queryName: 'users',
                    keyColumn: 'DisplayName',
                    displayColumn: 'DisplayName',
                    columns: 'UserId,DisplayName,FirstName,LastName',
                    sort: 'Type,DisplayName'
                },
                editorConfig: {
                    anyMatch: true,
                    listConfig: {
                        innerTpl: '{[values.DisplayName + (values.LastName ? " (" + values.LastName + (values.FirstName ? ", " + values.FirstName : "") + ")" : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            project: {
                hidden: true
            },
            reason: {
                defaultValue: 'Husbandry',
                allowBlank: false,
                columnConfig: {
                    width: 180
                },
                lookup: {
                    filterArray: [LABKEY.Filter.create('date_disabled', null, LABKEY.Filter.Types.ISBLANK)]
                }
            },
            room: {
                xtype: 'ehr-roomfieldsingle',
                allowBlank: false,
                columnConfig: {
                    width: 150
                }
            },
            divider: {
                columnConfig: {
                    width: 160
                },
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK),
                        LABKEY.Filter.create('divider', 'Cage End (Solid)', LABKEY.Filter.Types.NEQ_OR_NULL)
                    ]
                }
            }
        },
        'onprc_ehr.housing_transfer_requests': {
            date: {

            },
            enddate: {

            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {
                hidden: true
            },
            reason: {
                columnConfig: {
                    width: 180
                },
                lookup: {
                    filterArray: [LABKEY.Filter.create('date_disabled', null, LABKEY.Filter.Types.ISBLANK)]
                }
            },
            room: {
                xtype: 'ehr-roomfieldsingle',
                columnConfig: {
                    width: 160
                }
            },
            cage: {
                columnConfig: {
                    width: 160
                }
            },
            divider: {
                columnConfig: {
                    width: 160
                },
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK),
                        LABKEY.Filter.create('divider', 'Cage End (Solid)', LABKEY.Filter.Types.NEQ_OR_NULL)
                    ]
                }
            }
        },
        'ehr.encounter_participants': {
            Id: {
                hidden: false,
                allowBlank: false
            },
            userid: {
                hidden: true,
                columnConfig: {
                    width: 200
                }
            },
            username: {
                hidden: false,
                allowBlank: false,
                columnConfig: {
                    width: 200
                },
                lookup: {
                    columns: 'UserId,DisplayName,FirstName,LastName',
                    sort: 'Type,DisplayName'
                },
                editorConfig: {
                    plugins: ['ldk-usereditablecombo'],
                    anyMatch: true,
                    listConfig: {
                        innerTpl: '{[values.DisplayName + (values.LastName ? " (" + values.LastName + (values.FirstName ? ", " + values.FirstName : "") + ")" : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            role: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            comment: {
                hidden: true
            }
        },
        'study.animal_group_members': {
            groupId: {
                columnConfig: {
                    width: 150
                },
                lookup: {
                    filterArray: [LABKEY.Filter.create('enddatecoalesced', '+0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)]
                }
            },
            releaseType: {
                columnConfig: {
                    width: 150
                }
            }
        },
        'ehr.encounter_summaries': {
            remark: {
                allowBlank: false,
                columnConfig: {
                    width: 700
                },
                editorConfig: {
                    resizeDirections: 's se e'
                }
            },
            category: {
                columnConfig: {
                    width: 150
                }
            }
        },
        'study.encounters': {
            assistingstaff: {
                hidden: true,
                columnConfig: {
                    width: 140
                }
            },
            instructions: {
                height: 100,
                columnConfig: {
                    width: 200
                }
            },
            serviceRequested: {
                xtype: 'displayfield',
                editorConfig: {
                    height: 100
                }
            },
            major: {
                hidden: true
            },
            performedby: {
                allowBlank: false
            },
            type: {
                allowBlank: false
            },
            caseno: {
                hidden: true
            },
            title: {
                hidden: true
            },
            project: {
                allowBlank: false
            },
            procedureid: {
                allowBlank: false
            }
        },
        'study.clinremarks': {
            project: {
                hidden: true
            },
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            date: {
                noDuplicateByDefault: false
            },
            account: {
                hidden: true
            },
            hx: {
                formEditorConfig: {
                    xtype: 'ehr-hxtextarea'
                },
                height: 100
            },
            s: {
                height: 75
            },
            so: {
                height: 75
            },
            o: {
                height: 75
            },
            a: {
                height: 75
            },
            p: {
                height: 75
            },
            p2: {
                formEditorConfig: {
                    xtype: 'ehr-plantextarea'
                },
                height: 75
            },
            remark: {
                height: 75,
                label: 'Other Remark'
            }
        },
        'study.clinpathRuns': {
            date: {

            },
            collectionMethod : {
                columnConfig: {
                    width: 160
                }
            },
            sampleType : {
                hidden: true,
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                columnConfig: {
                    width: 160
                }
            },
            tissue: {
                columnConfig: {
                    width: 200
                },
                editorConfig: {
                    defaultSubset: 'Lab Sample Types'
                }
            },
            condition: {
                hidden: true
            },
            sampleId: {
                shownInGrid: false
            },
            sampleQuantity: {
                shownInGrid: true
            },
            quantityUnits: {
                shownInGrid: false
            },
            units: {
                hidden: true
            },
            servicerequested: {
                allowBlank: false,
                columnConfig: {
                    width: 250
                },
                editorConfig: {
                    anyMatch: true,
                    listConfig: {
                        innerTpl: '{[(values.chargetype ? "<b>" + values.chargetype + ":</b> " : "") + values.servicename + (values.outsidelab ? "*" : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                },
                lookup: {
                    sort: 'chargetype,servicename,outsidelab',
                    columns: '*'
                }
            },
            project: {
                allowBlank: false
            },
            source: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organisms'
                }
            },
            type: {
                showInGrid: false,
                xtype: 'displayfield',
                columnConfig: {
                    width: 150
                }
            },
            collectedby: {
                shownInGrid: false
            },
            instructions: {
                hidden: true,
                shownInGrid: true,
                columnConfig: {
                    width: 200
                }
            }
        },
        'study.treatment_order': {
            date: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                allowBlank: false,
                editorConfig: {
                    defaultHour: 8,
                    defaultMinutes: 0
                },
                getInitialValue: function(v, rec){
                    if (v)
                        return v;

                    var ret = Ext4.Date.clearTime(new Date());
                    ret = Ext4.Date.add(ret, Ext4.Date.DAY, 1);
                    ret.setHours(8);
                    return ret;
                }
            },
            enddate: {
                xtype: 'xdatetime',
                allowBlank: false,
                extFormat: 'Y-m-d H:i',
                editorConfig: {
                    defaultHour: 23,
                    defaultMinutes: 59
                }
            },
            project: {
                allowBlank: false
            },
            reason: {
                hidden: true
            },
            route: {
                shownInGrid: true,
                allowBlank: false
            },
            frequency: {
                allowBlank: false,
                lookup: {
                    sort: 'sort_order',
                    filterArray: [LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)],
                    columns: '*'
                },
                editorConfig: {
                    listConfig: {
                        innerTpl: '{[(values.meaning) + (values.times ? " (" + values.times + ")" : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                },
                columnConfig: {
                    width: 180
                }
            },
            code: {
                //shownInGrid: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Common Treatments'
                }
            },
            qualifier: {
                shownInGrid: false
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            category: {
                allowBlank: false,
                shownInGrid: false,
                defaultValue: 'Clinical'
            }
        },
        'ehr.project': {
            project: {
                xtype: 'hidden',
                userEditable: false,
                hidden: true
            },
            name: {
                allowBlank: false,
                xtype: 'ehr-projectgeneratorfield'
            },
            use_category: {
                defaultValue: 'Research'
            },
            shortName: {
                hidden: true
            }
        },
        'ehr.protocol_counts': {
            project: {
                xtype: 'ehr-projectfield',
                editorConfig: {
                    showInactive: true
                }
            },
            gender: {
                lookup: {
                    filterArray: [LABKEY.Filter.create('meaning', 'Unknown', LABKEY.Filter.Types.NEQ)]
                }
            },
            description: {
                hidden: false
            }
        },
        'ehr.protocolProcedures': {
            startdate: {
                allowBlank: false
            },
            enddate: {
                allowBlank: false
            },
            procedureName: {
                allowBlank: false
            },
            allowed: {
                allowBlank: false
            }
        },
        'ehr.protocol': {
            protocol: {
                xtype: 'hidden',
                userEditable: false,
                hidden: true
            },
            title: {
                height: 80
            }
        },
        'onprc_ehr.investigators': {
            rowid: {
                editable: false
            },
            employeeid: {
                hidden: false
            },
            address: {
                height: 100
            }
        },
        'onprc_billing.chargeRateExemptions': {
            project: {
                xtype: 'ehr-projectfield',
                editorConfig: {
                    showInactive: true
                }
            }
        },
        'onprc_billing.procedureFeeDefinition': {
            procedureid: {
                columnConfig: {
                    width: 250
                },
                editorConfig: {
                    caseSensitive: false,
                    anyMatch: true,
                    listConfig: {
                        innerTpl: '{[(values.category ? "<b>" + values.category + ":</b> " : "") + values.name]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                },
                lookup: {
                    sort: 'category,name',
                    filterArray: [LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)],
                    columns: 'rowid,name,category,remark,active'
                }
            }
        },
        'onprc_billing.projectMultipliers': {
            project: {
                xtype: 'ehr-projectfield',
                editorConfig: {
                    showInactive: true
                }
            },
            multiplier: {
                editorConfig: {
                    decimalPrecision: 4
                }
            }
        },
        'onprc_billing.projectAccountHistory': {
            project: {
                xtype: 'ehr-projectfield',
                editorConfig: {
                    showInactive: true
                }
            }
        },
        'study.Assignment': {
            project: {
                shownInGrid: true,
                allowBlank: false,
                xtype: 'ehr-projectfield'
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            enddate: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            projectedRelease: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            assignCondition: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                },
                lookup: {
                    sort: 'code'
                },
                editorConfig: {
                    listConfig: {
                        innerTpl: '{[values.meaning + " (" + values.code + ")"]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            projectedReleaseCondition: {
                allowBlank: false,
                columnConfig: {
                    width: 220
                },
                lookup: {
                    sort: 'code'
                },
                editorConfig: {
                    listConfig: {
                        innerTpl: '{[values.meaning + " (" + values.code + ")"]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            releaseCondition: {
                columnConfig: {
                    width: 200
                },
                lookup: {
                    sort: 'code'
                },
                editorConfig: {
                    listConfig: {
                        innerTpl: '{[values.meaning + " (" + values.code + ")"]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            releaseType: {
                columnConfig: {
                    width: 150
                }
            }
        },
        'study.flags': {
            flag: {
                allowBlank: false,
                lookup: {
                    columns: 'objectid,value,category,code',
                    sort: 'category,code,value',
                    filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)]
                },
                columnConfig: {
                    width: 300
                },
                editorConfig: {
                    caseSensitive: false,
                    anyMatch: true,
                    plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    })],
                    listConfig: {
                        innerTpl: '{[(values.category ? ("<b>" + values.category + ":</b> ") : "") + values.value + (values.code ? (" (" + values.code + ")") : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    }
                }
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            }
        },
        'study.measurements': {
            measurement1: {
                allowBlank: false,
                columnConfig: {
                    width: 150
                }
            },
            measurement2: {
                columnConfig: {
                    width: 150
                }
            },
            measurement3: {
                columnConfig: {
                    width: 150
                }
            },
            tissue: {
                allowBlank: false,
                editorConfig: {
                    defaultSubset: 'Measurements'
                }
            },
            units: {
                defaultValue: 'cm'
            }
        },
        'ehr.snomed_tags': {
            rowid: {
                hidden: true,
                allowBlank: true
            },
            caseid: {
                hidden: true
            }
        },
        'onprc_billing.miscCharges': {
            Id: {
                allowBlank: true,
                nullable: true
            },
            chargeId: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            chargetype: {
                allowBlank: false,
                hidden: false
            },
            chargecategory: {
                editorConfig: {
                    plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    })]
                },
                columnConfig: {
                    width: 150
                }
            },
            unitcost: {
                hidden: false,
                columnConfig: {
                    getEditor: function(rec){
                        var fieldCfg = {
                            xtype: 'ldk-numberfield',
                            hideTrigger: true,
                            decimalPrecision: 2
                        };

                        //added to support reversals
                        if (this.enforceUnitCost === false){
                            return fieldCfg;
                        }

                        if (rec.get('chargeId')){
                            var refIdx = EHR.DataEntryUtils.getChareableItemsStore().findExact('rowid', rec.get('chargeId'));
                            if (refIdx != -1){
                                var refRec = EHR.DataEntryUtils.getChareableItemsStore().getAt(refIdx);
                                if (refRec.get('allowscustomunitcost')){
                                    return fieldCfg
                                }
                            }
                        }

                        return false;
                    }
                }
            },
            project: {
                allowBlank: false
            },
            quantity: {
                allowBlank: false
            },
            comment: {
                columnConfig: {
                    width: 250
                }
            }
        },
        'study.clinical_observations': {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            category: {
                allowBlank: false,
                editorConfig: {
                    plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    })]
                },
                lookup: {
                    columns: 'value,description'
                },
                columnConfig: {
                    width: 200
                }
            },
            area: {
                defaultValue: 'N/A',
                columnConfig: {
                    width: 200
                }
            },
            observation: {
                columnConfig: {
                    width: 200
                }
            },
            remark: {
                columnConfig: {
                    width: 300
                }
            }
        },
        'study.miscTests': {
            result: {
                compositeField: 'Numeric Result'
            },
            units: {
                compositeField: 'Numeric Result'
            },
            category: {
                hidden: true
            },
            code: {
                hidden: true,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Organ/Tissue'
                }
            },
            testid: {
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                lookup: {
                    columns: '*'
                }
            },
            sampleType: {
                hidden: true
            }
        },
        'study.serology': {
            definitive: {
                hidden: true
            },
            category: {
                hidden: true
            },
            qualifier: {
                hidden: false,
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            agent: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Agents'
                },
                columnConfig: {
                    width: 200,
                    showLink: false
                }
            },
            numericresult: {
                compositeField: 'Numeric Result'
            },
            units: {
                compositeField: 'Numeric Result'
            },
            tissue: {
                hidden: false
            },
            method: {
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            result: {
                allowBlank: false
            }
        },
        'study.chemistryResults': {
            category: {
                hidden: true
            },
            resultOORIndicator: {
                label: 'Result',
                shownInGrid: false,
                compositeField: 'Result',
                width: 80,
                includeNullRecord: false,
                nullCaption: '',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'oor_indicators',
                    keyColumn: 'indicator',
                    displayColumn: 'indicator'
                }
            },
            result: {
                allowBlank: false,
                compositeField: 'Result',
                editorConfig: {
                    decimalPrecision: 4
                }
            },
            units: {
                compositeField: 'Result',
                width: 40
            },
            testid: {
                lookup: {
                    columns: '*'
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: true
            }
        },
        'study.iStat': {
            resultOORIndicator: {
                hidden: true
            },
            result: {
                allowBlank: false,
                compositeField: 'Result'
            },
            units: {
                compositeField: 'Result'
            },
            testid: {
                lookup: {
                    columns: '*'
                }
            },
            qualresult: {
                hidden: true
            }
        },
        'study.hematologyResults': {
            resultOORIndicator: {
                hidden: true
            },
            result: {
                allowBlank: false,
                compositeField: 'Result'
            },
            units: {
                compositeField: 'Result'
            },
            testid: {
                lookup: {
                    columns: '*'
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: true
            }
        },
        'study.urinalysisResults': {
            resultOORIndicator: {
                label: 'Result',
                shownInGrid: false,
                compositeField: 'Result',
                width: 80,
                includeNullRecord: false,
                nullCaption: '',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'oor_indicators',
                    keyColumn: 'indicator',
                    displayColumn: 'indicator'
                }
            },
            result: {
                compositeField: 'Result',
                editorConfig: {
                    decimalPrecision: 3
                },
                extFormat: '0,000.000'
            },
            rangeMax: {
                compositeField: 'Result',
                editorConfig: {
                    decimalPrecision: 3
                }
            },
            units: {
                compositeField: 'Result'
            },
            testid: {
                lookup: {
                    columns: '*'
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: true
            },
            qualresult: {
                xtype: 'ehr-urinalysisresultfield',
                lookup: {
                    columns: 'rowid,value,description,sort_order',
                    sort: 'sort_order'
                }
            }
        },
        'study.Arrival': {
            Id: {
                xtype: 'ehr-animalgeneratorfield',
                editorConfig: {allowAnyId: true}
            },
            date: {
                extFormat: 'Y-m-d'
            },
            project: {hidden: true},
            account: {hidden: true},
            source: {
                editorConfig: {
                    caseSensitive: false,
                    anyMatch: true,
                    plugins: ['ldk-usereditablecombo']
                },
                columnConfig: {
                    width: 180
                },
                allowBlank: false
            },
            birth: {
                allowBlank: false,
                columnConfig: {
                    width: 120
                }
            },
            estimated: {
                hidden: false,
                columnConfig: {
                    width: 200
                }
            },
            performedby: {
                hidden: true
            },
            remark: {
                shownInGrid: true
            },
            initialRoom: {
                allowBlank: false,
                hidden: false,
                xtype: 'ehr-roomentryfield',
                editorConfig: {
                    idFieldIndex: 'Id',
                    cageFieldIndex: 'cage'
                },
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            initialCage: {
                hidden: false
            },
            geographic_origin: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            acquisitionType: {
                columnConfig: {
                    width: 200
                }
            },
            gender: {
                allowBlank: false
            },
            species: {
                allowBlank: false
            },
            cites: {
                columnConfig: {
                    width: 120
                }
            },
            customsDate: {
                columnConfig: {
                    width: 120
                }
            },
            rearingType: {
                columnConfig: {
                    width: 200
                },
                getInitialValue: function(val, rec){
                    if (val)
                        return val;

                    var storeId = LABKEY.ext4.Util.getLookupStoreId({
                        lookup: {
                            schemaName: 'ehr_lookups',
                            queryName: 'RearingType',
                            keyColumn: 'rowid',
                            displayColumn: 'value'
                        }
                    });

                    var store = Ext4.StoreMgr.get(storeId);
                    if (store){
                        var lookupRecIdx = store.find('value', 'Captive Reared');
                        if (lookupRecIdx > -1){
                            return store.getAt(lookupRecIdx).get('rowid');
                        }
                    }
                    else {
                        console.log('upable to find lookup store for rearing type');
                    }
                }
            }
        },
        'study.Departure': {
            performedby: {
                hidden: true
            },
            project: {
                hidden: true
            },
            account: {
                hidden: true
            },
            destination: {
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                columnConfig: {
                    width: 200
                },
                allowBlank: false
            },
            authorize: {
                columnConfig: {
                    width: 200
                }
            }
        },
        'study.Deaths': {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {
                hidden: true,
                allowBlank: true
            },
            account: {hidden: true},
            necropsy: {
                lookups: false,
                columnConfig: {
                    width: 150
                }
            },
            cause: {
                allowBlank: false,
                columnConfig: {
                    width: 120
                }
            },
            dam: {
                columnConfig: {
                    width: 180
                }
            },
            notatcenter: {
                columnConfig: {
                    width: 210
                }
            },
            manner: {
                columnConfig: {
                    width: 140
                }
            },
            tattoo: {
                editorConfig: {
                    helpPopup: 'Please enter the color and number of the tag and/or all visible tattoos'
                }
            },
            roomattime: {
                hidden: true
            },
            cageattime: {
                hidden: true
            }
        },
        'study.Birth': {
            Id: {
                xtype: 'ehr-animalgeneratorfield'
            },
            date: {
                defaultValue: null,
                getInitialValue: function(v, rec){
                    return v;
                }
            },
            performedby: {hidden: true},
            project: {hidden: true},
            weight: {
                editorConfig: {
                    decimalPrecision: 3
                }
            },
            wdate: {
                columnConfig: {
                    fixed: true,
                    width: 130
                }
            },
            type: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            birthtype: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            birth_condition: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                }
            },
            date_type: {
                allowBlank: false,
                defaultValue: 'Estimated'
            },
            origin: {
                hidden: true
            },
            estimated: {
                hidden: true,
                columnConfig: {
                    width: 200
                }
            },
            gender: {
                allowBlank: false
            },
            species: {
                allowBlank: false
            },
            geographic_origin: {
                allowBlank: false,
                columnConfig: {
                    width: 200
                },
                editorConfig: {
                    plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    })]
                }
            },
            conception: {
                hidden: true
            },
            conceptualDay: {
                columnConfig: {
                    width: 180
                }
            },
            teeth: {
                columnConfig: {
                    width: 140
                }
            },
            room: {
                allowBlank: false
            }
        },
        'study.blood' : {
            billedby: {
                shownInGrid: false
            },
            chargetype: {
                allowBlank: false
            },
            remark: {
                shownInGrid: false
            },
            project: {
                allowBlank: false
            },
            requestor: {
                shownInGrid: false,
                hidden: true,
                formEditorConfig:{
                    readOnly: true
                }
            },
            performedby: {
                shownInGrid: true,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            sampletype: {
                columnConfig: {
                    width: 130
                }
            },
            instructions: {
                shownInGrid: true,
                columnConfig: {
                    width: 200
                }
            },
            additionalServices: {
                xtype: 'checkcombo',
                hasOwnTpl: true,
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_services',
                    displayColumn: 'service',
                    keyColumn: 'service'
                },
                editorConfig: {
                    tpl: null,
                    multiSelect: true,
                    separator: ';'
                },
                columnConfig: {
                    width: 200
                }
            },
            tube_type: {
                xtype: 'combo',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_tube_type',
                    displayColumn: 'type',
                    keyColumn: 'type',
                    columns: 'type,volume,color'
                },
                editorConfig: {
                    listConfig: {
                        innerTpl: '{[(values.type) + (values.color ? " (" + values.color + ")" : "")]}',
                        getInnerTpl: function(){
                            return this.innerTpl;
                        }
                    },
                    listeners: {
                        select: function(field, recs){
                            if (!recs || recs.length != 1)
                                return;

                            var record = EHR.DataEntryUtils.getBoundRecord(field);
                            if (record){
                                var rec = recs[0];
                                var meta = record.store.model.prototype.fields.get('tube_vol');
                                var storeId = LABKEY.ext4.Util.getLookupStoreId(meta);
                                var store = Ext4.StoreMgr.get(storeId);
                                if (store){
                                    store.filterArray = [LABKEY.Filter.create('tube_types', rec.get('type'), LABKEY.Filter.Types.CONTAINS)];
                                    store.load();
                                }
                            }
                        }
                    }
                },
                columnConfig: {
                    width: 100,
                    showLink: false
                }
            },
            quantity: {
                shownInGrid: true,
                allowBlank: false,
                editorConfig: {
                    allowNegative: false
                },
                columnConfig: {
                    width: 150
                }
            },
            num_tubes: {
                xtype: 'ehr-triggernumberfield',
                editorConfig: {
                    allowNegative: false,
                    triggerToolTip: 'Click to calculate volume based on tube volume and number of tubes',
                    triggerCls: 'x4-form-search-trigger',
                    onTriggerClick: function(){
                        var record = EHR.DataEntryUtils.getBoundRecord(this);
                        if (record){
                            var tube_vol = record.get('tube_vol');
                            if (!tube_vol || !this.getValue()){
                                Ext4.Msg.alert('Error', 'Must enter tube volume and number of tubes');
                                return;
                            }

                            EHR.DataEntryUtils.calculateQuantity(this);
                        }
                    }
                },
                allowBlank: true,
                columnConfig: {
                    width: 100,
                    header: '# Tubes',
                    showLink: false
                }
            },
            tube_vol: {
                shownInGrid: true,
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_tube_volumes',
                    displayColumn: 'volume',
                    keyColumn: 'volume',
                    columns: '*',
                    sort: 'volume'
                },
                columnConfig: {
                    width: 130,
                    header: 'Tube Vol (mL)',
                    showLink: false
                }
            }
        },
        'study.drug': {
            lot: {
                shownInGrid: true
            },
            reason: {
                defaultValue: 'N/A'
            },
            enddate: {
                shownInGrid: false,
                hidden: true,
                shownInInsertView: true,
                label: 'End Time'
            },
            category: {
                hidden: true
            },
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Common Treatments'
                }
            },
            date: {
                header: 'Start Time',
                label: 'Start Time',
                hidden: false
            },
            HeaderDate: {
                xtype: 'xdatetime',
                hidden: true,
                shownInGrid: false
            },
            route: {
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                },
                allowBlank: false
            },
            performedby: {
                allowBlank: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {
                allowBlank: false
            },
            chargetype: {
                allowBlank: false
            },
            restraint: {
                shownInGrid: false
            },
            restraintDuration: {
                shownInGrid: false
            },
            qualifier: {
                shownInGrid: false
            }
        },
        'study.notes': {
            remark: {
                hidden: true
            },
            category: {
                columnConfig: {
                    width: 180
                },
                editorConfig: {
                    plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    })]
                }
            },
            value: {
                columnConfig: {
                    width: 300
                }
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            actiondate: {
                columnConfig: {
                    width: 130
                }
            }
        },
        'study.problem': {
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            enddate: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            project: {hidden: true},
            account: {hidden: true},
            performedby: {hidden: true},
            code: {hidden: true},
            problem_no: {shownInInsertView: false}
        },
//        'study.Clinical Observations': {
//            observation: {
//                //xtype: 'ehr-remoteradiogroup',
//                includeNullRecord: false,
//                editorConfig: {columns: 2},
//                lookup: {
//                    schemaName: 'ehr_lookups',
//                    queryName: 'normal_abnormal',
//                    displayColumn: 'state',
//                    keyColumn: 'state',
//                    sort: '-state'
//                }
//            },
//            date: {
//                label: 'Time'
//            },
//            performedby: {
//                hidden: true
//            }
//        },
        'study.tb': {
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            lot: {
                shownInGrid: false
            },
            project: {
                hidden: true
            },
            account: {
                hidden: true
            },
            eye: {
                hidden: true
            },
            result: {
                hidden: true
            },
            dilution: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            method: {
                columnConfig: {
                    width: 150
                },
                defaultValue: 'Intradermal'
            }
        },
        'study.weight': {
            project: {
                hidden: true
            },
            account: {
                hidden: true
            },
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            'id/curlocation/location': {
                shownInGrid: true
            },
            remark: {
                shownInGrid: true
            },
            weight: {
                allowBlank: false,
                useNull: true,
                editorConfig: {
                    allowNegative: false,
                    decimalPrecision: 4
                }
            }
        },
        'study.pairings': {
            date: {
                getInitialValue: function(v){
                    //NOTE: we do not want this to have a default date
                    return v;
                }
            },
            pairid: {
                hidden: true
            },
            lowestcage: {
                allowBlank: false,
                columnConfig: {
                    width: 120,
                    showLink: false
                },
                xtype: 'ehr-lowestcagefield'
            },
            pairingtype: {
                columnConfig: {
                    width: 145,
                    showLink: false
                }
            },
            goal: {
                columnConfig: {
                    width: 145,
                    showLink: false
                }
            },
            eventtype: {
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            separationreason: {
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            housingtype: {
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            observation: {
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            outcome: {
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            },
            room: {
                xtype: 'ehr-roomentryfield',
                editorConfig: {
                    idFieldIndex: 'Id',
                    cageFieldIndex: 'cage'
                },
                columnConfig: {
                    width: 160,
                    showLink: false
                }
            }
        },
        'ehr_lookups.procedure_default_treatments': {
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Common Treatments'
                }
            }
        },
        'ehr_lookups.procedure_default_codes': {
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Common Treatments'
                }
            }
        },
        'ehr_lookups.drug_defaults': {
            editorConfig: {
                xtype: 'ehr-snomedcombo',
                defaultSubset: 'All'
            },
            category: {
                defaultValue: 'Standard'
            }
        }
    }
});