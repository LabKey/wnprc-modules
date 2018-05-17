EHR.model.DataModelManager.registerMetadata('SurgeryRequest', {

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
        'study.surgery': {
            Id: {
                editorConfig: {
                    plugins: ['wnprc-animalfield']
                }
            },
            date: {
                hidden: true,
                editorConfig: {
                    readOnly: true,
                },
                getInitialValue: function(v, rec){
                    return v ? v : new Date()
                }
            },
            surgeryStart: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                }
            },
            surgeryEnd: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                }
            },

            pi: {
                editorConfig: {
                    listeners: {
                        change: function (combo, rec) {

                        }
                    }
                }
            },
            protocol: {
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
                height: 50,
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
            }
        }
    }
});