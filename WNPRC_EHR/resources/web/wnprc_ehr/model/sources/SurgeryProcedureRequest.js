EHR.model.DataModelManager.registerMetadata('SurgeryProcedureRequest', {

    byQuery: {
        'ehr.requests': {
            sendemail: {
                //NOTE: Ext doesnt seem to respect value=true, so resort to checked.
                editorConfig: {
                    checked: true
                }
            },
            // priority: {
            //     hidden: true
            // },
            // notify2: {
            //     hidden: true
            // },
            // notify3: {
            //     hidden: true
            // }
        },
        'study.surgery_procedure': {
            Id: {
                editorConfig: {
                    plugins: ['wnprc-animalfield']
                }
            },
            procedure: {
                editorConfig: {
                    plugins: ['wnprc-procedurefield']
                }
            },
            date: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                }
            },
            enddate: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                }
            },
            location: {
                xtype: 'wnprc-surgeryprocedureroomfield'
            },
            pi: {
                hidden: true,
                editorConfig: {
                    listeners: {
                        change: function (combo, rec) {

                        }
                    }
                }
            },
            protocol: {
                hidden: true
                // lookup: {
                //     filterArray: [
                //         LABKEY.Filter.create('inves', 'Evans, David T', LABKEY.Filter.Types.EQUAL)
                //     ]
                // }
            },
            project: {
                xtype: 'wnprc-projectentryfield',
                // lookup: {
                //     columns: 'project,name,displayName,protocol'
                // },
            },
            vetNeededReason: {
                height: 100,
                width: 400
            },
            equipment: {
                height: 100,
                width: 400
            },
            drugsLab: {
                height: 100,
                width: 400
            },
            drugsSurgery: {
                height: 100,
                width: 400
            },
            comments: {
                height: 100,
                width: 400
            },
            shareWithExisting: {
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            var theForm = this.ownerCt.ownerCt.ownerCt.getForm();
                            if (theForm) {
                                var existing = theForm.findField('existing');
                                if (val) {
                                    existing.show();
                                } else {
                                    existing.setValue("");
                                    existing.hide();
                                }
                            }
                        }
                    }
                }
            },
            existing: {
                editorConfig: {
                    listeners: {
                        beforerender: function(field, val){
                            field.hide();
                        }
                    }
                }
            }
        }
    }
});