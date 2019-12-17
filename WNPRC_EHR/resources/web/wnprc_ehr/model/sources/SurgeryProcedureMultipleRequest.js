EHR.model.DataModelManager.registerMetadata('SurgeryProcedureMultipleRequest', {
    byQuery: {
        'ehr.requests': {
            sendemail: {
                editorConfig: {
                    checked: true
                }
            },
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
            proceduretype: {
                editorConfig: {
                    plugins: ['wnprc-procedurefield']
                }
            },
            procedurename: {
                xtype: 'wnprc-surgeryprocedurenamefield'
            },
            location: {
                xtype: 'wnprc-surgeryprocedureroomfield'
            },
            date: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                },
                setInitialValue: function(v){
                    var date = (new Date()).add(Date.DAY, 2);
                    date.setHours(9);
                    date.setMinutes(30);
                    return v || date;
                }
            },
            enddate: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                },
                setInitialValue: function(v){
                    var date = (new Date()).add(Date.DAY, 2);
                    date.setHours(9);
                    date.setMinutes(30);
                    return v || date;
                }
            },
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
        }
    }
});