EHR.model.DataModelManager.registerMetadata('NecropsyRequest', {
    byQuery: {
        'ehr.requests': {
            sendemail: {
                //NOTE: Ext doesnt seem to respect value=true, so resort to checked.
                editorConfig: {
                    checked: true
                }
            }
        },
        'study.necropsy': {
            Id: {
                xtype: 'trigger',
                dataIndex: 'Id',
                nullable: false,
                allowBlank: false,
                lookups: false,
                noSaveInTemplateByDefault: true,
                columnConfig: {
                    width: 95,
                    showLink: false
                },
                hidden: false,
                editorConfig: {
                    plugins: ['wnprc-animalfield'],
                    triggerCls: 'x4-form-search-trigger',
                    onTriggerClick: function (){
                        Ext.Msg.confirm('Generate Temporary PD', 'Clicking Okay will generate a temporary random PD number.', function(v){
                            if(v == 'yes'){
                                var randLength = 10;
                                var array = [];

                                if (window.crypto && window.crypto.getRandomValues) {
                                    array = new Uint16Array(randLength);
                                    window.crypto.getRandomValues(array);

                                    // Use slice to convert the typed array back to a normal array.
                                    array = Array.prototype.slice.call(array.map(function(num) {
                                        return num % 10;
                                    }))
                                }
                                else {
                                    array = (new Array(randLength)).map(function(val) {
                                        return Math.getRandomInt(0, 10);
                                    });
                                }

                                var randString = array.map(function(val) {
                                    return val.toString(10);
                                }).join("").toUpperCase();

                                this.setValue("pdTEMP" + randString);
                            }
                        }, this);
                    }
                }
            },
            date: {
                label: 'Preferred Date and Time',
                xtype: 'xdatetime',
                allowBlank: false,
                extFormat: 'Y-m-d H:i',
                hidden: false,
                editorConfig: {
                    defaultHour: 10,
                    defaultMinutes: 0,
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 10)
                    },
                    timeConfig: {
                        minValue: '10:00 AM',
                        maxValue: '2:00 PM',
                        increment: 120
                    }
                },
                helpPopup: 'The preferred date and time that you\'d like the Necropsy performed.  If there are more ' +
                'dates that would work or you prefer AM or PM, etc., please specify that in the comments field.  If you ' +
                'need the necropsy performed within the next ten days, please call pathology directly to discuss it with them.'
            },
            remark: {
                height: 200,
                width: 600
            },
            timeofdeath: {
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                allowBlank: false,
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            perfusion_area: {
                allowBlank: true
            },
            grossdescription: {
                hidden: true
            },
            histologicalDescription: {
                hidden: true
            },
            patho_notes: {
                hidden: true
            },
            performedby: {
                hidden: true
            },
            pathologistHistology: {
                hidden: true
            },
            pathologistReview: {
                hidden: true
            },
            comments: {
                hidden: false
            },
            prosector: {
                hidden: false
            }
        },
        'study.organ_weights': {
            remark: {
                hidden: false,
                shownInGrid: true
            },
            weight: {
                hidden: true,
                shownInGrid: false
            }
        },
        'study.tissue_samples': {
            trimdate: {
                hidden: true
            },
            trimmed_by: {
                hidden: true
            },
            trim_remarks: {
                hidden: true
            },
            pathologist: {
                hidden: true
            },
            slideNum: {
                hidden: true,
                shownInGrid: false
            },
            collect_before_death: {
                hidden: true,
                shownInGrid: false
            },
            collection_order: {
                hidden: true,
                shownInGrid: false
            }
        }
    }
});