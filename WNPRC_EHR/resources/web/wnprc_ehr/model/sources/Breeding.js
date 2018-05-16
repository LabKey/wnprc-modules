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