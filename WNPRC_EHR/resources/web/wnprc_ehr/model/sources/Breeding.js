// noinspection JSUnresolvedVariable, JSUnresolvedFunction
/**
 * Metadata for the WNPRC EHR breeding parent records (i.e., breeding encounters).
 */
EHR.model.DataModelManager.registerMetadata('BreedingParentRecord', {
    allQueries: {
        reason: {
            defaultValue: '(Breeding Colony)',
            lookup:{
                schemaName:    'wnprc',
                queryName:     'BreedingReasonOptions',
                displayColumn: 'Name',
                keyColumn:     'Name'
            },
            label: 'Bred For (PI/Colony)'
        }
    }
});

// noinspection JSUnresolvedVariable, JSUnresolvedFunction
/**
 * Metadata for the WNPRC EHR breeding child records, such as breeding remarks and ultrasounds. These records
 * are dependent on a "parent" breeding encounter record, from which they will load the participant id (hence
 * the metadata configuration hides the id field on the child records)
 */
EHR.model.DataModelManager.registerMetadata('BreedingChildRecord', {
    allQueries: {
        Id: {
            hidden: true,
            shownInGrid: false
        }
    }
});
