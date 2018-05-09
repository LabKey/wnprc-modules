// noinspection JSUnresolvedVariable, JSUnresolvedFunction
/**
 * Metadata for the WNPRC EHR breeding parent records (i.e., breeding encounters).
 */
EHR.model.DataModelManager.registerMetadata('Breeding', {
    byQuery: {
        'study.breeding_encounters': {
            Id:             { columnConfig: { columnIndex: 1 } },
            sireid:         { columnConfig: { columnIndex: 2 } },
            remark:         { columnConfig: { columnIndex: 3, width: 400 } },
            ejaculation:    { columnConfig: { columnIndex: 4 } },
            performedby:    { columnConfig: { columnIndex: 5 } },
            date:           { columnConfig: { columnIndex: 6 } }
        },
        'study.pregnancies': {
            Id:             { columnConfig: { columnIndex: 1 } },
            sireid:         { columnConfig: { columnIndex: 2 } },
            date_conception:{ columnConfig: { columnIndex: 3 } },
            date_due:       { columnConfig: { columnIndex: 4 } },
            remark:         { columnConfig: { columnIndex: 5, width: 400 } },
            pregnancyid:    { columnConfig: { columnIndex: 6, width: 200 } },
            performedby:    { columnConfig: { columnIndex: 7 } },
            date:           { columnConfig: { columnIndex: 8 } }
        },
        'study.pregnancy_outcomes': {
            Id:             { columnConfig: { columnIndex: 1 } },
            outcome:        { columnConfig: { columnIndex: 2 } },
            remark:         { columnConfig: { columnIndex: 3, width: 400 } },
            pregnancyid:    { columnConfig: { columnIndex: 4, width: 200 } },
            infantid:       { columnConfig: { columnIndex: 5 } },
            offered_to:     { columnConfig: { columnIndex: 6 } },
            performedby:    { columnConfig: { columnIndex: 7 } },
            date:           { columnConfig: { columnIndex: 8 } }
        },
        'study.ultrasounds': {
            Id:             { columnConfig: { columnIndex: 1 } },
            remark:         { columnConfig: { columnIndex: 2, width: 400 } },
            pregnancyid:    { columnConfig: { columnIndex: 3, width: 200 } },
            performedby:    { columnConfig: { columnIndex: 4 } },
            date:           { columnConfig: { columnIndex: 5 } }
        },
    }
});