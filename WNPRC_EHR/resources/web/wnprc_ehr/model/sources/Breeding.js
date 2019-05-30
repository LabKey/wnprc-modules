/**
 * @typedef {Object} EHR.model.DataModelManager
 * @prop registerMetadata
 */
EHR.model.DataModelManager.registerMetadata('Breeding.Columns', {
    byQuery: {
        'study.breeding_encounters': {
            Id:                             { columnConfig: { columnIndex: 1 } },
            sireid:                         { columnConfig: { columnIndex: 2 } },
            date:                           { columnConfig: { columnIndex: 3 } },
            enddate:                        { columnConfig: { columnIndex: 4 } },
            ejaculation:                    { columnConfig: { columnIndex: 5 } },
            project:                        { columnConfig: { columnIndex: 6 } },
            remark:                         { columnConfig: { columnIndex: 7, width: 400 } },
            performedby:                    { columnConfig: { columnIndex: 8 } },
            outcome:                        { columnConfig: { columnIndex: 9 } }
        },
        'study.pregnancies': {
            Id:                             { columnConfig: { columnIndex:  1 } },
            sireid:                         { columnConfig: { columnIndex:  2 } },
            breedingencounterid:            { columnConfig: { columnIndex:  3, width: 300 } },
            date_conception:                { columnConfig: { columnIndex:  4, width: 200 } },
            date_due:                       { columnConfig: { columnIndex:  5, width: 200 } },
            remark:                         { columnConfig: { columnIndex:  6, width: 200 } },
            pregnancyid:                    { columnConfig: { columnIndex:  7, width: 200 } },
            performedby:                    { columnConfig: { columnIndex:  8 } },
            date:                           { columnConfig: { columnIndex:  9 } }
        },
        'study.pregnancy_outcomes':         {
            Id:                             { columnConfig: { columnIndex:  1 } },
            date:                           { columnConfig: { columnIndex:  2 } },
            pregnancyid:                    { columnConfig: { columnIndex:  3, width: 200 } },
            outcome:                        { columnConfig: { columnIndex:  4 } },
            infantid:                       { columnConfig: { columnIndex:  5 } },
            rejected:                       { columnConfig: { columnIndex:  6, width: 150 } },
            protected:                      { columnConfig: { columnIndex:  7 } },
            project:                        { columnConfig: { columnIndex:  8 } },
            remark:                         { columnConfig: { columnIndex:  9, width: 400 } },
            performedby:                    { columnConfig: { columnIndex: 10 } }
        },
        'study.ultrasounds': {
            Id:                             { columnConfig: { columnIndex:  1 } },
            date:                           { columnConfig: { columnIndex:  2 } },
            pregnancyid:                    { columnConfig: { columnIndex:  3, width: 200 } },
            project:                        { columnConfig: { columnIndex:  4 } },
            restraint:                      { columnConfig: { columnIndex:  5 } },
            fetal_heartbeat:                { columnConfig: { columnIndex:  6 } },
            beats_per_minute:               { columnConfig: { columnIndex:  7 } },
            gest_sac_mm:                    { columnConfig: { columnIndex:  8, width: 150 } },
            crown_rump_mm:                  { columnConfig: { columnIndex:  9, width: 150 } },
            biparietal_diameter_mm:         { columnConfig: { columnIndex: 10, width: 150 } },
            femur_length_mm:                { columnConfig: { columnIndex: 11, width: 150 } },
            yolk_sac_diameter_mm:           { columnConfig: { columnIndex: 12, width: 150 } },
            head_circumference_mm:          { columnConfig: { columnIndex: 13, width: 150 } },
            code:                           { columnConfig: { columnIndex: 14 } },
            remark:                         { columnConfig: { columnIndex: 15, width: 150 } },
            performedby:                    { columnConfig: { columnIndex: 16 } },
            followup_required:              { columnConfig: { columnIndex: 17 } }
        }
    }
});

EHR.model.DataModelManager.registerMetadata('Breeding.Editors', {});

EHR.model.DataModelManager.registerMetadata('Breeding.Config', {
    byQuery: {
        'study.pregnancies': {
            breedingencounterid: {
                xtype: 'wnprc-breedingencounteridfield',
                editorConfig: {
                    plugins: ['wnprc-pregnancyduedatecalculation'],
                }
            },
            date_due: {
                xtype: 'wnprc-calculatedpregnancyduedatefield',
                editorConfig: {
                    plugins: ['wnprc-pregnancyduedatecalculation'],
                }
            },
            date_conception: {
                xtype: 'wnprc-calculatedpregnancyduedatefield',
                editorConfig: {
                    plugins: ['wnprc-pregnancyduedatecalculation'],
                }
            },
            date_conception_early: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be changed while hidden
                        render: function(field){
                            field.hide();
                        }
                    }
                },
                columnConfig: {
                    hidden: true
                }
            },
            date_conception_late: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be changed while hidden
                        render: function(field){
                            field.hide();
                        }
                    }
                },
                columnConfig: {
                    hidden: true
                }
            },
            date_due_early: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be changed while hidden
                        render: function(field){
                            field.hide();
                        }
                    }
                },
                columnConfig: {
                    hidden: true
                }
            },
            date_due_late: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        //hide field on render because if it's never rendered
                        //to the dom it won't be able to be changed while hidden
                        render: function(field){
                            field.hide();
                        }
                    }
                },
                columnConfig: {
                    hidden: true
                }
            }
        },
        'study.pregnancy_outcomes': {
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            },
            outcome: {
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'currentBirthTypes'
                }
            }
        },
        'study.ultrasounds': {
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            },
            beats_per_minute: {
                editorConfig: {
                    selectOnFocus: true
                }
            },
            gest_sac_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true,
                }
            },
            gest_sac_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                columnConfig: {
                    hidden: true
                }
            },
            crown_rump_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true,
                }
            },
            crown_rump_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                columnConfig: {
                    hidden: true
                }
            },
            biparietal_diameter_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true
                }
            },
            biparietal_diameter_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                columnConfig: {
                    hidden: true
                }
            },
            femur_length_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true
                }
            },
            femur_length_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                columnConfig: {
                    hidden: true
                }
            },
            yolk_sac_diameter_mm: {
                editorConfig: {
                    selectOnFocus: true
                }
            },
            head_circumference_mm: {
                editorConfig: {
                    selectOnFocus: true
                }
            },
            code: {
                //diagnostic ultrasound of abdomen and retroperitoneum, nos
                defaultValue: 'p5-bb320'
            }
        }
    }
});