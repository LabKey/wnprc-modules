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
            date_conception_early:  { columnConfig: { columnIndex:  3 } },
            date_conception_late:   { columnConfig: { columnIndex:  4 } },
            date_due_early:         { columnConfig: { columnIndex:  5 } },
            date_due_late:          { columnConfig: { columnIndex:  6 } },
            remark:                 { columnConfig: { columnIndex:  7, width: 400 } },
            pregnancyid:            { columnConfig: { columnIndex:  8, width: 200 } },
            performedby:            { columnConfig: { columnIndex:  9 } },
            date:                   { columnConfig: { columnIndex: 10 } }
        },
        'study.pregnancy_outcomes': {
            Id:                     { columnConfig: { columnIndex: 1 } },
            outcome:                { columnConfig: { columnIndex: 2 } },
            remark:                 { columnConfig: { columnIndex: 3, width: 400 } },
            pregnancyid:            { columnConfig: { columnIndex: 4, width: 200 } },
            infantid:               { columnConfig: { columnIndex: 5 } },
            project:                { columnConfig: { columnIndex: 6 } },
            performedby:            { columnConfig: { columnIndex: 7 } },
            date:                   { columnConfig: { columnIndex: 8 } }
        },
        'study.ultrasounds': {
            Id:                     { columnConfig: { columnIndex:  1 } },
            remark:                 { columnConfig: { columnIndex:  2, width: 400 } },
            pregnancyid:            { columnConfig: { columnIndex:  3, width: 200 } },
            fetal_hearbeat:         { columnConfig: { columnIndex:  4 } },
            beats_per_minute:       { columnConfig: { columnIndex:  5 } },
            crown_rump_cm:          { columnConfig: { columnIndex:  6 } },
            head_circumference_cm:  { columnConfig: { columnIndex:  7 } },
            femur_length_cm:        { columnConfig: { columnIndex:  8 } },
            biparietal_diameter_cm: { columnConfig: { columnIndex:  9 } },
            project:                { columnConfig: { columnIndex: 10 } },
            restraint:              { columnConfig: { columnIndex: 11 } },
            performedby:            { columnConfig: { columnIndex: 12 } },
            date:                   { columnConfig: { columnIndex: 13 } }
        }
    }
});

EHR.model.DataModelManager.registerMetadata('Breeding.Editors', {});