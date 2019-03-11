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
            performedby:                    { columnConfig: { columnIndex: 8 } }
        },
        'study.pregnancies': {
            Id:                             { columnConfig: { columnIndex:  1 } },
            sireid:                         { columnConfig: { columnIndex:  2 } },
            breedingencounterid:            { columnConfig: { columnIndex:  3, width: 200 } },
            date_conception:                { columnConfig: { columnIndex:  4, width: 200 } },
            date_due:                       { columnConfig: { columnIndex:  5, width: 200 } },
            remark:                         { columnConfig: { columnIndex:  6, width: 200 } },
            pregnancyid:                    { columnConfig: { columnIndex:  7, width: 200 } },
            performedby:                    { columnConfig: { columnIndex:  8 } },
            date:                           { columnConfig: { columnIndex:  9 } }
        },
        'study.pregnancy_outcomes':         {
            Id:                             { columnConfig: { columnIndex: 1 } },
            pregnancyid:                    { columnConfig: { columnIndex: 2, width: 200 } },
            outcome:                        { columnConfig: { columnIndex: 3 } },
            infantid:                       { columnConfig: { columnIndex: 4 } },
            project:                        { columnConfig: { columnIndex: 5 } },
            remark:                         { columnConfig: { columnIndex: 6, width: 400 } },
            performedby:                    { columnConfig: { columnIndex: 7 } },
            date:                           { columnConfig: { columnIndex: 8 } }
        },
        'study.ultrasounds': {
            Id:                             { columnConfig: { columnIndex:  1 } },
            date:                           { columnConfig: { columnIndex:  2 } },
            pregnancyid:                    { columnConfig: { columnIndex:  3, width: 200 } },
            project:                        { columnConfig: { columnIndex:  4 } },
            restraint:                      { columnConfig: { columnIndex:  5 } },
            fetal_heartbeat:                { columnConfig: { columnIndex:  6 } },
            beats_per_minute:               { columnConfig: { columnIndex:  7 } },
            beats_per_minute_gest_day:      { columnConfig: { columnIndex:  8 } },
            crown_rump_mm:                  { columnConfig: { columnIndex:  9 } },
            crown_rump_gest_day:            { columnConfig: { columnIndex: 10 } },
            head_circumference_mm:          { columnConfig: { columnIndex: 11 } },
            head_circumference_gest_day:    { columnConfig: { columnIndex: 12 } },
            femur_length_mm:                { columnConfig: { columnIndex: 13 } },
            femur_length_gest_day:          { columnConfig: { columnIndex: 14 } },
            biparietal_diameter_mm:         { columnConfig: { columnIndex: 15 } },
            biparietal_diameter_gest_day:   { columnConfig: { columnIndex: 16 } },
            code:                           { columnConfig: { columnIndex: 17 } },
            remark:                         { columnConfig: { columnIndex: 18, width: 150 } },
            performedby:                    { columnConfig: { columnIndex: 19 } },
            followup_required:              { columnConfig: { columnIndex: 20 } }
        }
    }
});

EHR.model.DataModelManager.registerMetadata('Breeding.Editors', {});

EHR.model.DataModelManager.registerMetadata('Breeding.Config', {
    byQuery: {
        'study.pregnancies': {
            breedingencounterid: {
                xtype: 'wnprc-breedingencounteridfield'
            },
            date_conception_early: {
                hidden: true
            },
            date_conception_late: {
                hidden: true
            },
            date_due_early: {
                hidden: true
            },
            date_due_late: {
                hidden: true
            }
        },
        'study.pregnancy_outcomes': {
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            },

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
            beats_per_minute_gest_day: {
                editorConfig: {
                    readOnly: true
                },
            },
            crown_rump_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true,
                }
            },
            crown_rump_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                editorConfig: {
                    readOnly: true
                },
            },
            head_circumference_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true
                }
            },
            head_circumference_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                editorConfig: {
                    readOnly: true,
                },
            },
            femur_length_mm: {
                editorConfig: {
                    plugins: ['wnprc-gestationcalculation'],
                    selectOnFocus: true
                }
            },
            femur_length_gest_day: {
                xtype: 'wnprc-calculatedgestationdayfield',
                editorConfig: {
                    readOnly: true,
                },
            },
            biparietal_diameter_mm: {
                editorConfig: {
                    selectOnFocus: true
                }
            },
            biparietal_diameter_gest_day: {
                editorConfig: {
                    readOnly: true,
                },
            },
        }
    }
});