EHR.model.DataModelManager.registerMetadata('Necropsy', {
    allQueries: {
        Id: {
            shownInGrid: false,
            hidden: true
        },
        date: {
            shownInGrid: false,
            hidden: true
        },
        performedby: {
            shownInGrid: false,
            hidden: true
        }
    },
    byQuery: {
        'study.necropsy': {
            Id: {
                parentConfig: null,
                hidden: false,
                allowAnyId: true,
                xtype: 'trigger',
                editorConfig: {
                    plugins: ['wnprc-animalfield'],
                    triggerCls: 'x4-form-search-trigger',
                    onTriggerClick: function (){
                        Ext.Msg.confirm('Find Next PD Number In Series', 'Clicking OK will find the next available PD number for infant deaths.', function(v){
                            if(v == 'yes'){
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
                        }, this);
                    }
                }
            },
            date: {
                xtype: 'xdatetime',
                allowBlank: false,
                extFormat: 'Y-m-d H:i',
                hidden: false
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
            tissue_distribution: {
                xtype: 'checkcombo',
                hasOwnTpl: true,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'tissue_distribution',
                    displayColumn: 'value',
                    keyColumn: 'value'
                }
            },
            location: {
                xtype: 'combo',
                lookup: {
                    schemaName: 'wnprc',
                    queryName: 'necropsy_suite',
                    displayColumn: 'displayname',
                    keyColumn: 'room'
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
            performedby: {
                xtype: 'combo',
                allowBlank: false,
                hasOwnTpl: true,
                hidden: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                },
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            pathologistHistology: {
                xtype: 'combo',
                allowBlank: true,
                hasOwnTpl: true,
                hidden: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                },
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }
            },
            pathologistReview: {
                xtype: 'combo',
                allowBlank: true,
                hasOwnTpl: true,
                hidden: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                },
                editorConfig: {
                    plugins: ['ldk-usereditablecombo']
                }

            },
            comments: {
                hidden: true // WNPRC uses remarks instead
            },
            assistant: {
                xtype: 'wnprc-multiselectfield',
                hasOwnTpl: true,
                delimiter: ",",
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'pathologists',
                    displayColumn: 'displayName',
                    keyColumn:     'UserId'
                },
                editorConfig: {
                    allowOtherValues: true
                }
            },
            objectid: {
                setInitialValue: function(v, rec) {
                    return v || LABKEY.Utils.generateUUID();
                }
            },
            causeofdeath: {
                allowBlank: false
            },
            nhpbmd: {
                hidden: true
            },
            histopathologic: {
                hidden: true
            },
            shipping: { /* Who delivers to necropsy */
                lookup: {
                    schemaName:    'wnprc',
                    queryName:     'necropsy_delivery_options',
                    keyColumn:     'key',
                    displayColumn: 'title'
                }
            },
            QCState: {
                hidden: true
            }
        },
        'study.MorphologicDiagnosis': {
            Id: {
                shownInGrid: false
            },
            date: {
                shownInGrid: false
            },
            tissue_qualifier: {
                shownInGrid: false
            },
            process: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: true,
                lookup : {
                    schemaName:    'ehr_lookups',
                    queryName:     'processSnomed',
                    displayColumn: 'processVal',
                    keyColumn:     'processVal'
                }
            },

            severity: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: false,
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'severitySnomed',
                    displayColumn: 'severityVal',
                    keyColumn:     'severityVal'
                }
            },
            duration: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: false,
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'durationSnomed',
                    displayColumn: 'durationVal',
                    keyColumn:     'durationVal'
                }
            },
            inflammation: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: false,
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'inflammationSnomed',
                    displayColumn: 'inflammationVal',
                    keyColumn:     'inflammationVal'
                }
            },
            inflammation2: {
                shownInGrid: false,
                hidden: true
            },
            distribution: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: false,
                lookup : {
                    schemaName:    'ehr_lookups',
                    queryName:     'distributionSnomed',
                    displayColumn: 'distributionVal',
                    keyColumn:     'distributionVal'
                }
            },
            distribution2: {
                shownInGrid: false,
                hidden: true
            },
            etiology: {
                xtype: 'wnprc-multiselectfield',
                shownInGrid: false,
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'etiologySnomed',
                    displayColumn: 'etiologyVal',
                    keyColumn:     'etiologyVal'
                }
            },
            project: {
                shownInGrid: false
            },
            performedby: {
                shownInGrid: false
            },
            process2: {
                shownInGrid: false,
                hidden: true
            },
            account: {
                shownInGrid: false,
                hidden: true
            }
        },
        'study.tissue_samples': {
            tissueRemarks: {
                hidden: false,
                shownInGrid: true
            },
            qualifier: {
                shownInGrid: true,
                hidden: false
            },
            trimdate: {
                shownInGrid: false
            },
            trimmed_by: {
                shownInGrid: false
            },
            trim_remarks: {
                shownInGrid: false
            },
            accountToCharge: {
                columnConfig: {
                    width: 150
                },
                noSaveInTemplateByDefault: true
            },
            pathologist: {
                shownInGrid: false
            },
            ship_to: {
                label: 'Sample Transfer',
                header: 'Sample Transfer',
                shownInGrid: true,
                lookup: {
                    schemaName:    'wnprc',
                    queryName:     'necropsy_tissue_sample_delivery_options',
                    keyColumn:     'key',
                    displayColumn: 'title'
                },
                columnConfig: {
                    width: 120
                }
            },
            ship_to_comment: {
                columnConfig: {
                    width: 200
                }
            },
            slideNum: {
                shownInGrid: true // WNPRC#4818
            },
            recipient: {
                shownInGrid: true
            },
            collect_before_death: {
                label: "Antemortem?",
                columnConfig: {
                    header: "AM?",
                    width: 50
                }
            },
            collection_order: {
                label: "Collection Order",
                columnConfig: {
                    header: "#",
                    width: 45
                }
            }
        },
        'study.histology': {
            Id: {
                shownInGrid: false
            },
            date: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            },
            trimdate: {
                shownInGrid: false
            },
            trimmed_by: {
                shownInGrid: false
            },
            account: {
                noSaveInTemplateByDefault: true
            }
        },
        'study.organ_weights': {
            weight: {
                editorConfig: {
                    // If you change this, make sure you change the renderer in columnConfig.
                    decimalPrecision: 5
                },
                columnConfig: {
                    renderer: function(val) {
                        // If you change this, make sure you change the decimalPrecision in editorConfig.
                        return Ext4.util.Format.number(val, '0.00000');
                    }
                }
            },
            tissue: {
                columnConfig: {
                    width: 300
                }
            },
            qualifier: {
                columnConfig: {
                    width: 175
                }
            },
            remark: {
                columnConfig: {
                    width: 600
                }
            }
        },
        'study.bcs': {
            score: {
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'body_condition_scores',
                    keyColumn:     'code',
                    displayColumn: 'display',
                    sort:          'code'
                }
            },
            QCState: {
                hidden: true
            }
        },
        'study.Alopecia': {
            score: {
                lookup: {
                    schemaName:    'ehr_lookups',
                    queryName:     'alopecia_scores',
                    keyColumn:     'code',
                    displayColumn: 'display',
                    sort:          'code'
                }
            }
        },
        'study.weight': {
            weight: {
                editorConfig: {
                    // If you change this, make sure you change the renderer in columnConfig.
                    decimalPrecision: 5
                },
                columnConfig: {
                    renderer: function(val) {
                        // If you change this, make sure you change the decimalPrecision in editorConfig.
                        return Ext4.util.Format.number(val, '0.00000');
                    }
                }
            },
            date: {
                hidden: false
            },
            QCState: {
                hidden: true
            },
            remark: {
                xtype: 'textfield',
                height: 20
            }
        }
    }
});