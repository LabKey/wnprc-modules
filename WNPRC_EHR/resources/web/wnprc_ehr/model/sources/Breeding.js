/**
 * @typedef {Object} EHR.model.DataModelManager
 * @prop registerMetadata
 */
EHR.model.DataModelManager.registerMetadata('Breeding.Columns', {
    byQuery: {
        'study.breeding_encounters': {
            Id:                     { columnConfig: { columnIndex: 1 } },
            sireid:                 { columnConfig: { columnIndex: 2 } },
            remark:                 { columnConfig: { columnIndex: 3, width: 400 } },
            ejaculation:            { columnConfig: { columnIndex: 4 } },
            project:                { columnConfig: { columnIndex: 5 } },
            performedby:            { columnConfig: { columnIndex: 6 } },
            date:                   { columnConfig: { columnIndex: 7 } }
        },
        'study.pregnancies': {
            Id:                     { columnConfig: { columnIndex: 1 } },
            sireid:                 { columnConfig: { columnIndex: 2 } },
            date_conception:        { columnConfig: { columnIndex: 3 } },
            date_due:               { columnConfig: { columnIndex: 4 } },
            remark:                 { columnConfig: { columnIndex: 5, width: 400 } },
            pregnancyid:            { columnConfig: { columnIndex: 6, width: 200 } },
            performedby:            { columnConfig: { columnIndex: 7 } },
            date:                   { columnConfig: { columnIndex: 8 } }
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