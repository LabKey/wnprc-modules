EHR.model.DataModelManager.registerMetadata('SurgeryProcedureRequest', {
    byQuery: {
        'ehr.requests': {
            sendemail: {
                editorConfig: {
                    checked: true
                }
            },
            priority: {
                hidden: true
            },
            QCState: {
                hidden: true
            }
        },
        'study.surgery_procedure': {
            QCState: {
                hidden: true
            },
            Id: {
                editorConfig: {
                    plugins: ['wnprc-animalfield']
                }
            },
            date: {
                //defaultValue: Ext4.Date.add(new Date()),//'2018-12-05 11:00 AM',
                editorConfig: {
                    // dateConfig: {
                    //     minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    // },
                    listeners: {
                        change: function(field, val){
                            let theForm = this.ownerCt.ownerCt.ownerCt.getForm();

                            if(theForm){
                                let startTableTimeField = theForm.findField("startTableTime");
                                let procedureUnitField = theForm.findField("procedureUnit");
                                let startTableTimeTimeValue = startTableTimeField.timeField.rawValue;
                                if (procedureUnitField.value === "vet" && field.value && (startTableTimeTimeValue === "00:00" || !startTableTimeTimeValue)) {
                                    startTableTimeField.setValue(field.value);
                                }
                            }
                        }
                    }
                }//,
                // setInitialValue: function(v){
                //     var date = (new Date()).add(Date.DAY, 1);
                //     date.setHours(8);
                //     date.setMinutes(0);
                //     return v || date;
                // }
            },
            procedurename: {
                xtype: "wnprc-groupedcheckcombo",
                lookup: {
                    schemaName: 'wnprc',
                    queryName: 'procedure_names_with_headers',
                    displayColumn: 'displayname',
                    keyColumn: 'name',
                    columns: 'displayname,name,category/displayname,firstCategoryItem',
                    sort: 'category,displayname'
                }
            },
            procedureunit: {
                editorConfig: {
                    listeners: {
                        select: function(field, val){
                            let theForm = this.ownerCt.ownerCt.ownerCt.getForm();

                            if(theForm){
                                let idField = theForm.findField("Id");
                                if (field.value === "spi" && !idField.value) {
                                    idField.setValue("ph9999");
                                }
                            }
                        }
                    }
                }
            },
            startTableTime: {
                xtype: 'xdatetime',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                },
            },
            // enddate: {
            //     editorConfig: {
            //         dateConfig: {
            //             minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
            //         },
            //         timeConfig: {
            //             minValue: '10:00 AM'
            //         }
            //     }//,
            //     // setInitialValue: function(v){
            //     //     var date = (new Date()).add(Date.DAY, 1);
            //     //     date.setHours(10);
            //     //     date.setMinutes(0);
            //     //     return v || date;
            //     // }
            // },
            project: {
                xtype: 'wnprc-projectentryfield',
            },
            account: {
                //nothing
            },
            consultRequest: {
                //nothing
            },
            biopsyNeeded: {
                //nothing
            },
            surgerytechneeded: {
                //nothing
            },
            spineeded: {
                //nothing
            },
            vetneeded: {
                //nothing
            },
            vetneededreason: {
                height: 100,
                width: 400
            },
            equipment: {
                height: 100,
                width: 400
            },
            drugslab: {
                height: 100,
                width: 400
            },
            drugssurgery: {
                height: 100,
                width: 400
            },
            comments: {
                height: 100,
                width: 400
            },
            statuschangereason: {
                hidden: true
            }
        },
        'study.drug': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            project: {
                shownInGrid: false,
                hidden: true
            },
            account: {
                shownInGrid: false,
                hidden: true
            },
            code: {
                header: 'Drug',
                //shownInGrid: false,
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Drugs and Procedures'
                }
            }
        },
        'wnprc.procedure_scheduled_rooms': {
            objectid: {
                hidden: true
            },
            event_id: {
                hidden: true
            },
            created: {
                hidden: true
            },
            modified: {
                hidden: true
            },
            date: {
            },
            enddate: {
            }
        },
        'study.foodDeprives': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            project: {
                shownInGrid: false,
                hidden: true
            },
            account: {
                shownInGrid: false,
                hidden: true
            },
            date: {
                getInitialValue: function(val, record){
                    if (val){
                        return val;
                    }

                    let collectionId = record.storeCollection.collectionId;
                    let storeName = collectionId + "-" + "surgery_procedure";
                    let store = Ext4.StoreManager.get(storeName);
                    let procedureRecord = null;
                    if(store) {
                        procedureRecord = store.getAt(0);
                    }
                    let date = null;
                    if(procedureRecord) {
                        date = procedureRecord.get('date');
                    }

                    return date;
                }
            }
        }
    }
});