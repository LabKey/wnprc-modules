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
        'study.weight':{
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
            date: {
                xtype: 'xdatetime',
                noSaveInTemplateByDefault: true,
                columnConfig: {
                    fixed: true,
                    width: 130
                },
                editorConfig: {
                    id: 'weightDateTime',
                    defaultHour: 10,
                    defaultMinutes: 0,
                    dateConfig: {
                        maxValue: new Date(),
                        minValue: new Date(),
                    }
                },
            },
            weight:{
                allowBlank :true
            }

        },
        'study.chairing':{
            Id: {
                hidden : true
            },
            date: {
                hidden : true
            },
            location: {
                helpPopup : 'Location of longest chairing',
                hidden: false,
                editorConfig : {
                    id : 'location',
                    listeners: {
                        change: function (field, val) {
                            var weightStartTime = Ext4.getCmp('weightDateTime');
                            var chairingStartTime = Ext4.getCmp('chairingStartTime');
                            var startTime = new Date(weightStartTime.getValue());
                            chairingStartTime.setValue(startTime);
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
            /*restraintType: {

                editorConfig :{
                    id: 'restraintType',
                    listeners:{
                        select: function(field, val){


                            if (field) {
                                var restraintStartTime = Ext4.getCmp('restraintStartTime');
                                var restraintEndTime = Ext4.getCmp('restraintEndTime');
                                var locationField = Ext4.getCmp('location');

                                switch (field.value){
                                    case 'Long Term Chairing':
                                        restraintStartTime.show();
                                        restraintStartTime.setValue((new Date()).format('Y-m-d H:i'));
                                        restraintEndTime.show();
                                        restraintEndTime.setValue(new Date());
                                        locationField.show();

                                    break;

                                    case 'Short Term Chairing':
                                        var starTime = new Date();
                                       // var endTime = new Date (starTime);
                                       // endTime.setMinutes(starTime.getMinutes()+30);
                                        restraintStartTime.show();
                                        restraintStartTime.setValue((new Date()).format('Y-m-d H:i'));
                                        restraintEndTime.show();
                                        //restraintEndTime.setValue(endTime);
                                        locationField.setValue('');
                                        locationField.hide();
                                    break;
                                    default :
                                        restraintStartTime.setValue('');
                                        restraintEndTime.setValue('');
                                        locationField.setValue('');
                                        restraintStartTime.hide();
                                        restraintEndTime.hide();
                                        locationField.hide();





                                }


                                /!*if(field.value === 'Long Term Chairing') {
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

                                }*!/
                            }

                        }
                    }
                }
            },*/
            chairingStartTime: {
                xtype: 'xdatetime',
                extFormat:'Y-m-d H:i',
                hidden: false,
                allowBlank: false,
               // hideMode: 'offsets',
                editorConfig : {
                    id : 'chairingStartTime',

                }



            },
            chairingEndTime: {
                xtype: 'xdatetime',
                extFormat:'Y-m-d H:i',
                allowBlank: false,
                hidden: false,
                hideMode: 'offsets',
                editorConfig : {
                    id : 'chairingEndTime',
                    listeners: {

                    }
                }


            }
        },
        'study.restraints':{
            Id:{
                hidden : true
            },
            date: {
                hidden :true
            }

        },
        'study.waterGiven':{
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
                allowBlank: false
            },
            route: {
                defaultValue : 'oral'
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
                }
            },
            assignedTo:{
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
            performedby:{
                allowBlank: false
            },
            treatmentid: {
                hidden: true
            },
            dateordered:{
                hidden: true
            }

        },
        'study.waterAmount':{
            Id:{
                hidden: true,
                shownInGrid: false
            },
            date:{
                xtype: 'datefield',
                header: 'Date',
                extFormat: 'Y-m-d',
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:110
                },
                editorConfig: {
                    maxValue: new Date(),
                    minValue: new Date(),

                }
            },
            volume:{
                //todo increase size of field for column
                header: 'Volume (mL)',
                allowBlank:false,
                columnConfig: {
                    width:140
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
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'altmeaning',
                    sort: 'sort_order',
                    filterArray: [LABKEY.Filter.create('altmeaning', null, LABKEY.Filter.Types.NONBLANK)]
                }

            }
        },
        'study.waterOrders':{
            project:{
                allowBlank: false
            },
            date:{
                xtype: 'datefield',
                header: 'Start Date',
                extFormat: 'Y-m-d',
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:110
                },
                editorConfig: {
                    minValue: new Date()
                }
            },
            enddate:{
                xtype: 'datefield',
                header: 'End Date',
                extFormat: 'Y-m-d',
              //  allowBlank: false,
                editable: true,
                columnConfig: {
                    width:110
                },
                editorConfig: {
                    minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                }
            },
            frequency:{
                defaultValue: 'Daily - PM',
                allowBlank: 'true'
            },
            waterSource:{
                defaultValue: 'regulated',
                allowBlank: 'false'

            },
            volume:{
                xtype: 'textfield',
                header: 'Water Volume (mL)',
                allowBlank:false,
                columnConfig: {
                    width:140
                }
            },
            assignedTo:{
                allowBlank: false
            },
            frequency:{
                allowBlank: false,
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'meaning',
                    sort: 'sort_order'
                }
            },
            provideFruit:{
                xtype: 'ehr-booleanField',
                editorConfig: {
                    trueText: 'Yes',
                    falseText: 'No'
                },
                defaultValue: 'No',
                allowBlank: false
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