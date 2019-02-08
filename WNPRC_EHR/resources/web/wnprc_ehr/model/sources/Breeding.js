/**
 * @typedef {Object} EHR.model.DataModelManager
 * @prop registerMetadata
 */
EHR.model.DataModelManager.registerMetadata('Breeding.Columns', {
    byQuery: {
        'study.breeding_encounters': {
            Id:                     { columnConfig: { columnIndex: 1 } },
            sireid:                 { columnConfig: { columnIndex: 2 } },
            date:                   { columnConfig: { columnIndex: 3 } },
            enddate:                { columnConfig: { columnIndex: 4 } },
            ejaculation:            { columnConfig: { columnIndex: 5 } },
            project:                { columnConfig: { columnIndex: 6 } },
            remark:                 { columnConfig: { columnIndex: 7, width: 400 } },
            performedby:            { columnConfig: { columnIndex: 8 } }
        },
        'study.pregnancies': {
            Id:                     { columnConfig: { columnIndex:  1 } },
            sireid:                 { columnConfig: { columnIndex:  2 } },
            date_conception_early:  { columnConfig: { columnIndex:  3, width: 200 } },
            date_conception_late:   { columnConfig: { columnIndex:  4, width: 200 } },
            date_due_early:         { columnConfig: { columnIndex:  5, width: 200 } },
            date_due_late:          { columnConfig: { columnIndex:  6, width: 200 } },
            remark:                 { columnConfig: { columnIndex:  7, width: 200 } },
            pregnancyid:            { columnConfig: { columnIndex:  8, width: 200 } },
            performedby:            { columnConfig: { columnIndex:  9 } },
            date:                   { columnConfig: { columnIndex: 10 } }
        },
        'study.pregnancy_outcomes': {
            Id:                     { columnConfig: { columnIndex: 1 } },
            pregnancyid:            { columnConfig: { columnIndex: 2, width: 200 } },
            outcome:                { columnConfig: { columnIndex: 3 } },
            infantid:               { columnConfig: { columnIndex: 4 } },
            project:                { columnConfig: { columnIndex: 5 } },
            remark:                 { columnConfig: { columnIndex: 6, width: 400 } },
            performedby:            { columnConfig: { columnIndex: 7 } },
            date:                   { columnConfig: { columnIndex: 8 } }
        },
        'study.ultrasounds': {
            Id:                     { columnConfig: { columnIndex:  1 } },
            date:                   { columnConfig: { columnIndex:  2 } },
            pregnancyid:            { columnConfig: { columnIndex:  3, width: 200 } },
            project:                { columnConfig: { columnIndex:  4 } },
            fetal_heartbeat:        { columnConfig: { columnIndex:  5 } },
            beats_per_minute:       { columnConfig: { columnIndex:  6 } },
            crown_rump_cm:          { columnConfig: { columnIndex:  7 } },
            head_circumference_cm:  { columnConfig: { columnIndex:  8 } },
            femur_length_cm:        { columnConfig: { columnIndex:  9 } },
            biparietal_diameter_cm: { columnConfig: { columnIndex: 10 } },
            restraint:              { columnConfig: { columnIndex: 11 } },
            code:                   { columnConfig: { columnIndex: 12 } },
            remark:                 { columnConfig: { columnIndex: 13, width: 200 } },
            performedby:            { columnConfig: { columnIndex: 14 } }
        }
    }
});

EHR.model.DataModelManager.registerMetadata('Breeding.Editors', {});

EHR.model.DataModelManager.registerMetadata('Breeding.Config', {
    byQuery: {
        'study.pregnancy_outcomes': {
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            }
        },
        'study.ultrasounds': {
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            }
        }
    }
});