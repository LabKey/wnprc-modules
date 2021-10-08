EHR.model.DataModelManager.registerMetadata('Husbandry', {
    allQueries: {
        remark: {
            shownInGrid: false
        }
    },
    byQuery: {
        'study.foodDeprives':{
            location:{
                width: 100,
                columnConfig: {
                    width: 100
                }
            },
            account: {
                shownInGrid: true,
                columnConfig: {
                    displayAfterColumn: 'project'
                }
            },
            project: {
                xtype: 'ehr-projectentryfield',
                editable : true,
                disable: false,
                shownInGrid: true,
                useNull: true,
                lookup: {
                    columns: 'project,name,displayName,protocol'
                },
                columnConfig: {
                    width: 120
                }
            },
            schedule:{
                allowBlank: false,
                columnConfig: {
                    width: 130
                },
                lookup:{
                    display: 'title',
                    value: 'value',
                    columns:'*',
                    sort: 'sort_order'
                }

            },
            date:{
                xtype: 'datefield',
                extFormat: 'Y-m-d',
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:110
                }
            },
            protocolContact: {
                xtype: 'wnprcehr-protocolStaffField',
                shownInGrid: true,
                useNull: true,
                columnConfig: {
                    width: 120
                }
            },
            depriveStartTime:{
                xtype: 'xdatetime',
                allowBlank : true,
                extFormat: 'Y-m-d H:i',
                hidden: false,
                columnConfig : {
                    width: 150
                }
            },
            restoredTime:{
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                columnConfig:{
                    width: 140
                },
                shownInGrid: true,
                hidden: false,
                allowBlank: true
            },
            reason:{
                width: 500,
                columnConfig:{
                    width:200
                },
                hidden :false,
                shownInGrid: false
            },
            remarks:{
                width: 500
            },
            depriveStartedBy:{
                hidden: false,
                shownInGrid: true,
                allowBlank: true
            },
            foodRestoredBy:{
                hidden: false,
                shownInGrid: true,
                allowBlank: true
            },
            startedTaskId:{
                hidden: true,
                shownInGrid: false
            },
            QCState:{
                hidden: false

            }

        },
        'study.singleGeneralEncounter':{
            Id:{
                parentConfig: null
            },
            date: {
                xtype: 'xdatetime',
                noSaveInTemplateByDefault: true,
                columnConfig: {
                    fixed: true,
                    width: 130
                },
                editorConfig: {
                    id: 'encounterDateTime',
                    defaultHour: 10,
                    defaultMinutes: 0,
                    dateConfig: {
                        maxValue: new Date(),
                        //minValue: new Date(),
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, -3)
                    }
                },
            },
            enddate:{
                hidden: true
            },
            project: {
                xtype: 'wnprc-projectentryfield',
                editable : true,
                hidden: false,
                disable: false,
                shownInGrid: true,
                useNull: true,
                lookup: {
                    columns: 'project,name,displayName,protocol'
                },
                columnConfig: {
                    width: 120
                }
            },
            type:{
                defaultValue: 'Husbandry',
                editable: false,
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'encounter_types',
                    keyColumn: 'value',
                    displayColumn: 'value',
                    sort: 'sort_order'
                }
            },
            account:{
                hidden: true
            },
            performedby:{
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            ts:{
                hidden: true
            },
            serviceRequested:{
                hidden: true
            },
            title:{
                hidden: true
            },
            caseno:{
                hidden: true
            },
            restraint:{
                hidden: true
            },
            daterequested:{
                hidden: true
            },
            restraintDuration:{
                hidden: true
            },
            major:{
                hidden: true
            },
            remark:{
                hidden: true
            }
        },
        'study.weight':{
            Id:{
                parentConfig: {
                    storeIdentifier: {queryName: 'singleGeneralEncounter', schemaName: 'study'},
                    dataIndex: 'Id'
                },
                hidden : true
            },
            date:{
                hidden: true
            },
            weight:{
                allowBlank :true
            },
            remark:{
                hidden: true

            }

        },
        'study.chairing':{
            Id: {
                hidden : true
            },
            date: {
                hidden : true
            },
            project:{
                hidden :true
            },
            location: {
                helpPopup : 'Location of longest chairing',
                hidden: false,
                editorConfig : {
                    id : 'location',
                    listeners: {
                        change: function (field, val) {
                            var encounterStartTime = Ext4.getCmp('encounterDateTime');
                            var chairingStartTime = Ext4.getCmp('chairingStartTime');
                            var chairingEndTime = Ext4.getCmp('chairingEndTime');
                            var waterLocation = Ext4.getCmp('waterLocation');
                            var startTime = new Date(encounterStartTime.getValue());
                            if (!chairingStartTime.getValue()){
                                 chairingStartTime.setValue(startTime);
                            }
                            if (!chairingEndTime.getValue()){
                                chairingEndTime.setValue(startTime);
                            }

                            waterLocation.setValue(val);
                        }
                    }
                }
            } ,

            /*location: {
                editorConfig : {
                    id: 'chairingLocation',
                    listeners: {
                        select: function (field, val) {
                            if (field) {
                                var chairingStartTime = Ext4.getCmp('chairingStartTime');
                                chairingStartTime.setValue((new Date()).format('Y-m-d H:i'));
                            }
                        }
                    }
                }

            },*/

            chairingStartTime: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                hidden: false,
                allowBlank: false,
               // hideMode: 'offsets',
                editorConfig : {
                    id : 'chairingStartTime',
                    dateFormat: 'Y-m-d',
                    timeFormat:'H:i',
                    defaultHour: 10,
                    defaultMinutes: 0,
                    dateConfig: {
                        maxValue: new Date(),
                        //minValue: new Date()
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, -3)
                    }

                }



            },
            chairingEndTime: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                allowBlank: false,
                hidden: false,
                hideMode: 'offsets',
                editorConfig : {
                    id : 'chairingEndTime',
                    dateFormat: 'Y-m-d',
                    timeFormat:'H:i',
                    defaultHour: 10,
                    defaultMinutes: 0,
                    dateConfig: {
                        maxValue: new Date(),
                        //minValue: new Date()
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, -3)
                    }

                }


            },
            remarks:{
                xtype:  'ehr-remarkfield',
                allowBlank: false,
                editorConfig: {
                    width:  400,
                    height: 100,
                    //resizable: true
                }
            }

        },
        'study.restraints':{
            Id:{
                hidden : true
            },
            date: {
                hidden :true
            },
            project:{
                hidden :true
            },
            restraintType: {

                editorConfig :{
                    id: 'restraintType',
                    listeners:{
                        change: function(field, val){


                            if (field) {
                                var restraintRemarks = Ext4.getCmp('restraintRemarks');

                                debugger; 
                                if (field.value != null){
                                    restraintRemarks.show();
                                    var remarkText = restraintRemarks.getRawValue();
                                    if (remarkText == ''){
                                        restraintRemarks.setActiveError("need a remark");
                                        //restraintRemarks.markInvalid("Need a remark");
                                    }
                                }
                                if (field.value == "None" || field.value == ""){
                                    restraintRemarks.setValue('');
                                    restraintRemarks.hide();
                                }/*else{
                                    restraintRemarks.setValue('');
                                    restraintRemarks.hide();
                                }*/
                            }


                                /*if(field.value === 'Long Term Chairing') {
                                    restraintStartTime.show();
                                    restraintStartTime.setValue((new Date()).format('Y-m-d H:i'));
                                    restraintEndTime.show();
                                    restraintEndTime.setValue(new Date());
                                    locationField.show();

                                } else {
                                    restraintStartTime.setValue('');
                                    restraintEndTime.setValue('');
                                    locationField.setValue('');
                                    restraintStartTime.hide();
                                    restraintEndTime.hide();
                                    locationField.hide();
                                }
                                if(field.value === 'Short Term Chairing') {
                                    var starTime = new Date();
                                    var endTime = new Date (starTime);
                                    endTime.setMinutes(starTime.getMinutes()+30);
                                    restraintStartTime.show();
                                    restraintStartTime.setValue((new Date()).format('Y-m-d H:i'));
                                    restraintEndTime.show();
                                    restraintEndTime.setValue(endTime);
                                } else {
                                    restraintStartTime.setValue('');
                                    restraintEndTime.setValue('');
                                    restraintStartTime.hide();
                                    restraintEndTime.hide();

                                }*/


                        }
                    }
                }
            },
            remarks:{
                allowBlank: true,
                //xtype:  'ehr-remarkfield',
                editorConfig:{
                    autoRender: true,
                    id:     'restraintRemarks',
                    listeners:{
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be changed while hidden
                        render: function(field){
                            field.hide();
                        }
                    }
                },
                validator: function (value){
                    if (value == ''){
                        return 'Need to add a remark'
                    }else {
                        return true;
                    }
                }
            }

        },
        'study.drug':{
            id:{
                hidden: true,
                shownInGrid:false,
            },
            date:{
                xtype: 'xdatetime',
                header: 'Date',
                //extFormat: 'Y-m-d HH:mm',
                allowBlank: false,
                hidden: false,
                shownInGrid: true,
                //editable: false,
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, -3),
                        //minValue: new Date(),
                        maxValue: new Date(),
                    }
                },
            },
            project:{
                hidden: true,
                shownInGrid:false
            },
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Implant Cleaning',
                }
            },
            route: {
                defaultValue : 'topical'
            },
            category:{
                hidden: false,
                shownInGrid: true,
                editable: false,
                defaultValue: 'Implant Maintenance'
            },
            areaCleaned:{
                allowBlank: false
            },
            remark:{
                shownInGrid: true
            },
            objectid:{
                setInitialValue: function(v, rec) {
                    return v || LABKEY.Utils.generateUUID();
                }
            }

        },
        'study.waterGiven':{
            performedby: {
                allowBlank: false,
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            Id: {
                hidden :true,
                shownInGrid: false
            },
            date: {
                hidden :true,
                shownInGrid: false
            },
            project:{
                hidden: true
                //allowBlank: false
            },
            volume: {
                xtype: 'numberfield',
                compositeField: 'Volume (mL)',
                header: 'Volume (ml)',
                allowBlank: false,
                editorConfig: {
                    id: 'waterGivenVolume'
                }
            },
            waterSource: {
                defaultValue: 'regulated',
                hidden: true
            },
            route: {
                defaultValue : 'oral'
            },
            provideFruit:{
                allowBlank: false
            },
            location:{
                defaultValue: 'lab',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'water_location',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                },
                columnConfig: {
                    width:130
                },
                editorConfig :{
                    id: 'waterLocation'
                }
            },
            assignedTo:{
                hidden: true,
                defaultValue: 'researchstaff',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_assigned',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                }
            },
            remarks :{
                xtype: 'ehr-remarkfield'
            },

            treatmentId: {
                hidden: true,
                defaultValue: null
            },
            dateordered:{
                hidden: true
            }

        },
        'study.waterAmount':{
            Id:{
                hidden: true,
                shownInGrid: false,
                parentConfig: {
                    storeIdentifier: {queryName: 'singleGeneralEncounter', schemaName: 'study'},
                    dataIndex: 'Id'
                }
            },
            date:{
                xtype: 'datefield',
                header: 'Date',
                extFormat: 'Y-m-d',
                allowBlank: false,
                editable: false,
                columnConfig: {
                    width:110
                },
                editorConfig: {
                    id : 'waterAmountDate',
                    maxValue: new Date(),
                    minValue: new Date(),

                }
            },
            objectid:{
                setInitialValue: function(v, rec) {
                    return v || LABKEY.Utils.generateUUID();
                }
            },
            volume:{
                xtype: 'numberfield',
                header: 'Volume (mL)',
                allowBlank:false,
                columnConfig: {
                    width:140
                },
                editorConfig : {
                    id : 'waterAmountVolume',
                }
            },
            project:{
                hidden: true,
                shownInGrid: false
            },
            assignedTo:{
                allowBlank: false
            },
            frequency:{
                allowBlank: false,
                defaultValue: '2',
                editable: false,
                editorConfig:{
                    displayColumn: 'altmeaning'
                },
                lookup:{
                    schemaName: 'wnprc',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'altmeaning',
                    sort: 'sort_order',
                    filterArray: [LABKEY.Filter.create('altmeaning', null, LABKEY.Filter.Types.NONBLANK)]
                }

            },
            waterSource: {
                defaultValue: 'regulated',
            },
            recordSource:{
                defaultValue: 'LabWaterForm',
                editable: false,
                hidden: true,
                shownInGrid: false
            },
            provideFruit:{
                defaultValue: 'none',
                allowBlank: false,
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_fruit',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                }
            },
            QCState:{
                shownInGrid: false,
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                        qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                    return v || qc;
                }
            }
        },
        'study.waterOrders':{
            id :{
                columnConfig: {
                    width:70
                }
            },
            project:{
                allowBlank: false,
                columnConfig: {
                    width:90
                },
            },
            date:{
                xtype: 'datefield',
                header: 'Start Date',
                extFormat: 'Y-m-d',
                /*defaultHour: 0,
                defaultMinutes: 0,*/
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:90
                },
                editorConfig: {
                    minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                },
                defaultValue: new Date(new Date(Ext4.Date.add(new Date(), Ext4.Date.DAY, 1).setHours(0)).setMinutes(0)),
                /*setInitialValue: function(v) {
                    debugger;
                    var date = (Ext4.Date.add(new Date(), Ext4.Date.DAY, 1));
                    date.setHours(0);
                    date.setMinutes(0);
                    return v || date;
                },*/
                onExpand: function() {
                    var value = this.getValue();
                    this.picker.setValue(Ext.isDate(value) ? value : Ext4.Date.add(new Date(), Ext4.Date.DAY, 1));
                }
            },
            enddate:{
                xtype: 'datefield',
                header: 'End Date',
                extFormat: 'Y-m-d',
              //  allowBlank: false,
                editable: true,
                columnConfig: {
                    width:90
                },
                editorConfig: {
                    minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 2)
                }
            },
            waterSource:{
                defaultValue: 'regulated',
                allowBlank: 'false',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'water_source',
                    keyColumn: 'value',
                    displayColumn: 'title',

                }

            },
            volume:{
                xtype: 'textfield',
                header: 'Water Volume (mL)',
                //allowBlank: false,
                columnConfig: {
                    width:140
                }
            },
            assignedTo:{
                //allowBlank: false,
                columnConfig: {
                    width:120
                }
            },
            frequency:{
                //allowBlank: false,
                defaultValue: 2,
                lookup:{
                    schemaName: 'wnprc',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'meaning',
                    sort: 'sort_order'
                }
            },
            provideFruit:{
                defaultValue: 'none',
                allowBlank: false,
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_fruit',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                }
            }



        },

        'ehr.requests':{
            priority:{
                hidden: true
            },
            QCState:{
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('Request: Approved'))
                        qc = EHR.Security.getQCStateByLabel('Request: Approved').RowId;
                    return v || qc;
                }
            }
        }
    }

});