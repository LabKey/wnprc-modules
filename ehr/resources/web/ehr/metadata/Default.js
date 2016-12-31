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
EHR.Metadata.registerMetadata('Default', {
    allQueries: {
        fieldDefaults: {
            //lazyCreateStore: false,
            ignoreColWidths: true
//            colModel: {
//                showLink: false
//            }
        },
        Id: {
            xtype: 'ehr-participant',
            dataIndex: 'Id',
            nullable: false,
            allowBlank: false,
            lookups: false,
            colModel: {
                width: 65
                ,showLink: false
            }
            //noDuplicateByDefault: true
        },
        'id/curlocation/location': {
            hidden: true,
            updateValueFromServer: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Location',
            header: 'Location',
            lookups: false,
            allowDuplicateValue: false,
            colModel: {
                width: 75,
                showLink: false
            }
        }
        ,'id/numroommates/cagemates': {
            hidden: true,
            updateValueFromServer: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Animals In Cage',
            header: 'Animals In Cage',
            lookups: false,
            allowDuplicateValue: false,
            colModel: {
                width: 120,
                showLink: false
            }
        }
        ,daterequested: {
            xtype: 'xdatetime',
            noDuplicateByDefault: true,
            extFormat: 'Y-m-d H:i'
        }
        ,date: {
            allowBlank: false,
            nullable: false,
            //noDuplicateByDefault: true,
            extFormat: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                otherToNow: true,
                timeFormat: 'H:i',
                plugins: ['ehr-participantfield-events']
            },
            xtype: 'xdatetime',
            colModel: {
                fixed: true,
                width: 130
            },
            setInitialValue: function(v, rec)
            {
                return v ? v : new Date()
            }
        }
        ,room: {
            editorConfig: {listWidth: 200}
        }
        ,testid: {
            colModel: {
                showLink: false
            }
        }
        ,begindate: {
            xtype: 'xdatetime',
            hidden: true,
            noSaveInTemplateByDefault: true,
            extFormat: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            },
            colModel: {
                fixed: true,
                width: 130
            }
        }
        ,restraint: {
            shownInGrid: false,
            editorConfig: {
                listeners: {
                    change: function(field, val){
                        var theForm = this.ownerCt.getForm();
                        if(theForm){
                            var restraintDuration = theForm.findField('restraintDuration');

                            if(val)
                                restraintDuration.setValue('<30 min');
                            else
                                restraintDuration.setValue(null);

                            restraintDuration.fireEvent('change', restraintDuration.getValue())
                        }
                    }
                }
            }
        }
        ,restraintDuration: {
            shownInGrid: false
            ,lookup: {
                sort: 'sort_order'
            }
        }
        ,enddate: {
            xtype: 'xdatetime',
            shownInInsertView: true,
            colModel: {
                fixed: true,
                width: 130
            },
            extFormat: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            }
        }
        ,cage: {
            editorConfig: {
                listeners: {
                    change: function(field, val){
                        if(val && !isNaN(val)){
                            var newVal = EHR.Utils.padDigits(val, 4);
                            if(val != newVal)
                                field.setValue(newVal);
                        }
                    }
                }
            }
        }
        ,code: {
            xtype: 'ehr-snomedcombo'
            //,lookups: false
            ,colModel: {
                width: 150
                ,showLink: false
            }
//            ,getRenderer: function(col, meta){
//                return function(data, cellMetaData, record, rowIndex, colIndex, store) {
//                    var storeId = ['ehr_lookups', 'snomed', 'code', 'meaning', store.queryName, (meta.dataIndex || meta.name)].join('||');
//                    var lookupStore = Ext.StoreMgr.get(storeId);
//
//                    if(!lookupStore)
//                        return '';
//
//                    var idx = lookupStore.find('code', data);
//                    var lookupRecord;
//                    if(idx != -1)
//                        lookupRecord = lookupStore.getAt(idx);
//
//                    if (lookupRecord)
//                        return lookupRecord.data['meaning'] || lookupRecord.data['code/meaning'];
//                    else if (data)
//                        return "[" + data + "]";
//                    else
//                        return meta.lookupNullCaption || "[none]";
//                }
//            }
        }
        ,tissue: {
            xtype: 'ehr-snomedcombo',
            editorConfig: {
                defaultSubset: 'Organ/Tissue'
            },
            colModel: {
                width: 150,
                showLink: false
            }
        }
        ,performedby: {
            colModel: {
                width: 65
            }
            ,shownInGrid: false
        }
        ,userid: {
            lookup: {
                schemaName: 'core',
                queryName: 'users',
                displayColumn: 'name',
                keyColumn: 'name',
                sort: 'Email'
            }
            ,formEditorConfig:{readOnly: true}
            ,editorConfig: {listWidth: 200}
            ,defaultValue: LABKEY.Security.currentUser.displayName
            ,shownInGrid: false
        }
        ,CreatedBy: {
            hidden: false
            ,shownInInsertView: true
            ,xtype: 'displayfield'
            ,shownInGrid: false
        }
        ,ModifiedBy: {
            hidden: false
            ,shownInInsertView: true
            ,xtype: 'displayfield'
            ,shownInGrid: false
        }
        ,AnimalVisit: {hidden: true}
        //,CreatedBy: {hidden: true, shownInGrid: false}
        //,ModifiedBy: {hidden: true, shownInGrid: false, useNull: true}
        ,SequenceNum: {hidden: true}
        ,description: {hidden: true}
        ,Dataset: {hidden: true}
        //,category: {hidden: true}
        ,QCState: {
            allowBlank: false,
            noDuplicateByDefault: true,
            allowDuplicateValue: false,
            noSaveInTemplateByDefault: true,
            setInitialValue: function(v){
                var qc;
                if(!v && EHR.Security.getQCStateByLabel('In Progress'))
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
            colModel: {
                width: 70
            }
        }
        ,parentid: {
            hidden: true,
            lookups: false
        }
        ,taskid: {
            lookups: false,
            hidden: true
        }
        ,requestid: {
            lookups: false,
            hidden: true
        }
        ,AgeAtTime: {hidden: true}
        ,Notes: {hidden: true}
        ,DateOnly: {hidden: true}
        ,Survivorship: {hidden: true}
        ,remark: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,so: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,a: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,p: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,project: {
            xtype: 'ehr-project'
            ,editorConfig: {
                defaultProjects: [300901,400901]
            }
            ,shownInGrid: false
            ,useNull: true
            ,lookup: {
                columns: 'project,account',
                displayColumn: 'project'
            }
        }
        ,account: {
            shownInGrid: false
        }
    },
    byQuery: {
        tasks: {
            taskid: {
                setInitialValue: function(v, rec)
                {
                    v = v || this.importPanel.formUUID || LABKEY.Utils.generateUUID();
                    this.importPanel.formUUID = v;
                    this.formUUID = v;
                    return v;
                },
                parentConfig: false,
                hidden: true
            },
            //NOTE: the case is different on hard tables than studies.
            //i tried to force hard tables to use QCState, but they kept reverting in odd places
            qcstate: {
                allowBlank: false,
                allowDuplicateValue: false,
                setInitialValue: function(v){
                    var qc;
                    if(EHR.Security.getQCStateByLabel('In Progress'))
                        qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                    return v || qc;
                },
                shownInGrid: false,
                parentConfig: false,
                hidden: false,
                editorConfig: {
                    disabled: true,
                    editorConfig: {listWidth: 200}
                }
            },
            assignedto: {
                useNull: true,
                setInitialValue: function(val){
                    return val || LABKEY.Security.currentUser.id
                },
                lookup: {
                    sort: 'type,displayname'
                },
                editorConfig: {listWidth: 200}
            },
            duedate: {
                xtype: 'xdatetime',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                },
                setInitialValue: function(val){
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
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            title: {
                setInitialValue: function(val, rec){
                    return val || this.importPanel.title || this.importPanel.formType;
                }
            }
        },
        'Final Reports': {
            remark: {
                height: 400,
                width: 600
            }
        },
        requests: {
            requestid: {
                setInitialValue: function(v, rec)
                {
                    v = v || this.importPanel.formUUID || LABKEY.Utils.generateUUID();
                    this.importPanel.formUUID = v;
                    this.formUUID = v;
                    return v;
                },
                parentConfig: false,
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
            formtype: {
                xtype: 'displayfield',
                hidden: true,
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            title: {
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            //NOTE: the case is different on hard tables than studies.
            //i tried to force hard tables to use QCState, but they kept reverting in odd places
            qcstate: {
                allowBlank: false,
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                        qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                    return v || qc;
                },
                shownInGrid: false,
                parentConfig: false,
                hidden: false,
                editorConfig: {
                    disabled: true
                }
            }
        },
        'Bacteriology Results': {
            source: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Culture Source'
                }
            },
//            result: {
//                xtype: 'ehr-snomedcombo',
//                editorConfig: {
//                    defaultSubset: 'Bacteriology Results'
//                }
//            },
            organism: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Organisms'
                }
            },
            antibiotic: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Antibiotic'
                }
            },
            sensitivity: {
                shownInGrid: false
            },
            result: {
                shownInGrid: false
            },
            units: {
                shownInGrid: false
            },
            date: {
                xtype: 'datefield'
                ,extFormat: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            }
        },
        Demographics: {
            Id: {
//                xtype: 'trigger'
                allowBlank: false
                ,editorConfig: {
//                    triggerClass: 'x-form-search-trigger',
                    allowAnyId: true
//                    ,onTriggerClick: function (){
//                        var prefix = this.getValue();
//
//                        if(!prefix){
//                            Ext.Msg.alert('Error', "Must enter prefix");
//                            return
//                        }
//                        var sql = "SELECT max(cast(regexp_replace(SUBSTRING(Id, "+(prefix.length+1)+", 6), '[a-z\-]+', '') as integer)) as maxNumber FROM study.Demographics WHERE Id LIKE '" + prefix + "%' AND lcase(SUBSTRING(Id, "+(prefix.length+1)+", 6)) = ucase(SUBSTRING(Id, "+(prefix.length+1)+", 6))";
//
//                        LABKEY.Query.executeSql({
//                            schemaName: 'study',
//                            sql: sql,
//                            scope: this,
//                            success: function(data){
//                                var number;
//                                if(data.rows && data.rows.length==1){
//                                    number = Number(data.rows[0].maxNumber)+1;
//                                }
//                                else {
//                                    console.log('no mstching IDs found');
//                                    number = 1;
//                                }
//
//                                number = EHR.Utils.padDigits(number, (6-prefix.length));
//                                var id = prefix + number;
//                                this.setValue(id.toLowerCase());
//                            },
//                            failure: EHR.Utils.onError
//                        });
//                    }
                }
            },
            project: {hidden: true},
            performedby: {hidden: true},
            account: {hidden: true},
            species: {allowBlank: false},
            gender: {allowBlank: false}
        },
        'Prenatal Deaths': {
            conception: {
                extFormat: 'Y-m-d'
            }
            ,weight: {
                useNull: true
                ,editorConfig: {
                    allowNegative: false
                    ,decimalPrecision: 4
                }
            }
            ,Id: {
                xtype: 'trigger',
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        var prefix = 'pd';
                        var year = new Date().getFullYear().toString().slice(2);
                        var sql = "SELECT cast(SUBSTRING(MAX(id), 5, 6) AS INTEGER) as num FROM study.prenatal WHERE Id LIKE '" + prefix + year + "%'";
                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sql,
                            scope: this,
                            success: function(data){
                                var caseno;
                                if(data.rows && data.rows.length==1){
                                    caseno = data.rows[0].num;
                                    caseno++;
                                }
                                else {
                                    //console.log('no existing IDs found');
                                    caseno = 1;
                                }

                                caseno = EHR.Utils.padDigits(caseno, 2);
                                var val = prefix + year + caseno;
                                this.setValue(val);
                                this.fireEvent('change', val)
                            },
                            failure: EHR.Utils.onError
                        });
                    }
                    ,allowAnyId: true
                }
            }
            ,sire: {lookups: false}
            ,dam: {
                lookups: false
                ,allowBlank: false
            }
            ,project: {hidden: true}
            ,performedby: {hidden: true}
            ,account: {hidden: true}
            ,room: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        'Parasitology Results': {
            organism: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Parasitology Results'
                }
            }
            ,date: {
                xtype: 'datefield'
                ,extFormat: 'Y-m-d'
            }
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Tissue Samples': {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            performedby: {
                hidden: true
            },
            preservation: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                shownInGrid: false
            },
            quantity: {
                shownInGrid: false
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
                    plugins: ['ehr-usereditablecombo']
                },
                shownInGrid: false
            },
            recipient: {
                shownInGrid: false
            },
            trimdate: {
                shownInGrid: false
            },
            trim_remarks: {
                shownInGrid: false
            },
            trimmed_by: {
                shownInGrid: false
            },
            remark: {
                hidden: true

            },

            container_type: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                shownInGrid: false
            }
        },
        Histology: {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            slideNum: {
//                setInitialValue: function(v, rec){
//                    var idx = Ext.StoreMgr.get('study||Histology||||').getCount()+1;
//                    return v || idx;
//                }
            },
            performedby: {
                hidden: true
            },
            stain: {
                defaultValue: 'Hematoxylin & Eosin',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            pathologist: {
                shownInGrid: false
            },
            pathology: {
                shownInGrid: false
            },
            trimdate: {
                shownInGrid: false
            },
            trim_remark: {
                shownInGrid: false
            },
            trimmed_by: {
                shownInGrid: false
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        Housing: {
            date: {
                editorConfig: {
                    allowNegative: false
//                    ,listeners: {
//                        change: function(field, val){
//                            var form = this.ownerCt.getForm();
//                            var rec = this.ownerCt.boundRecord;
//                            if(rec && rec.store){
//
//                            }
//                        }
//                    }
                }
            }
            ,objectid: { setInitialValue: function (v, rec){
                return v || LABKEY.Utils.generateUUID();
            },
                parentConfig:false,
                hidden :true
            }
            ,enddate: {
                //hidden: true
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                shownInGrid: true
            }
            ,remark: {
                shownInGrid: false
            }
            ,performedby: {
                shownInGrid: false
                //,allowBlank: false
            }
            ,cage: {
                allowBlank: false
            }
            ,cond: {
                allowBlank: false
                ,shownInGrid: false
                ,lookup:{ schemaName: 'ehr_lookups', queryName: 'housing_condition_codes', displayColumn: 'value', keyColumn: 'value'}
            }
            ,reason: {
                shownInGrid: false
            }
            ,restraintType: {
                shownInGrid: false
            }
            ,cagesJoined: {
                shownInGrid: false
            }
            ,isTemp: {
                shownInGrid: false
            }
            ,project: {
                hidden: true
            }
            ,room: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        'Clinical Encounters': {
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
            ,serviceRequested: {
                xtype: 'displayfield'
                ,editorConfig: {
                    height: 100
                }
            }
            ,performedby: {
                allowBlank: false
            }
            ,type: {
                allowBlank: false
            }
        },
        'Clinical Remarks': {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            remark: {
                hidden: true
            },
            date: {
                setInitialValue: function(v, rec)
                {
                    return v ? v : (new Date((new Date().toDateString())));
                }
                ,noDuplicateByDefault: false
            },
            account: {
                hidden: true
            },
            so: {
                shownInGrid: false,
                //width: 300,
                height: 150
            },
            a: {
                shownInGrid: false,
                height: 150
            },
            p: {
                shownInGrid: false,
                height: 150
            }
//            userid: {
//                defaultValue: LABKEY.Security.currentUser.displayName
//            }

        },
        'Clinpath Runs': {
            date: {
                xtype: 'xdatetime',
                //xtype: 'datefield',
                extFormat: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
                //extFormat: 'Y-m-d'
            },
            collectionMethod : {
                shownInGrid: false
            },
            sampleType : {
                //shownInGrid: false
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            sampleId : {shownInGrid: false},
            sampleQuantity: {shownInGrid: false},
            quantityUnits : {shownInGrid: false},
            servicerequested: {
                allowBlank: false,
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            theForm.findField('type').setValue(rec.get('dataset'));
                        }
                    }
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'filtered_labwork_services',
                    displayColumn: 'servicename',
                    keyColumn: 'servicename',
                    sort: 'servicename',
                    columns: '*'
                }
            },
            project: {
                allowBlank: true,
                nullable: true
            },
            account: {
                allowBlank: false
            },
            source: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Organisms'
                }
            },
            type: {
                showInGrid: false,
                updateValueFromServer: true,
                xtype: 'displayfield'
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        'Dental Status': {
            gingivitis: {allowBlank: false, includeNullRecord: false},
            tartar: {allowBlank: false, includeNullRecord: false},
            performedby: {
                hidden: true
            }
        },
        'Treatment Orders': {
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d',
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                },
                colModel: {
                    //fixed: true,
                    width: 100
                },
                shownInGrid: true
            }
            ,enddate: {
                xtype: 'datefield',
                extFormat: 'Y-m-d',
                colModel: {
                    //fixed: true,
                    width: 100
                }
                //shownInGrid: false
            }
            ,project: {
                allowBlank: false
            }
            ,CurrentRoom: {lookups: false}
            ,CurrentCage: {lookups: false}
            ,volume: {
                compositeField: 'Volume',
                xtype: 'ehr-triggernumberfield',
                noDuplicateByDefault: true,
                noSaveInTemplateByDefault: true,
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        //recalculate amount if needed:
                        var theForm = this.findParentByType('ehr-formpanel').getForm();
                        var conc = theForm.findField('concentration').getValue();
                        var val = this.getValue();

                        if(!val || !conc){
                            alert('Must supply volume and concentration');
                            return;
                        }

                        if(val && conc){
                            var amount = conc * val;
                            var amountField = theForm.findField('amount');
                            amountField.setValue(amount);
                            amountField.fireEvent('change', amount, amountField.startValue);
                        }
                    }
                    ,decimalPrecision: 3
                },
                header: 'Vol',
                colModel: {
                    width: 50
                }
            }
            ,vol_units: {
                compositeField: 'Volume',
//                editorConfig: {
//                    fieldLabel: null
//                }
                header: 'Vol Units',
                colModel: {
                    width: 50
                }
            }
            ,concentration: {
                shownInGrid: false,
                compositeField: 'Drug Conc',
                editorConfig: {
                    decimalPrecision: 10
                }
            }
            ,conc_units: {
                shownInGrid: false
                ,lookup: {columns: '*'}
                ,compositeField: 'Drug Conc'
                ,editorConfig: {
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            theForm.findField('amount_units').setValue(rec.get('numerator'));
                            theForm.findField('conc_units').setValue(rec.get('unit'));
                            theForm.findField('vol_units').setValue(rec.get('denominator'));

                            var doseField = theForm.findField('dosage_units');
                            if(rec.get('numerator'))
                                doseField.setValue(rec.get('numerator')+'/kg');
                            else
                                doseField.setValue('');

                            doseField.fireEvent('change', doseField.getValue(), doseField.startValue);

                        }
                    }
                }
            }
            ,amount: {
                compositeField: 'Amount'
                ,noDuplicateByDefault: true
                ,noSaveInTemplateByDefault: true
                //,allowBlank: false
                ,shownInGrid: false
                ,colModel: {
                    width: 40
                }
                ,editorConfig: {
                    decimalPrecision: 3
                }
            }
            ,amount_units: {
                shownInGrid: false
                ,compositeField: 'Amount'
                ,colModel: {
                    width: 70
                }
            }
            ,route: {shownInGrid: false}
            ,frequency: {
                allowBlank: false
                ,lookup: {
                    sort: 'sort_order'
                    ,columns: '*'

                }
            }
            ,dosage: {
                xtype: 'ehr-drugdosefield',
                shownInGrid: false,
                compositeField: 'Dosage',
                editorConfig: {
                    decimalPrecision: 3
                }
            }
            ,dosage_units: {
                shownInGrid: false,
                compositeField: 'Dosage'
            }
            ,code: {
                //shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            }
            ,qualifier: {
                shownInGrid: false
            }
            ,meaning: {
                shownInGrid: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'treatment_codes',
                    displayColumn: 'meaning',
                    keyColumn: 'meaning',
                    sort: 'category,meaning',
                    columns: '*'
                }
                ,editorConfig: {
                    tpl : function()
                    {
                        var tpl = new Ext.XTemplate(
                                '<tpl for=".">' +
                                        '<div class="x-combo-list-item">{[ values["category"] ? "<b>"+values["category"]+":</b> "  : "" ]}{[ values["meaning"] ]}' +
                                        '&nbsp;</div></tpl>'
                        );
                        return tpl.compile()
                    }(),
                    listeners: {
                        select: function(combo, rec){
                            var theForm = this.findParentByType('ehr-formpanel').getForm();

                            theForm.findField('route').setValue(rec.get('route'));
                            theForm.findField('qualifier').setValue(rec.get('qualifier'));
                            theForm.findField('code').setValue(rec.get('code'));
                            theForm.findField('frequency').setValue(rec.get('frequency'));

                            theForm.findField('amount_units').setValue(rec.get('amount_units'));
                            theForm.findField('conc_units').setValue(rec.get('conc_units'));
                            theForm.findField('vol_units').setValue(rec.get('vol_units'));
                            theForm.findField('dosage_units').setValue(rec.get('dosage_units'));

                            theForm.findField('amount').setValue(rec.get('amount'));
                            theForm.findField('concentration').setValue(rec.get('concentration'));
                            theForm.findField('volume').setValue(rec.get('volume'));

                            var doseField = theForm.findField('dosage');
                            doseField.setValue(rec.get('dosage'));
                            doseField.fireEvent('change', doseField.getValue(), doseField.startValue);
                        }
                    }
                }
            }
            ,remark: {
                shownInGrid: false
            }
            ,performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            }
        },
        Project: {
            project: {
                xtype: 'textfield',
                lookups: false
            }
        },
        Assignment: {
            project: {
                shownInGrid: true,
                allowBlank: false,
                xtype: 'combo',
                lookup: {
                    filterArray: [LABKEY.Filter.create('protocol/protocol', null, LABKEY.Filter.Types.NONBLANK)],
                    columns: 'project,protocol,account',
                    displayColumn: 'project'

                },
                editorConfig: {
                    plugins: ['ehr-participantfield-events']
                }
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
        Necropsies: {
            remark: {
                height: 200,
                width: 600
            },
//            perfusion_soln1: {
////                xtype: 'lovcombo',
//                editorConfig: {
//                    plugins: ['ehr-usereditablecombo']
//                },
//                lookup: {
//                    schemaName: 'ehr_lookups',
//                    queryName: 'necropsy_perfusion',
//                    keyColumn: 'perfusion',
//                    displayColumn: 'perfusion'
//                }
//            },
//            perfusion_soln2: {
////                xtype: 'lovcombo',
//                editorConfig: {
//                    plugins: ['ehr-usereditablecombo']
//                },
//                lookup: {
//                    schemaName: 'ehr_lookups',
//                    queryName: 'necropsy_perfusion',
//                    keyColumn: 'perfusion',
//                    displayColumn: 'perfusion'
//                }
//            },
//            perfusion_time1: {
//                xtype: 'xdatetime',
//                extFormat: 'Y-m-d H:i',
//                editorConfig: {
//                    dateFormat: 'Y-m-d',
//                    timeFormat: 'H:i'
//                }
//            },
//            perfusion_time2: {
//                xtype: 'xdatetime',
//                extFormat: 'Y-m-d H:i',
//                editorConfig: {
//                    dateFormat: 'Y-m-d',
//                    timeFormat: 'H:i'
//                }
//            },
            timeofdeath: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                allowBlank: false,
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            tissue_distribution: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'tissue_distribution',
                    displayColumn: 'value',
                    keyColumn: 'value'
                }
            },
            grossdescription: {
                height: 200,
                width: 600,
                defaultValue: 'A ___ kg rhesus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg cynomolgus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg common marmoset is presented for necropsy in excellent post mortem condition.\n\nA ____ kg cynomolgus macaque is presented for perfusion and necropsy in excellent post mortem condition.\n\nA ____ kg rhesus macaque is presented for perfusion and necropsy in excellent post mortem condition.'
            },
            histologicalDescription: {
                height: 200,
                width: 600
            },
            patho_notes: {
                height: 200,
                width: 600
            },
            caseno: {
                xtype: 'trigger'
                ,allowBlank: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var theWin = new Ext.Window({
                            layout: 'form'
                            ,title: 'Case Number'
                            ,bodyBorder: true
                            ,border: true
                            ,theField: this
                            //,frame: true
                            ,bodyStyle: 'padding:5px'
                            ,width: 350
                            ,defaults: {
                                width: 200,
                                border: false,
                                bodyBorder: false
                            }
                            ,items: [
                                {
                                    xtype: 'textfield',
                                    ref: 'prefix',
                                    fieldLabel: 'Prefix',
                                    allowBlank: false,
                                    value: 'c'
                                },{
                                    xtype: 'numberfield',
                                    ref: 'year',
                                    fieldLabel: 'Year',
                                    allowBlank: false,
                                    value: (new Date()).getFullYear()
                                }
                            ],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                ref: '../submit',
                                //scope: this,
                                handler: function(p){
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },{
                                text: 'Close',
                                //scope: this,
                                handler: function(){
                                    this.ownerCt.ownerCt.hide();
                                }
                            }]
                        });
                        theWin.show();

                        function getCaseNo(panel){
                            var year = panel.year.getValue();
                            var prefix = panel.prefix.getValue();

                            if(!year || !prefix){
                                Ext.Msg.alert('Error', "Must supply both year and prefix");
                                return
                            }

                            LABKEY.Query.executeSql({
                                schemaName: 'study',
                                sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study.Necropsies WHERE caseno LIKE '" + year + prefix + "%'",
                                scope: this,
                                success: function(data){
                                    var caseno;
                                    if(data.rows && data.rows.length==1){
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
            },
            /*contact_person: {
             lookup: {
             schemaName: 'ehr_lookups',
             queryName: 'PrincipalInvestigators',
             displayColumn: 'UserId',
             keyColumn: 'UserId'
             }
             },*/
            performedby: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            assistant: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            },
            causeofdeath: {
                allowBlank: false
            }
        },
        Biopsies: {
            remark: {
                height: 200,
                width: 600
            },
            grossdescription: {
                height: 200,
                width: 600
            },
            histologicalDescription: {
                height: 200,
                width: 600
            },
            patho_notes: {
                height: 200,
                width: 600
            },
            caseno: {
                xtype: 'trigger'
                ,allowBlank: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var theWin = new Ext.Window({
                            layout: 'form'
                            ,title: 'Case Number'
                            ,bodyBorder: true
                            ,border: true
                            ,theField: this
                            //,frame: true
                            ,bodyStyle: 'padding:5px'
                            ,width: 350
                            ,defaults: {
                                width: 200,
                                border: false,
                                bodyBorder: false
                            }
                            ,items: [
                                {
                                    xtype: 'textfield',
                                    ref: 'prefix',
                                    fieldLabel: 'Prefix',
                                    allowBlank: false,
                                    value: 'b'
                                },{
                                    xtype: 'numberfield',
                                    ref: 'year',
                                    fieldLabel: 'Year',
                                    allowBlank: false,
                                    value: (new Date()).getFullYear()
                                }
                            ],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                ref: '../submit',
                                //scope: this,
                                handler: function(p){
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },{
                                text: 'Close',
                                //scope: this,
                                handler: function(){
                                    this.ownerCt.ownerCt.hide();
                                }
                            }]
                        });
                        theWin.show();

                        function getCaseNo(panel){
                            var year = panel.year.getValue();
                            var prefix = panel.prefix.getValue();

                            if(!year || !prefix){
                                Ext.Msg.alert('Error', "Must supply both year and prefix");
                                return
                            }

                            LABKEY.Query.executeSql({
                                schemaName: 'study',
                                sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study.biopsies WHERE caseno LIKE '" + year + prefix + "%'",
                                scope: this,
                                success: function(data){
                                    var caseno;
                                    if(data.rows && data.rows.length==1){
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
            },
            performedby: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        'Morphologic Diagnosis': {
            duration: {
                xtype: 'lovcombo',
                shownInGrid: false,
                hasOwnTpl: true,
                lookup: {
                    schemaName:'ehr_lookups',
                    queryName:'durationSnomed',
                    displayColumn:'durationVal',
                    keyColumn:'durationVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }
            },
            severity: {
                xtype: 'lovcombo',
                shownInGrid: false,
                hasOwnTpl: true,
                lookup: {
                    schemaName:'ehr_lookups',
                    queryName:'severitySnomed',
                    displayColumn:'severityVal',
                    keyColumn:'severityVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }
            },
            etiology: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                includeNullRecord: false,
                shownInGrid: false,
                lookup: {
                    schemaName:'ehr_lookups',
                    queryName: 'etiologySnomed',
                    displayColumn:'etiologyVal',
                    keyColumn:'etiologyVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }

            },
            distribution2: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Distribution'
                }
            },
            inflammation: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                shownInGrid: false,
                lookup: {
                    schemaName:'ehr_lookups',
                    queryName: 'inflammationSnomed',
                    displayColumn:'inflammationVal',
                    keyColumn:'inflammationVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }
            },
            inflammation2: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Inflammation'
                }
            },
            distribution: {
                xtype: 'lovcombo',
                shownInGrid: false,
                hasOwnTpl: true,
                lookup : {
                    schemaName:'ehr_lookups',
                    queryName:'distributionSnomed',
                    displayColumn:'distributionVal',
                    keyColumn:'distributionVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }
            },
            process: {
                xtype: 'lovcombo',
                shownInGrid: false,
                hasOwnTpl: true,
                lookup : {
                    schemaName:'ehr_lookups',
                    queryName: 'processSnomed',
                    displayColumn:'processVal',
                    keyColumn:'processVal'
                },
                editorConfig: {
                    tpl:null,
                    separator: '!'
                }
            },
            process2: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Process/Disorder'
                }
            },
            performedby: {
                hidden: true
            },
            remark: {
                shownInGrid: true
            },
            tissue_qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        'Organ Weights': {
            performedby: {
                hidden: true
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            weight: {
                allowBlank: false,
                editorConfig: {
                    decimalPrecision: 3
                }
            }
        },
        'Body Condition': {
            performedby: {hidden: true},
            weightStatus: {
                xtype: 'ehr-booleancombo',
                defaultValue: false
//                setInitialValue: function(v){
//                    return v || false;
//                }
            },
            score:{lookup:{ schemaName: 'ehr_lookups', queryName: 'bcs_score', displayColumn: 'value', keyColumn: 'value'}}
        },
        Alopecia: {
            head: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            dorsum: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            rump: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            shoulders: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            upperArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            lowerArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            hips: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            upperLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            lowerLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            other: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            score: {lookupNullCaption: '', useNull: true, editorConfig: {useNull: true}},
            performedby: {hidden: true}
        },
        Restraint: {
//            enddate: {
//                hidden: true
//            },
            type: {
                formEditorConfig: {xtype: 'ehr-remoteradiogroup', columns: 2},
                defaultValue: ''
            }
        },
        cage_observations: {
            date: {
                parentConfig: false,
                hidden: false,
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                }
            },
            remark: {
                allowBlank: true,
                formEditorConfig: {
                    storeCfg: {
                        schemaName: 'ehr_lookups',
                        queryName: 'obs_remarks',
                        valueField: 'description',
                        displayField: 'value'
                    }
                }
            },
            feces: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_feces', displayColumn: 'title', keyColumn: 'value'}
            },
            no_observations: {
                shownInGrid: false,
                formEditorConfig: {
                    listeners: {
                        check: function(field, val){
                            var theForm = this.ownerCt.getForm();
                            if(theForm){
                                var rfield = theForm.findField('remark');

                                if(val)
                                    rfield.setValue('ok');
                                else if (rfield.getValue()=='ok')
                                    rfield.setValue('');

                                theForm.findField('feces').setValue();
                            }
                        }
                    }
                }
            }
        },
        Charges: {
            type: {
                includeNullRecord: false,
                allowBlank: false,
                lookup: {
                    columns: 'category,description,cost',
                    sort: 'category,description',
                    displayColumn: 'description'
                },
                editorConfig: {
                    tpl : function()
                    {
                        var tpl = new Ext.XTemplate(
                                '<tpl for=".">' +
                                        '<div class="x-combo-list-item">{[ values["category"] ? "<b>"+values["category"]+":</b> "  : "" ]}{[ values["description"] ]}' +
                                        '&nbsp;</div></tpl>'
                        );
                        return tpl.compile()
                    }(),
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.ownerCt.getForm();
                            if(theForm){
                                theForm.findField('unitCost').setValue(rec.get('cost'));
                            }
                        }
                    }
                }

            },
            unitCost: {
                xtype: 'displayfield'
            },
            quantity: {
                allowBlank: false,
                defaultValue: 1
            },
            performedby: {
                hidden: true
            },
            remark: {
                shownInGrid: false
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            }
        },
        'Chemistry Results': {
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
            }
            ,result: {
                compositeField: 'Result',
                editorConfig: {
                    decimalPrecision: 4
                }
            }
            ,testid: {
                lookup: {
                    columns: '*',
                    displayColumn: 'testid',
                    filterArray: [LABKEY.Filter.create('categories', 'chemistry', LABKEY.Filter.Types.CONTAINS)]

                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                   /* listeners: {
                      click: function(){
                          console.log ('testing chemitry date');
                      }
                    }*/
                }
                //setValue: null
                //defaultValue: 1
                //,extFormat: 'Y-m-d'
            }
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Cytology Automated Evaluation': {
            sampleType: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_sampletype',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']

                }
            },
            collectionMethod: {
                lookup : {
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_collection_method',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']
                }
            },
            testid: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    query_Name: 'cytology_tests',
                    keyColumn: 'testid',
                    displayColumn: 'testid',
                    unitColumn: 'units'

                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-panel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            remark: {
                shownInGrid: false
            }
        },
        'Cytology Manual Evaluation': {

            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            },
            sampleType: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_sampletype',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']

                }
            },
            collectionMethod: {
                lookup : {
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_collection_method',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']
                }
            },
            sampleAppearance: {
                showInGrid: false
            },
            stainType: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'stain_types',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']
                }
            },
            slidesMade: {
                showInGrid: false
            },
            slidesSubmitted: {
                showInGrid: false
            },
            results: {
                showInGrid: false
            }

        },
        'Immunology Results': {
            testid: {
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'immunology', LABKEY.Filter.Types.CONTAINS)]
                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,extFormat: 'Y-m-d'
            }
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Hematology Results': {
            testid: {
                lookup: {
                    columns: '*',
                    displayColumn: 'testid',
                    filterArray: [LABKEY.Filter.create('categories', 'hematology', LABKEY.Filter.Types.CONTAINS)]
                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i',
                    defaultValue: '00:00'
                }
                //defaultValue: null
                //,extFormat: 'Y-m-d'
            }
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Urinalysis Results': {
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
            }
            ,result: {
                compositeField: 'Result'
                ,editorConfig: {
                    decimalPrecision: 4
                }
            }
            ,testid: {
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'urinalysis', LABKEY.Filter.Types.CONTAINS)],
                    displayColumn: 'testid',
                    keyColumn: 'testid'
                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,extFormat: 'Y-m-d'
            }
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Virology Results': {
            date: {
                xtype: 'datefield'
                ,extFormat: 'Y-m-d'
            },
            virus: {
                lookup: {schemaName: 'ehr_lookups', queryName: 'virology_tests', displayColumn: 'testid', keyColumn: 'testid'}
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            }
        },
        'Hematology Morphology': {
            date: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                  //  defaultValue: '00:00'
                }
                //xtype: 'datefield'
                //,extFormat: 'Y-m-d'
            }
        },
        'Irregular Observations': {
            RoomAtTime: {hidden: true}
            ,date: {
                editorConfig: {
                    minValue: new Date(),
                    dateConfig: {
                        minValue: new Date()
                    }
                }
            }
            ,CageAtTime: {
                hidden: true,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.Utils.padDigits(val, 4);
                                if(val != newVal)
                                    field.setValue(newVal);
                            }
                        }
                    }
                }
            }
            ,feces: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_feces', displayColumn: 'title', keyColumn: 'value'}
            }
            ,menses: {
                shownInGrid: true,
                xtype: 'ehr-remoteradiogroup',
                defaultValue: null,
                value: null,
                includeNullRecord: true,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_mens', displayColumn: 'title', keyColumn: 'value'}
            }
            ,other: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_other', displayColumn: 'title', keyColumn: 'value'}
            }
            ,tlocation: {
                shownInGrid: false,
                xtype: 'lovcombo',
                hasOwnTpl: true,
                includeNullRecord: false,
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_tlocation', displayColumn: 'value', keyColumn: 'value', sort: 'sort_order'},
                editorConfig: {
                    tpl: null
//                    height: 200
                }
            }
            ,breeding: {
                shownInGrid: false,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_breeding', displayColumn: 'title', keyColumn: 'value'}
            }
            ,project: {hidden: true}
            ,account: {hidden: true}
            ,performedby: {
                allowBlank: true,
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            }
            ,remark: {
                shownInGrid: false,
                formEditorConfig: {
                    storeCfg: {
                        schemaName: 'ehr_lookups',
                        queryName: 'obs_remarks',
                        valueField: 'description',
                        displayField: 'value'
                    }
                }
            }
            ,behavior: {
                shownInGrid: false,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_behavior', displayColumn: 'title', keyColumn: 'value'}
            }
            ,otherbehavior: {shownInGrid: false}
//            ,certified: {
//                xtype: 'ehr-approveradio',
//                isAutoExpandColumn: true,
//                colModel: {
//                    width: 30
//                },
//                //we allow either true or null, so it works with client-side 'allowBlank'
//                convert: function(v){
//                    return (v===true ? true : null);
//                },
//                allowDuplicateValue: false
//            }
        },
//        'Clinpath Requests': {
//            dateCompleted: {hidden: true}
//            ,status: {hidden: true}
//            ,requestor: {defaultValue: LABKEY.Security.currentUser.email}
//            ,notify1: {shownInGrid: false}
//            ,notify2: {shownInGrid: false}
//
//        },
        Menses: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            interval: {hidden: true}
        },
        'Pair Tests': {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        'Behavior Remarks': {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {hidden: true},
            account: {hidden: true},
            remark: {
                hidden: true
            },
            so: {
                shownInGrid: false
            },
            a: {
                shownInGrid: false
            },
            p: {
                shownInGrid: false
            }
    /*        behatype :{
                xtype: 'ehr-behaviorcombo',
                editorConfig: {
                    defaultSubset: 'SIB'
                },
                colModel: {
                    width: 150,
                    showLink: false
                }

            }*/
            /*category : {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'behavior_category',
                    keyColumn: 'value',
                    displayColumn: 'value'
                },
                editorConfig: {
                    tpl: null,
                    plugins: ['ehr-usereditablecombo']
                }
            }*/
        },
        Arrival: {
            Id: {
                editorConfig: {allowAnyId: true}
            },
            project: {hidden: true},
            account: {hidden: true},
            source: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                allowBlank: false
            },
            performedby: {hidden: true},
            remark: {shownInGrid: false},
            dam: {shownInGrid: false},
            sire: {shownInGrid: false},
            initialRoom: {
                hidden: false,
                allowBlank: false
            },
            initialCage: {
                hidden: false,
                allowBlank: false,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.Utils.padDigits(val, 4);
                                if(val != newVal)
                                    field.setValue(newVal);
                            }
                        }
                    }
                }
            },
            initialCond: {hidden: false}
        },
        Departure: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            authorized_by: {allowBlank: false},
            destination: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                allowBlank: false
            }
        },
        Vitals: {
            performedby: {hidden: true}
        },
        Teeth: {
            performedby: {hidden: true},
            tooth: {
                lookup: {
                    columns: '*',
                    sort: 'sort_order'
                }
            }
        },
        Deaths: {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {
                hidden: false,
                allowBlank: false
            },
            account: {hidden: true},
            necropsy: {lookups: false},
            cause: {allowBlank: false},
            gender: {includeNullRecord: false, allowBlank: false},
            tattoo: {
                editorConfig: {
                    helpPopup: 'Please enter the color and number of the tag and/or all visible tattoos'
                }
            }
            //manner: {allowBlank: false}
        },
        'Error Reports': {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        Birth: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            dam: {shownInGrid: false, lookups: false},
            sire: {shownInGrid: false, lookups: false},
            gender: {includeNullRecord: false, allowBlank: false},
            weight: {shownInGrid: false ,editorConfig: { forcePrecision: true, decimalPrecision : 3 }},
            wdate: {shownInGrid: false},
            room: {shownInGrid: false},
            cage: {shownInGrid: false},
            cond: {
                shownInGrid: false
                ,lookup:{ schemaName: 'ehr_lookups', queryName: 'housing_condition_codes', displayColumn: 'value', keyColumn: 'value'}
            },
            origin: {shownInGrid: false},
            estimated: {shownInGrid: false},
            conception: {shownInGrid: false}
        },
        'Blood Draws' : {
            billedby: {shownInGrid: false}
            ,remark: {shownInGrid: false}
            ,project: {shownInGrid: true, allowBlank: false}
            ,requestor: {shownInGrid: false, hidden: true, formEditorConfig:{readOnly: true}}
            ,performedby: {shownInGrid: false}
            ,instructions: {shownInGrid: false}
            ,objectid: { setInitialValue: function (v, rec){
                return v || LABKEY.Utils.generateUUID();
                },
                parentConfig:false,
                hidden :true
            }
            ,assayCode: {
                xtype: 'trigger'
                ,shownInGrid: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger',
                    allowAnyId: true
                    ,onTriggerClick: function (){
                        var prefix = this.getValue();

                        if(!prefix){
                            Ext.Msg.alert('Error', "Must enter prefix");
                            return
                        }
                        var sql = "SELECT max(cast(regexp_replace(SUBSTRING(assayCode, "+(prefix.length+1)+"), '[a-z,\-]+', '') as integer)) as maxNumber FROM study.blood WHERE assayCode LIKE '" + prefix + "%'  AND lcase(SUBSTRING(assayCode, "+(prefix.length+1)+")) = ucase(SUBSTRING(assayCode, "+(prefix.length+1)+"))";
                        //console.log(sql)
                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sql,
                            scope: this,
                            success: function(data){
                                var number;
                                if(data.rows && data.rows.length==1){
                                    number = Number(data.rows[0].maxNumber)+1;
                                }
                                else {
                                    console.log('no matching IDs found');
                                    number = 1;
                                }

                                //number = EHR.Utils.padDigits(number, (6-prefix.length));
                                var id = prefix + number;
                                this.setValue(id.toLowerCase());
                                this.fireEvent('change', this.getValue());
                            },
                            failure: EHR.Utils.onError
                        });
                    }
                }
            }
            ,additionalServices: {
                xtype: 'lovcombo',
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
                    separator: ';'
                }
            }
            ,tube_type: {
                xtype: 'combo',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_tube_type',
                    displayColumn: 'type',
                    keyColumn: 'type',
                    columns: 'type,volume'
                },
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(field, rec){
                            var theForm = this.ownerCt.getForm();
                            var tube_vol = theForm.findField('tube_vol');

                            tube_vol.store.baseParams['query.tube_types~contains'] = rec.get('type');
                            tube_vol.store.load();
                        }
                    }
                },
                colModel: {
                    width: 60,
                    showLink: false
                }
            }
            ,quantity: {
                //xtype: 'displayfield',
                shownInGrid: false,
                allowBlank: false,
                editorConfig: {
                    allowNegative: false,
                    calculateQuantity: function(){
                        var form = this.ownerCt.getForm();
                        var numTubes = form.findField('num_tubes').getValue();
                        var tube_vol = form.findField('tube_vol').getValue();

                        var quantity = numTubes*tube_vol;
                        this.setValue(quantity);
                        this.fireEvent('change', quantity, this.startValue);
                    }
                }
            }
            ,num_tubes: {
                xtype: 'ehr-triggernumberfield'
                ,editorConfig: {
                    allowNegative: false
                    ,triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var parent = this.findParentByType('ehr-formpanel');
                        var theForm = parent.getForm();

                        var tube_vol = theForm.findField('tube_vol');

                        if(!tube_vol.getValue() || !this.getValue()){
                            Ext.Msg.alert('Error', 'Must enter tube volume and number of tubes');
                            return;
                        }

                        var quantity = tube_vol.getValue() * this.getValue();
                        var quantityField = theForm.findField('quantity');
                        quantityField.setValue(quantity);
                        quantityField.fireEvent('change', quantity, quantityField.startValue);
                    }
                }
                ,allowBlank: true
                ,colModel: {
                    width: 55,
                    header: '# Tubes',
                    showLink: false
                }

            }
            ,tube_vol: {
                shownInGrid: true
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
//                    ,listeners: {
//                        select: function(field, rec){
//                            var theForm = this.ownerCt.getForm();
//                        }
//                    }
                }
                ,includeNullRecord: false
                ,lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_tube_volumes',
                    displayColumn: 'volume',
                    keyColumn: 'volume',
                    columns: '*',
                    sort: 'volume'
                }
                ,colModel: {
                    width: 75,
                    header: 'Tube Vol (mL)',
                    showLink: false
                }
            }
        },
        'Procedure Codes': {
            code: {
                editorConfig: {
                    defaultSubset: 'Procedures'
                }
            },
            performedby: {
                hidden: true
            }
        },
        'Drug Administration': {
            enddate: {
                shownInGrid: false,
                hidden: false,
                shownInInsertView: true,
                label: 'End Time'
            }
            ,category: {
                hidden: true
            }
            ,code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            }
            ,date: {
                header: 'Start Time'
                ,label: 'Start Time'
                ,hidden: false
            }
            ,HeaderDate: {
                xtype: 'xdatetime'
                ,hidden: true
                ,shownInGrid: false
            }
            ,remark: {shownInGrid: false}
            ,dosage: {
                xtype: 'ehr-drugdosefield',
                shownInGrid: false,
                compositeField: 'Dosage',
                editorConfig: {
                    decimalPrecision: 3
                }
            }
            ,dosage_units: {
                shownInGrid: false,
                compositeField: 'Dosage',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
            ,concentration: {
                shownInGrid: false,
                compositeField: 'Drug Conc',
                editorConfig: {
                    decimalPrecision: 10
                }
            }
            ,conc_units: {
                shownInGrid: false
                ,lookup: {columns: '*'}
                ,compositeField: 'Drug Conc'
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            theForm.findField('amount_units').setValue(rec.get('numerator'));
                            theForm.findField('conc_units').setValue(rec.get('unit'));
                            theForm.findField('vol_units').setValue(rec.get('denominator'));

                            var doseField = theForm.findField('dosage_units');
                            if(rec.get('numerator'))
                                doseField.setValue(rec.get('numerator')+'/kg');
                            else
                                doseField.setValue('');

                            doseField.fireEvent('change', doseField.getValue(), doseField.startValue);
                        }
                    }
                }
            }
            ,route: {
                shownInGrid: false,
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
            ,volume: {
                compositeField: 'Volume',
                xtype: 'ehr-triggernumberfield',
                noDuplicateByDefault: true,
                noSaveInTemplateByDefault: true,
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        //recalculate amount if needed:
                        var theForm = this.findParentByType('ehr-formpanel').getForm();
                        var conc = theForm.findField('concentration').getValue();
                        var val = this.getValue();

                        if(!val || !conc){
                            alert('Must supply volume and concentration');
                            return;
                        }

                        if(val && conc){
                            var amount = conc * val;
                            var amountField = theForm.findField('amount');
                            amountField.setValue(amount);
                            amountField.fireEvent('change', amount, amountField.startValue);
                        }
                    }
                    ,decimalPrecision: 3
                }
            }
            ,vol_units: {
                compositeField: 'Volume'
                ,header: 'Units'
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
            ,amount: {
                compositeField: 'Amount Given'
                ,noDuplicateByDefault: true
                ,noSaveInTemplateByDefault: true
                //,allowBlank: false
                ,shownInGrid: false
                ,colModel: {
                    width: 40
                }
                ,editorConfig: {
                    decimalPrecision: 10
                }
            }
            ,amount_units: {
                shownInGrid: false
                ,compositeField: 'Amount Given'
                ,colModel: {
                    width: 70
                }
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
            ,performedby: {
                allowBlank: false
            }
            ,project: {
                allowBlank: false
            }
            ,restraint: {
                shownInGrid: false
            }
            ,restraintDuration: {
                shownInGrid: false
            }
            ,qualifier: {
                shownInGrid: false
            }
        },
        Notes: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        'Problem List': {
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
        'Clinical Observations': {
            observation: {
                xtype: 'ehr-remoteradiogroup',
                //defaultValue: 'Normal',
                //allowBlank: false,
                includeNullRecord: false,
                editorConfig: {columns: 2},
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'normal_abnormal',
                    displayColumn: 'state',
                    keyColumn: 'state',
                    sort: '-state'
                }
            },
            date: {
                label: 'Time'
            },
            performedby: {hidden: true}
        },
        'TB Tests': {
            lot: {
                shownInGrid: false
            },
            project: {
                hidden: true
            },
            account: {
                hidden: true
            },
            dilution: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            },
            eye: {
                colModel: {
                    width: 40
                }
            },
            result1: {
                colModel: {
                    width: 40
                }
            },
            result2: {
                colModel: {
                    width: 40
                }
            },
            result3: {
                colModel: {
                    width: 40
                }
            },
            date: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            }
        },
        Weight: {
            project: {
                hidden: true
            }
            ,account: {
                hidden: true
            }
            ,performedby: {
                hidden: true
            }
            ,'id/curlocation/location': {
                shownInGrid: true
            }
            ,remark: {
                shownInGrid: false
            }
            ,weight: {
                allowBlank: false
                ,useNull: true
                ,editorConfig: {
                    allowNegative: false
                    ,decimalPrecision: 4
                }
            }
            //,performedby: {allowBlank: true}
        }
    }
});