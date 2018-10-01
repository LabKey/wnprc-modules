EHR.model.DataModelManager.registerMetadata('SurgeryProcedureRequest', {
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
            // linktoexisting: {
            //     editorConfig: {
            //         listeners: {
            //             change: function(field, val){
            //                 var theForm = this.ownerCt.ownerCt.ownerCt.getForm();
            //                 if (theForm) {
            //                     var existing = theForm.findField('linkedRequest');
            //                     //var existing = Ext4.getCmp('linkedRequestField');
            //                     if (val) {
            //                         existing.show();
            //                     } else {
            //                         existing.setValue("");
            //                         existing.hide();
            //                     }
            //                 }
            //                 // var panel = field.up('ehr-formpanel');
            //                 // if (panel) {
            //                 //     panel.add({
            //                 //         xtype: "wnprc-linkedsurgeryprocedurefield",
            //                 //         fieldLabel: "Request to link to"
            //                 //     });
            //                 // }
            //                 //var model = Ext4.ClassManager.get('app.model.SurgeryProcedureRequest');
            //                 //var formPanel = Ext4.ComponentQuery.query('[name=Surgery/Procedure]');
            //                 //alert(panel.name);
            //             }
            //         }
            //     }
            // },
            // linkedrequest: {
            //     xtype: 'wnprc-linkedsurgeryprocedurefield'
            // },
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
                }
            },
            enddate: {
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                    }
                }
            },
            project: {
                xtype: 'wnprc-projectentryfield',
            },
            account: {
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